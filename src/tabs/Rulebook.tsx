import { useState } from 'react';
import { Card } from '../components/ui';

export default function Rulebook() {
  const [pdfName, setPdfName] = useState('');
  const [pages, setPages] = useState<{ page: number; text: string }[]>([]);
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState<{ page: number; text: string }[]>([]);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState({ done: 0, total: 0 });
  const [error, setError] = useState('');

  const upload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    setError('');
    setAnswer([]);
    setPages([]);
    setPdfName(file.name);
    setProgress({ done: 0, total: 0 });
    try {
      if (!file.name.toLowerCase().endsWith('.pdf')) throw new Error('Please choose a file ending in .pdf.');
      const buf = await file.arrayBuffer();
      if (buf.byteLength < 5) throw new Error('The selected file is empty.');
      const signature = String.fromCharCode(...new Uint8Array(buf.slice(0, 8)));
      if (!signature.startsWith('%PDF-')) throw new Error('The selected file does not contain a valid PDF header.');
      const pdfjsLib = await import('pdfjs-dist');
      pdfjsLib.GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url).toString();
      const pdf = await pdfjsLib.getDocument({ data: buf }).promise;
      const total = pdf.numPages;
      setProgress({ done: 0, total });
      const extracted: { page: number; text: string }[] = [];
      for (let i = 1; i <= total; i++) {
        const pg = await pdf.getPage(i);
        const content = await pg.getTextContent();
        const text = content.items
          .map((it: any) => ('str' in it ? it.str : ''))
          .join(' ')
          .replace(/\s+/g, ' ')
          .trim();
        if (text) extracted.push({ page: i, text });
        setProgress({ done: i, total });
        await new Promise((r) => setTimeout(r, 0));
      }
      setPages(extracted);
      if (!extracted.length) setError('The PDF opened successfully, but it contains no selectable text (likely a scanned/image-only PDF).');
    } catch (err) {
      console.log('[v0] Rulebook PDF error:', err);
      setError(`Could not read this PDF. ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setBusy(false);
    }
  };

  const search = () => {
    const q = question.trim().toLowerCase();
    if (!q || !pages.length) return;
    const words = q.split(/[^a-z0-9]+/).filter((w) => w.length > 2);
    const scored = pages
      .map((p) => {
        const low = p.text.toLowerCase();
        let score = 0;
        for (const w of words) score += (low.match(new RegExp(w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length;
        return { ...p, score };
      })
      .filter((x) => x.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);
    setAnswer(scored.map(({ page, text }) => ({ page, text })));
  };

  return (
    <>
      <section className="section-head">
        <div>
          <h2>Rulebook Assistant</h2>
          <p>Upload your own licensed PDF. The app searches it locally and shows source text.</p>
        </div>
        <span className="pill">{pdfName ? `Loaded: ${pdfName}` : 'No book loaded'}</span>
      </section>

      <Card title="Upload Core Rulebook">
        <label className="upload">
          Choose PDF
          <input type="file" accept="application/pdf" onChange={upload} />
        </label>
        {busy && (
          <div className="progress">
            <div style={{ width: `${progress.total ? (progress.done / progress.total) * 100 : 0}%` }} />
            <span>
              Reading page {progress.done} of {progress.total}…
            </span>
          </div>
        )}
        {pages.length > 0 && <p className="success">Loaded {pages.length} pages with selectable text.</p>}
        {error && <p className="error">{error}</p>}
        <p className="hint">The app does not bundle the copyrighted rulebook; the GM supplies their own licensed copy.</p>
      </Card>

      <Card title="Ask the Rulebook">
        <label className="field">
          <span>Your question</span>
          <textarea className="question" placeholder="How does this rule work?" value={question} onChange={(e) => setQuestion(e.target.value)} />
        </label>
        <button disabled={!pages.length || busy || !question.trim()} onClick={search}>
          Ask Question
        </button>
        {answer.length > 0 && (
          <div className="answerbox">
            <h4>Source Text From Your Rulebook</h4>
            <p className="hint">The text below is copied from the uploaded document; page numbers are included so you can verify it.</p>
            {answer.map((r, i) => (
              <div className="source" key={i}>
                <b>Page {r.page}</b>
                <textarea readOnly value={r.text} />
              </div>
            ))}
          </div>
        )}
        {question && pages.length > 0 && !busy && !answer.length && <p className="muted">No matching passage found. Try different wording.</p>}
      </Card>
    </>
  );
}
