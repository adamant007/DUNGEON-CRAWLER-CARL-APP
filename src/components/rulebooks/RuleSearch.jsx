import React, { useRef, useState } from "react";
import { BookOpen, Loader2, Search, X } from "lucide-react";
import { base44 } from "@/api/base44Client";

const MAX_RESULTS = 30;
const MAX_SNIPPET = 320;

const clean = (value) => String(value ?? "").replace(/\s+/g, " ").trim();

function occurrenceCount(text, needle) {
  if (!needle) return 0;
  let count = 0;
  let from = 0;
  while (from < text.length) {
    const at = text.indexOf(needle, from);
    if (at < 0) break;
    count += 1;
    from = at + Math.max(needle.length, 1);
  }
  return count;
}

function matchChunk(text, query) {
  const source = clean(text);
  const lower = source.toLowerCase();
  const q = clean(query).toLowerCase();
  const terms = q.split(/\s+/).filter(Boolean);
  if (!q || !terms.length) return null;

  const phraseAt = lower.indexOf(q);
  const allTerms = terms.every((term) => lower.includes(term));
  if (phraseAt < 0 && !allTerms) return null;

  const anchor =
    phraseAt >= 0
      ? phraseAt
      : Math.min(...terms.map((term) => lower.indexOf(term)).filter((n) => n >= 0));

  const phraseHits = phraseAt >= 0 ? occurrenceCount(lower, q) : 0;
  const termHits = terms.reduce((sum, term) => sum + occurrenceCount(lower, term), 0);
  const score = phraseHits * 50 + termHits * 4;

  const half = Math.floor(MAX_SNIPPET / 2);
  const start = Math.max(0, anchor - half);
  const end = Math.min(source.length, start + MAX_SNIPPET);
  return {
    score,
    snippet: `${start > 0 ? "…" : ""}${source.slice(start, end)}${end < source.length ? "…" : ""}`,
  };
}

/* Private rule search. It searches only text extracted from rulebooks owned by
   the signed-in user; the browser never embeds or publishes rulebook text.
   A small in-memory index is cached for the current page session. */
