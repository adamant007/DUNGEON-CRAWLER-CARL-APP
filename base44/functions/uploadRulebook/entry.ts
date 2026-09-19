import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';

/* Rulebook private upload (Rulebook System Step 1 fix). The BROWSER-side
   Core.UploadPrivateFile call proved unreliable — the same class of
   browser integration flakiness already solved for portraits by
   forgePortrait — so the file now travels through this backend function.
   The SDK wraps the File as multipart form-data; here it is stored via
   Base44's PRIVATE file storage using the CALLING USER's own token:
   owner-only access, no public URL, no download links. STORAGE ONLY —
   no parsing, OCR, AI analysis, extraction, or Rules Profile generation
   happens at this stage. */
export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const contentType = req.headers.get('content-type') ?? '';
    if (!contentType.includes('multipart/form-data')) {
      return Response.json({ error: 'Expected a multipart file upload.' }, { status: 400 });
    }
    const form = await req.formData();
    const file = form.get('file');
    if (!file || typeof file === 'string') {
      return Response.json({ error: 'No file was received.' }, { status: 400 });
    }

    /* PDFs only at this stage — no other file types yet. */
    const name = file.name ?? 'rulebook.pdf';
    const type = file.type ?? '';
    if (!type.includes('pdf') && !name.toLowerCase().endsWith('.pdf')) {
      return Response.json({ error: 'Only PDF rulebooks are supported for now.' }, { status: 400 });
    }

    /* Re-wrap the received blob as a File for the private storage call. */
    const storedFile = new File([file], name, { type: type || 'application/pdf' });
    const { file_uri } = await base44.integrations.Core.UploadPrivateFile({ file: storedFile });
    if (!file_uri) {
      return Response.json({ error: 'Private storage did not return a file reference.' }, { status: 500 });
    }

    return Response.json({
      file_uri,
      original_filename: name,
      mime_type: type || 'application/pdf',
      file_size: typeof file.size === 'number' ? file.size : null,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}