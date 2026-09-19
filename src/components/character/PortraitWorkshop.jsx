import React, { useEffect, useRef, useState } from "react";
import { Upload, Wand2, X, Loader2, Trash2, Palette, Flame } from "lucide-react";
import { base44 } from "@/api/base44Client";
import CustomizeDrawer from "@/components/character/CustomizeDrawer";
import MakeCrawlerDrawer from "@/components/character/MakeCrawlerDrawer";
import RepositionDrawer from "@/components/character/RepositionDrawer";

const DEFAULT_SETTINGS = { offsetX: 0, offsetY: 0, scale: 1 };

/* Temporary switch — Customize stays hidden until the portrait image
   editing backend is connected. All customization code, option data and
   reference artwork are preserved; flip to true to restore the button. */
const SHOW_CUSTOMIZE = false;

/**
 * Compact parchment drawer physically attached to the portrait box.
 * Slides out horizontally from the portrait's right edge. Closes on X,
 * Cancel, Escape, or a click outside. Customize opens a
 * second attached drawer to this drawer's right; only one second-stage
 * drawer is open at a time, and closing it returns here. Reposition / Zoom
 * opens from Customize the same way and drives the sheet portrait live.
 */
export default function PortraitWorkshop({
  portraitUrl,
  onSave,
  onClose,
  onPreview,
  onDelete,
  settings,
  onSettingsChange,
  onFit,
  onRepositionActive,
  customization,
  onCustomizationChange,
}) {
  const fileRef = useRef(null);
  const wrapperRef = useRef(null);
  const [draft, setDraft] = useState(portraitUrl);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [subDrawer, setSubDrawer] = useState(null); // "customize" | "reposition"

  useEffect(() => {
    setDraft(portraitUrl);
  }, [portraitUrl]);

  // Reposition mode — the sheet portrait becomes draggable while active.
  useEffect(() => {
    onRepositionActive?.(subDrawer === "reposition");
  }, [subDrawer, onRepositionActive]);

  useEffect(() => {
    const onPointerDown = (e) => {
      // The portrait itself (and the photo being dragged in it) is the
      // trigger — let its own click toggle / drag pass through.
      if (e.target.closest?.("[data-portrait-trigger]")) return;
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) onClose();
    };
    const onKeyDown = (e) => {
      if (e.key !== "Escape") return;
      // Escape closes the second-stage drawer first, then the workshop.
      if (subDrawer) setSubDrawer(null);
      else onClose();
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [onClose, subDrawer]);

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      // UploadPublicFile — permanent, world-readable storage. The returned
      // file_url is the durable URL saved into the character record (what
      // refresh and re-login later load). A failure here keeps the previous
      // portrait untouched: only the draft/preview change on success.
      const { file_url } = await base44.integrations.Core.UploadPublicFile({ file });
      setDraft(file_url);
      // Fresh photo starts centered at 1x.
      onSettingsChange?.(DEFAULT_SETTINGS);
      // Live preview — show the photo in the portrait opening immediately.
      onPreview?.(file_url);
    } catch {
      setError("Upload failed — please try again.");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const toggleSub = (which) => setSubDrawer((cur) => (cur === which ? null : which));

  const confirmAndDelete = () => {
    setConfirmDelete(false);
    onDelete?.();
    onClose();
  };

  return (
    <div
      ref={wrapperRef}
      className="portrait-workshop-wrap absolute z-40 ml-1 w-[95%] max-w-[340px]"
      style={{ position: "absolute", top: 0, left: "100%", height: "100%" }}
    >
      {/* Main drawer panel */}
      <div
        role="dialog"
        aria-label="Portrait Workshop"
        className="parchment portrait-drawer flex h-full w-full flex-col gap-1 overflow-hidden p-2"
      >
        {/* Title + close */}
        <div className="flex items-center justify-between gap-2">
          <h4 className="section-title text-[9px]">Portrait Workshop</h4>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="ink-box flex h-5 w-5 shrink-0 items-center justify-center"
          >
            <X size={11} />
          </button>
        </div>

        {/* Actions */}
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
        <button
          type="button"
          disabled={uploading}
          onClick={() => fileRef.current?.click()}
          className="ink-box flex items-center justify-center gap-1.5 px-2 py-1 text-[10px] disabled:opacity-60"
        >
          {uploading ? <Loader2 size={11} className="animate-spin" /> : <Upload size={11} />}
          {uploading ? "Uploading..." : "Upload Photo"}
        </button>
        {error && (
          <p className="text-center font-fell italic text-[10px]" style={{ color: "var(--hp)" }}>
            {error}
          </p>
        )}
        <button
          type="button"
          onClick={() => toggleSub("make-crawler")}
          className="ink-box flex items-center justify-center gap-1.5 px-2 py-1 text-[10px]"
          style={{ color: "var(--hp)" }}
        >
          <Flame size={11} />
          Make Me a Crawler
        </button>
        <button
          type="button"
          onClick={() => toggleSub("reposition")}
          className="ink-box flex items-center justify-center gap-1.5 px-2 py-1 text-[10px]"
        >
          <Wand2 size={11} />
          Reposition Photo
        </button>
        {SHOW_CUSTOMIZE && (
          <button
            type="button"
            onClick={() => toggleSub("customize")}
            className="ink-box flex items-center justify-center gap-1.5 px-2 py-1 text-[10px]"
          >
            <Palette size={11} />
            Customize
          </button>
        )}
        <button
          type="button"
          onClick={() => setConfirmDelete(true)}
          className="ink-box flex items-center justify-center gap-1.5 px-2 py-1 text-[10px]"
          style={{ color: "var(--hp)" }}
        >
          <Trash2 size={11} />
          Delete Photo
        </button>
        {confirmDelete && (
          <div className="flex flex-wrap items-center justify-center gap-1.5">
            <span className="font-fell italic text-[10px]">Delete this photo?</span>
            <button type="button" onClick={confirmAndDelete} className="ink-box px-2 py-1 text-[9px]" style={{ color: "var(--hp)" }}>
              Yes, Delete
            </button>
            <button type="button" onClick={() => setConfirmDelete(false)} className="ink-box px-2 py-1 text-[9px]">
              Keep
            </button>
          </div>
        )}

        {/* Save / Cancel */}
        <div className="mt-auto flex justify-end gap-1.5 pt-1">
          <button type="button" onClick={onClose} className="ink-box px-2.5 py-1 text-[10px]">
            Cancel
          </button>
          <button
            type="button"
            disabled={!draft}
            onClick={() => {
              onSave(draft);
              onClose();
            }}
            className="nameplate px-2.5 py-1 font-display text-[10px] font-bold text-[#f0e2c8] disabled:opacity-60"
          >
            Save
          </button>
        </div>
      </div>

      {/* Second-stage drawers — attached to this drawer's right edge */}
      {subDrawer === "make-crawler" && (
        <MakeCrawlerDrawer
          sourceUrl={draft}
          portraitType={customization?.portraitType || "male"}
          onApply={(url) => {
            setDraft(url);
            // Freshly forged portrait starts centered — same flow as an upload.
            onSettingsChange?.(DEFAULT_SETTINGS);
            onPreview?.(url);
          }}
          onClose={() => setSubDrawer(null)}
        />
      )}
      {subDrawer === "customize" && (
        <CustomizeDrawer
          customization={customization}
          onCustomizationChange={onCustomizationChange}
          settings={settings}
          onChange={onSettingsChange}
          onClose={() => setSubDrawer(null)}
        />
      )}
      {subDrawer === "reposition" && (
        <RepositionDrawer settings={settings} onChange={onSettingsChange} onFit={onFit} onClose={() => setSubDrawer(null)} />
      )}
    </div>
  );
}