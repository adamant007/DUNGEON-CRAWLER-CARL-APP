import React, { useRef, useState } from "react";
import { Flame, X, Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";

/**
 * Make Me a Crawler — second-stage parchment drawer attached to the
 * Portrait Workshop's right edge. Generates a fantasy crawler portrait
 * FROM the current photo (uploaded or previously generated), previews it
 * live in the portrait opening, and leaves Save/Cancel untouched — the
 * user keeps it only if they press Save, exactly like an upload.
 */
export default function MakeCrawlerDrawer({ sourceUrl, portraitType, onApply, onClose }) {
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");
  const onApplyRef = useRef(onApply);
  onApplyRef.current = onApply;

  /* The generation runs through the forgePortrait backend function —
     the browser call failed persistently while server-side generation
     is reliable. The real error is logged for diagnosis. */
  const generate = async () => {
    setGenerating(true);
    setError("");
    try {
      const response = await base44.functions.invoke("forgePortrait", { sourceUrl, portraitType });
      onApplyRef.current(response.data.url);
    } catch (e) {
      console.error("Forge failed:", e);
      setError("The forge went cold — please try again.");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-label="Make Me a Crawler"
      className="parchment portrait-drawer portrait-sub-drawer absolute left-full top-0 z-40 ml-1 flex h-full w-[95%] max-w-[340px] flex-col gap-1.5 overflow-hidden p-2"
    >
      {/* Title + close */}
      <div className="flex items-center justify-between gap-2">
        <h4 className="section-title text-[9px]">Make Me a Crawler</h4>
        <button
          type="button"
          aria-label="Close"
          onClick={onClose}
          className="ink-box flex h-5 w-5 shrink-0 items-center justify-center"
        >
          <X size={11} />
        </button>
      </div>

      <p className="text-center font-fell italic text-[10px] leading-snug">
        Forge your photo into a fantasy crawler portrait.
      </p>

      {/* Generate — needs a photo to work from */}
      {sourceUrl ? (
        <button
          type="button"
          disabled={generating}
          onClick={generate}
          className="ink-box flex items-center justify-center gap-1.5 px-3 py-2.5 text-[11px] disabled:opacity-60"
        >
          {generating ? <Loader2 size={14} className="animate-spin" /> : <Flame size={14} />}
          {generating ? "Forging..." : "Forge My Portrait"}
        </button>
      ) : (
        <p className="text-center font-fell italic text-[10px] leading-snug">
          Upload a photo first — the forge needs a face to work from.
        </p>
      )}

      {error && (
        <p className="text-center font-fell italic text-[10px]" style={{ color: "var(--hp)" }}>
          {error}
        </p>
      )}

      <div className="mt-auto pt-1">
        <button
          type="button"
          onClick={onClose}
          className="ink-box flex w-full items-center justify-center gap-1.5 px-3 py-2.5 text-[11px]"
        >
          Back
        </button>
      </div>
    </div>
  );
}