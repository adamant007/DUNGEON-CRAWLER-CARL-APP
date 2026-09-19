import React, { useEffect, useRef, useState } from "react";
import PortraitWorkshop from "@/components/character/PortraitWorkshop";
import { DEFAULT_CUSTOMIZATION } from "@/components/character/customizeOptions";

const PORTRAIT_ART = "https://media.base44.com/images/public/6aa08093485633062c57e946/31ca293c5_Crawler_Companion_Approved_Portrait_Frame_ONLY.png";

const DEFAULT_SETTINGS = { offsetX: 0, offsetY: 0, scale: 1 };

/* Visible-pixel bounding box of a photo, as fractions (0..1) of its
   dimensions — used when a photo carries transparent padding, so Fit to
   Portrait can scale the VISIBLE content to cover the opening. Resolves
   null when the pixels can't be read (CORS) or the whole photo is opaque
   edge to edge, in which case plain object-fit cover already fills. */
const analyzeBBox = (url) =>
  new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      try {
        const step = Math.max(1, Math.ceil(Math.max(img.naturalWidth, img.naturalHeight) / 200));
        const w = Math.max(1, Math.floor(img.naturalWidth / step));
        const h = Math.max(1, Math.floor(img.naturalHeight / step));
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        ctx.drawImage(img, 0, 0, w, h);
        const data = ctx.getImageData(0, 0, w, h).data;
        let minX = w, minY = h, maxX = -1, maxY = -1;
        for (let y = 0; y < h; y++) {
          for (let x = 0; x < w; x++) {
            if (data[(y * w + x) * 4 + 3] > 8) {
              if (x < minX) minX = x;
              if (x > maxX) maxX = x;
              if (y < minY) minY = y;
              if (y > maxY) maxY = y;
            }
          }
        }
        resolve(maxX < 0 ? null : {
          x: (minX * step) / img.naturalWidth,
          y: (minY * step) / img.naturalHeight,
          w: ((maxX - minX + 1) * step) / img.naturalWidth,
          h: ((maxY - minY + 1) * step) / img.naturalHeight,
        });
      } catch {
        resolve(null); // unreadable pixels — treat as a fully opaque photo
      }
    };
    img.onerror = () => resolve(null);
    img.src = url;
  });

/**
 * Portrait positioning — no free zoom; the only scale is the one Fit to
 * Portrait computes. The photo renders at object-fit cover (big enough to
 * fill the opening, never distorted), plus that fit scale so the photo's
 * VISIBLE content covers the opening edge to edge — a photo that carries
 * its own transparent padding is scaled up and the excess is cropped.
 *
 * Panning slides the photo within its cover overflow (a photo wider than
 * the opening has hidden horizontal overflow; a taller one has vertical
 * overflow). That overflow is the drag room — the user slides the photo
 * (e.g. to center the person and push a truck out of view) while it keeps
 * covering the opening.
 */