export default function RuleSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [state, setState] = useState("idle"); // idle | loading | ready | empty | error
  const [message, setMessage] = useState("");
  const indexRef = useRef(null);

  const loadIndex = async () => {
    if (indexRef.current) return indexRef.current;

    const [books, chunks] = await Promise.all([
      base44.entities.Rulebook.list("-created_date", 100),
      base44.entities.RulebookExtraction.list("created_date", 5000),
    ]);

    const readyBooks = (books ?? []).filter((book) => book.status === "extraction_complete");
    const byId = Object.fromEntries(readyBooks.map((book) => [book.id, book]));
    const index = (chunks ?? [])
      .filter((chunk) => byId[chunk.rulebook_id] && clean(chunk.text))
      .map((chunk) => ({
        id: chunk.id,
        rulebookId: chunk.rulebook_id,
        title: byId[chunk.rulebook_id]?.title || "Rulebook",
        system: byId[chunk.rulebook_id]?.system_name || "",
        page: chunk.page_number ?? null,
        section: chunk.section_index ?? null,
        text: chunk.text,
      }));

    indexRef.current = { readyBooks, chunks: index };
    return indexRef.current;
  };

  const runSearch = async (event) => {
    event?.preventDefault();
    const q = clean(query);
    if (q.length < 2) {
      setState("empty");
      setResults([]);
      setMessage("Type at least 2 characters.");
      return;
    }

    setState("loading");
    setMessage("");
    try {
      const index = await loadIndex();
      if (!index.readyBooks.length) {
        setState("empty");
        setResults([]);
        setMessage("Process a rulebook first, then its extracted rules will be searchable here.");
        return;
      }

      const hits = [];
      for (const chunk of index.chunks) {
        const match = matchChunk(chunk.text, q);
        if (!match) continue;
        hits.push({ ...chunk, ...match });
      }

      hits.sort(
        (a, b) =>
          b.score - a.score ||
          a.title.localeCompare(b.title) ||
          Number(a.page ?? 999999) - Number(b.page ?? 999999)
      );

      const trimmed = hits.slice(0, MAX_RESULTS);
      setResults(trimmed);
      setState(trimmed.length ? "ready" : "empty");
      setMessage(
        trimmed.length
          ? `${hits.length} match${hits.length === 1 ? "" : "es"} found${hits.length > MAX_RESULTS ? `; showing the best ${MAX_RESULTS}` : ""}.`
          : `No extracted rule text matched “${q}”.`
      );
    } catch (error) {
      setResults([]);
      setState("error");
      setMessage(error?.message || "Couldn’t search your rulebooks.");
    }
  };

  const clear = () => {
    setQuery("");
    setResults([]);
    setState("idle");
    setMessage("");
  };

  return (
    <section className="mb-4 border-[1.5px] border-[var(--ink-soft)] bg-[rgba(255,248,220,0.2)] p-3">
      <div className="mb-2 flex items-center gap-2">
        <BookOpen size={17} className="text-[#24180f]" aria-hidden="true" />
        <div>
          <h2 className="section-title text-[15px]">Search Rules</h2>
          <p className="font-fell text-[11px] italic text-[var(--ink-soft)]">
            Searches your private extracted rulebooks. Results show short excerpts and page numbers.
          </p>
        </div>
      </div>

      <form onSubmit={runSearch} className="flex gap-2">
        <label className="sr-only" htmlFor="rule-search-input">Search your rulebooks</label>
        <div className="ink-box flex min-w-0 flex-1 items-center gap-2 px-2">
          <Search size={15} className="shrink-0 text-[var(--ink-soft)]" aria-hidden="true" />
          <input
            id="rule-search-input"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Tactics, AI Favor, Held, Evade…"
            className="min-w-0 flex-1 bg-transparent py-2 font-garamond text-[15px] text-[#24180f] outline-none placeholder:text-[var(--ink-faint)]"
          />
          {query && (
            <button type="button" onClick={clear} aria-label="Clear rule search" className="p-1">
              <X size={14} aria-hidden="true" />
            </button>
          )}
        </div>
        <button
          type="submit"
          disabled={state === "loading"}
          className="nameplate min-w-[92px] px-3 py-2 font-display text-[12px] font-bold text-[#f0e2c8] disabled:opacity-60"
        >
          {state === "loading" ? (
            <span className="flex items-center justify-center gap-1.5">
              <Loader2 size={13} className="animate-spin" /> SEARCH
            </span>
          ) : (
            "SEARCH"
          )}
        </button>
      </form>

      {message && (
        <p
          className={`mt-2 font-fell text-[12px] italic ${
            state === "error" ? "text-[var(--hp)]" : "text-[var(--ink-soft)]"
          }`}
        >
          {message}
        </p>
      )}

      {results.length > 0 && (
        <div className="mt-3 max-h-[52vh] space-y-2 overflow-y-auto pr-1">
          {results.map((result, index) => (
            <article
              key={`${result.id || result.rulebookId}-${result.page ?? "p"}-${result.section ?? index}-${index}`}
              className="border border-[var(--rule)] bg-[rgba(255,248,220,0.25)] px-3 py-2"
            >
              <div className="mb-1 flex flex-wrap items-baseline justify-between gap-2">
                <strong className="font-fell text-[13px] text-[#24180f]">{result.title}</strong>
                <span className="field-label text-[9px]">
                  {result.page != null ? `PAGE ${result.page}` : "PAGE —"}
                </span>
              </div>
              {result.system && (
                <p className="mb-1 font-fell text-[10px] italic text-[var(--ink-soft)]">{result.system}</p>
              )}
              <p className="font-garamond text-[13px] leading-snug text-[#24180f]">{result.snippet}</p>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
