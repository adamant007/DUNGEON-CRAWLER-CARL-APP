import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';
import { extractText, getDocumentProxy } from 'npm:unpdf@1.8.1';

/* Rulebook Processing — Step 2A: PRIVATE PDF ingestion + faithful text
   extraction ONLY. No AI, no summarization, no rewriting, no translation,
   no Rules Profile generation. The uploaded PDF is the user's private
   source document; the extracted text is ALSO private user data.

   Flow:  Rulebook (uploaded) → ProcessingJob (queued → extracting) →
          per-page text extraction → RulebookExtraction chunks stored →
          ProcessingJob (extraction_complete) → Rulebook (extraction_complete).

   On failure: job + rulebook marked "failed" with a stored error message.
   The source file is never deleted. No partial Rules Profile is created.

   Reprocessing: previous extraction chunks are deleted and replaced;
   processing_version is incremented. A later existing Rules Profile is
   never touched by this stage. */
export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const rulebook_id = body?.rulebook_id;
    if (!rulebook_id) return Response.json({ error: 'Missing rulebook id.' }, { status: 400 });

    // Fetch the rulebook — user-scoped (RLS guarantees ownership).
    const rulebook = await base44.entities.Rulebook.get(rulebook_id);
    if (!rulebook) return Response.json({ error: 'Rulebook not found.' }, { status: 404 });
    if (!rulebook.file_url) {
      return Response.json({ error: 'No source file has been uploaded for this rulebook.' }, { status: 400 });
    }

    // Increment processing version on each (re)process.
    const currentVersion = typeof rulebook.processing_version === 'number' ? rulebook.processing_version : 0;
    const nextVersion = currentVersion + 1;

    // Create the processing job — queued.
    const job = await base44.entities.RulebookProcessingJob.create({
      rulebook_id,
      status: 'queued',
      stage: 'upload',
      started_at: new Date().toISOString(),
      processing_version: nextVersion,
      schema_version: 1,
    });

    // Rulebook → processing.
    await base44.entities.Rulebook.update(rulebook_id, {
      status: 'processing',
      processing_version: nextVersion,
    });

    // Job → extracting.
    await base44.entities.RulebookProcessingJob.update(job.id, {
      status: 'extracting',
      stage: 'text_extraction',
    });

    try {
      // Short-lived signed URL for the private PDF (owner-only).
      const { signed_url } = await base44.integrations.Core.CreateFileSignedUrl({
        file_uri: rulebook.file_url,
        expires_in: 120,
      });
      if (!signed_url) throw new Error('Could not generate a download URL for the source file.');

      // Download the PDF bytes.
      const fileResp = await fetch(signed_url);
      if (!fileResp.ok) throw new Error(`Failed to download source file (HTTP ${fileResp.status}).`);
      const pdfBuffer = await fileResp.arrayBuffer();
      const pdfData = new Uint8Array(pdfBuffer);

      // Faithful per-page text extraction (no AI, no summarization).
      const pdf = await getDocumentProxy(pdfData);
      const { totalPages, text } = await extractText(pdf, { mergePages: false });
      const pages = Array.isArray(text) ? text : [text];

      // Aggregate and verify sufficient machine-readable text.
      let totalChars = 0;
      const cleanedPages = [];
      for (const p of pages) {
        const t = (p || '').trim();
        cleanedPages.push(t);
        totalChars += t.length;
      }
      if (totalChars < 50) {
        throw new Error('This PDF may contain scanned pages that require OCR. OCR support will be added separately.');
      }

      // Remove any previous extraction chunks for this rulebook (reprocess).
      const existing = await base44.entities.RulebookExtraction.filter({ rulebook_id }, null, 1000);
      if (existing.length > 0) {
        await base44.entities.RulebookExtraction.deleteMany({ rulebook_id });
      }

      // Build extraction chunks — one or more per page, preserving page order.
      const MAX_CHUNK = 8000;
      const chunks = [];
      for (let p = 0; p < cleanedPages.length; p++) {
        const pageText = cleanedPages[p];
        if (!pageText) continue;
        let sectionIndex = 0;
        for (let i = 0; i < pageText.length; i += MAX_CHUNK) {
          const chunkText = pageText.slice(i, i + MAX_CHUNK);
          chunks.push({
            rulebook_id,
            processing_job_id: job.id,
            page_number: p + 1,
            section_index: sectionIndex,
            text: chunkText,
            character_count: chunkText.length,
            processing_version: nextVersion,
            schema_version: 1,
          });
          sectionIndex++;
        }
      }
      if (chunks.length === 0) {
        throw new Error('No readable text could be extracted from this PDF.');
      }

      // Persist extraction chunks privately.
      await base44.entities.RulebookExtraction.bulkCreate(chunks);

      // Job → extraction_complete.
      await base44.entities.RulebookProcessingJob.update(job.id, {
        status: 'extraction_complete',
        stage: 'complete',
        completed_at: new Date().toISOString(),
      });

      // Rulebook → extraction_complete (awaiting rule extraction, NOT ready).
      await base44.entities.Rulebook.update(rulebook_id, { status: 'extraction_complete' });

      return Response.json({
        success: true,
        job_id: job.id,
        summary: {
          page_count: totalPages,
          chunk_count: chunks.length,
          total_characters: totalChars,
        },
      });
    } catch (extractError) {
      // Mark job and rulebook as failed — never delete the source file.
      const msg = extractError?.message || 'Unknown extraction error.';
      await base44.entities.RulebookProcessingJob.update(job.id, {
        status: 'failed',
        error_message: msg,
        completed_at: new Date().toISOString(),
      });
      await base44.entities.Rulebook.update(rulebook_id, { status: 'failed' });
      return Response.json({ error: msg }, { status: 500 });
    }
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}