export default function Portrait({ portraitUrl, onPortraitChange, settings, onSettingsChange, customization: customizationProp, onCustomizationChange, playMode = false }) {
  const [open, setOpen] = useState(false);
  const [preview, setPreview] = useState(null);
  /* Positioning for a not-yet-committed preview stays LOCAL until the
     workshop's Save commits it — Cancel must leave the sheet untouched
     (and never trigger an autosave). */
  const [previewSettings, setPreviewSettings] = useState(null);
  const [repositioning, setRepositioning] = useState(false);
  /* Portrait customization selections — kept separate from portraitUrl so
     the user's original uploaded portrait is always preserved underneath.
     Hoisted to the character sheet (so choices save with the record) when
     the props are provided; standalone Portrait use falls back to local state. */
  const [localCustomization, setLocalCustomization] = useState(DEFAULT_CUSTOMIZATION);
  const customization = customizationProp !== undefined ? customizationProp : localCustomization;
  const setCustomization = onCustomizationChange || setLocalCustomization;
  const [natRatio, setNatRatio] = useState(null); // photo's natural width/height
  /* Visible-content box of the shown photo (opaque pixels, fractions of
     the image); null when unknown or when the photo has no transparent
     margin. Fit to Portrait scales the photo so THIS box covers the
     opening. */
  const [bbox, setBbox] = useState(null);
  const overlayRef = useRef(null);
  const shown = preview || portraitUrl;
  const s = preview ? (previewSettings ?? DEFAULT_SETTINGS) : (settings || DEFAULT_SETTINGS);

  /* Drag room — how far the photo may slide along each axis, as a % of
     the opening's size, while its visible content still covers the
     opening completely. Derived from the photo's natural shape, its
     visible-content box, the opening's shape, and the current fit scale.
     Ranges are asymmetric when the content sits off-center in the photo
     (transparent padding). */
  const budgetsRef = useRef({ minX: 0, maxX: 0, minY: 0, maxY: 0 });
  const recomputeBudgets = (scale = 1) => {
    const rect = overlayRef.current?.getBoundingClientRect();
    if (!rect || !rect.width || !rect.height || !natRatio) {
      budgetsRef.current = { minX: 0, maxX: 0, minY: 0, maxY: 0 };
      return;
    }
    const openW = rect.width;
    const openH = rect.height;
    const contRatio = openW / openH;
    // Drawn size of the whole photo under object-fit cover.
    const drawnW = openW * Math.max(1, natRatio / contRatio);
    const drawnH = openH * Math.max(1, contRatio / natRatio);
    // Visible-content box in cover coordinates.
    const bb = bbox || { x: 0, y: 0, w: 1, h: 1 };
    const CW = bb.w * drawnW;
    const CH = bb.h * drawnH;
    // Content-based room keeps the VISIBLE pixels covering the opening —
    // used whenever they can at this scale; otherwise fall back to
    // whole-photo room (the classic cover overflow).
    if (scale * CW < openW - 0.5 || scale * CH < openH - 0.5) {
      const overX = 50 * (scale * Math.max(1, natRatio / contRatio) - 1);
      const overY = 50 * (scale * Math.max(1, contRatio / natRatio) - 1);
      budgetsRef.current = { minX: -overX, maxX: overX, minY: -overY, maxY: overY };
      return;
    }
    // Content center in element coordinates (cover centers the photo).
    const ccx = (openW - drawnW) / 2 + (bb.x + bb.w / 2) * drawnW;
    const ccy = (openH - drawnH) / 2 + (bb.y + bb.h / 2) * drawnH;
    const roomX = (scale * CW - openW) / 2;
    const roomY = (scale * CH - openH) / 2;
    const dx0 = scale * (ccx - openW / 2);
    const dy0 = scale * (ccy - openH / 2);
    budgetsRef.current = {
      minX: ((-roomX - dx0) / openW) * 100,
      maxX: ((roomX - dx0) / openW) * 100,
      minY: ((-roomY - dy0) / openH) * 100,
      maxY: ((roomY - dy0) / openH) * 100,
    };
  };
  useEffect(() => {
    recomputeBudgets(settingsRef.current?.scale || 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [natRatio, bbox, open]);

  /* Apply positioning — budgets are recomputed at the NEW scale first, so
     a Fit (which changes scale) lands exactly where computed, and every
     later drag stays within coverage. */
  const applySettings = (next) => {
    const scale = next.scale ?? 1;
    recomputeBudgets(scale);
    const b = budgetsRef.current;
    const clamped = {
      offsetX: Math.min(Math.max(next.offsetX ?? 0, b.minX), b.maxX),
      offsetY: Math.min(Math.max(next.offsetY ?? 0, b.minY), b.maxY),
      scale,
    };
    if (preview) setPreviewSettings(clamped); // not committed yet
    else onSettingsChange(clamped);
  };

  // Latest-value refs so the native drag listeners never read stale state.
  const settingsRef = useRef(s);
  const applyRef = useRef(applySettings);
  useEffect(() => {
    settingsRef.current = s;
    applyRef.current = applySettings;
  });

  /* Measure the shown photo's visible-pixel box whenever it changes. */
  useEffect(() => {
    if (!shown) {
      setBbox(null);
      return;
    }
    let alive = true;
    analyzeBBox(shown).then((b) => {
      if (alive) setBbox(b);
    });
    return () => {
      alive = false;
    };
  }, [shown]);

  const closeWorkshop = () => {
    setPreview(null);
    setPreviewSettings(null);
    setRepositioning(false);
    setOpen(false);
  };

  /* EDIT CHARACTER OFF protects the portrait build fields too — portrait
     choice, positioning, and costume customization are character-build
     values, so the workshop closes and cannot reopen during normal play.
     The portrait itself keeps displaying normally; only manual editing is
     prevented. */
  useEffect(() => {
    if (playMode && open) closeWorkshop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playMode]);

  /* Fit to Portrait — scale the photo proportionally so its VISIBLE
     content covers the opening edge to edge (excess cropped, never
     stretched), centered. A photo with no transparent padding stays at
     1x — exactly the plain cover fit. The original uploaded image is
     never modified; only its rendering transform changes, and that
     persists through the existing portrait save flow. */
  const fitToPortrait = () => {
    const rect = overlayRef.current?.getBoundingClientRect();
    if (!rect || !rect.width || !rect.height || !natRatio) {
      applySettings({ offsetX: 0, offsetY: 0, scale: 1 });
      return;
    }
    const openW = rect.width;
    const openH = rect.height;
    const contRatio = openW / openH;
    const drawnW = openW * Math.max(1, natRatio / contRatio);
    const drawnH = openH * Math.max(1, contRatio / natRatio);
    const bb = bbox || { x: 0, y: 0, w: 1, h: 1 };
    const k0 = Math.max(openW / (bb.w * drawnW), openH / (bb.h * drawnH));
    const k = k0 > 1 ? k0 * 1.001 : k0; // hair of overscan only when scaling up
    // Content center in element coordinates (cover centers the photo).
    const ccx = (openW - drawnW) / 2 + (bb.x + bb.w / 2) * drawnW;
    const ccy = (openH - drawnH) / 2 + (bb.y + bb.h / 2) * drawnH;
    applySettings({
      offsetX: ((-k * (ccx - openW / 2)) / openW) * 100,
      offsetY: ((-k * (ccy - openH / 2)) / openH) * 100,
      scale: k,
    });
  };

  /* Pan — NATIVE pointer listeners attached directly to the portrait
     interaction layer, active while the workshop is open. The photo NEVER
     scales: it slides within its cover overflow and clamps at the edges so
     the opening stays fully covered. */
  useEffect(() => {
    const overlay = overlayRef.current;
    if (!overlay || !open) return;

    let drag = null;

    const onDown = (e) => {
      e.preventDefault();
      recomputeBudgets(settingsRef.current?.scale || 1); // fresh geometry before each drag
      drag = { x: e.clientX, y: e.clientY, ox: settingsRef.current.offsetX, oy: settingsRef.current.offsetY };
      overlay.setPointerCapture(e.pointerId);
    };
    const onMove = (e) => {
      if (!drag) return;
      const rect = overlay.getBoundingClientRect();
      const rawX = drag.ox + ((e.clientX - drag.x) / rect.width) * 100;
      const rawY = drag.oy + ((e.clientY - drag.y) / rect.height) * 100;
      const b = budgetsRef.current;
      applyRef.current({
        offsetX: Math.min(Math.max(rawX, b.minX), b.maxX),
        offsetY: Math.min(Math.max(rawY, b.minY), b.maxY),
        scale: settingsRef.current?.scale || 1,
      });
    };
    const onUp = (e) => {
      if (overlay.hasPointerCapture?.(e.pointerId)) overlay.releasePointerCapture(e.pointerId);
      drag = null;
    };
    // Never let the browser start a native image drag over the photo.
    const onDragStart = (e) => e.preventDefault();

    overlay.addEventListener("pointerdown", onDown);
    overlay.addEventListener("pointermove", onMove);
    overlay.addEventListener("pointerup", onUp);
    overlay.addEventListener("pointercancel", onUp);
    overlay.addEventListener("dragstart", onDragStart);
    return () => {
      overlay.removeEventListener("pointerdown", onDown);
      overlay.removeEventListener("pointermove", onMove);
      overlay.removeEventListener("pointerup", onUp);
      overlay.removeEventListener("pointercancel", onUp);
      overlay.removeEventListener("dragstart", onDragStart);
    };
    // Re-run when the photo appears (fresh upload) or its shape becomes known.
  }, [open, shown, natRatio]);

  return (
    /* Single local positioning parent — the PNG and the photo overlay share
       this relative wrapper; the overlay is inset purely in percentages. */
    <div style={{ position: "relative" }}>
      {/* 1. Approved portrait PNG — in normal flow, defines the wrapper's size.
          Disabled while repositioning so it can never intercept a drag. */}
      <button
        type="button"
        aria-label="Edit character portrait"
        title={playMode ? "Turn on EDIT CHARACTER to change the portrait" : "Edit character portrait"}
        aria-expanded={open}
        data-portrait-trigger
        onClick={() => {
          if (playMode) return; // EDIT OFF — portrait is protected build data
          open ? closeWorkshop() : setOpen(true);
        }}
        style={{ display: "block", width: "100%", padding: 0, border: "none", background: "transparent", pointerEvents: repositioning ? "none" : "auto" }}
        className="select-none rounded-md outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold-bright)]"
      >
        <img
          src={PORTRAIT_ART}
          alt="Crawler portrait frame — Insert Your Crawler Here"
          style={{ display: "block", width: "100%", height: "auto" }}
          draggable={false}
        />
      </button>

      {/* 2. Uploaded-photo overlay — clipped inside the frame's opening.
          Rendered at object-fit cover (always fills the opening, never
          distorted) and slid via offsets; the drag surface itself while the
          workshop is open. */}
      {shown && (
        <div
          ref={overlayRef}
          aria-hidden="true"
          data-portrait-trigger={open ? "true" : undefined}
          style={{
            position: "absolute",
            top: "13%",
            left: "11.5%",
            width: "77.5%",
            height: "79.5%",
            overflow: "hidden",
            pointerEvents: open ? "auto" : "none",
            touchAction: "none",
            userSelect: "none",
            cursor: open ? "grab" : "default",
            zIndex: 2,
          }}
        >
          <img
            src={shown}
            alt=""
            draggable={false}
            onLoad={(e) => {
              const img = e.currentTarget;
              setNatRatio(img.naturalWidth ? img.naturalWidth / img.naturalHeight : null);
            }}
            style={{
              display: "block",
              width: "100%",
              height: "100%",
              objectFit: "cover",
              transform: `translate(${s.offsetX}%, ${s.offsetY}%) scale(${s.scale || 1})`,
              userSelect: "none",
              WebkitUserDrag: "none",
            }}
          />
        </div>
      )}

      {open && (
        <PortraitWorkshop
          portraitUrl={shown}
          onPreview={(url) => {
            setPreview(url);
            setPreviewSettings({ ...DEFAULT_SETTINGS });
          }}
          onSave={(url) => {
            onPortraitChange(url);
            // Commit the position/zoom adjusted during preview — or, saving
            // without a preview, keep the committed settings as they are.
            if (preview) onSettingsChange(previewSettings ?? DEFAULT_SETTINGS);
            setPreview(null);
            setPreviewSettings(null);
          }}
          onDelete={() => {
            setPreview(null);
            onPortraitChange("");
            onSettingsChange(DEFAULT_SETTINGS);
            setNatRatio(null);
            setBbox(null);
          }}
          settings={s}
          onSettingsChange={applySettings}
          onFit={fitToPortrait}
          onRepositionActive={setRepositioning}
          customization={customization}
          onCustomizationChange={setCustomization}
          onClose={closeWorkshop}
        />
      )}
    </div>
  );
}