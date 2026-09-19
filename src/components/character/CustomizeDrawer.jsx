import React, { useState } from "react";
import { ArrowLeft, ChevronDown, RotateCcw, Wand2, X } from "lucide-react";
import { CATEGORIES, DEFAULT_CUSTOMIZATION, PORTRAIT_TYPES } from "./customizeOptions";
import OptionPicker from "./OptionPicker";
import RepositionDrawer from "./RepositionDrawer";

/**
 * Customize Portrait — second-stage parchment drawer attached to the
 * Portrait Workshop's right edge. Pure selection UI: choices are stored
 * in the portrait's customization state (nothing is painted onto the
 * portrait), selections freely changeable, and APPLY reports that image
 * editing is not connected yet.
 *
 * Opening a category now launches the dedicated OptionPicker (beside
 * this drawer on desktop/tablet, below it on phones) — one large option
 * preview at a time with arrows, swipe, and color controls.
 */
export default function CustomizeDrawer({ customization, onCustomizationChange, settings, onChange, onClose }) {
  const [openKey, setOpenKey] = useState(null); // category whose picker is open
  const [reposition, setReposition] = useState(false);
  const [notice, setNotice] = useState(false);

  const sel = { ...DEFAULT_CUSTOMIZATION, ...(customization || {}) };
  const set = (patch) => {
    setNotice(false);
    onCustomizationChange?.({ ...sel, ...patch });
  };
  const menuOpen = !reposition;
  /* Companion hides the human categories (companion options arrive
     separately); the other portrait types see every choice unrestricted. */
  const portraitType = sel.portraitType || "male";
  const visibleCategories = CATEGORIES.filter((cat) => !(cat.hideFor || []).includes(portraitType));

  return (
    /* Outer wrapper owns the placement (attached to the Portrait Workshop);
       the visual panel inside keeps its own scroll, so the OptionPicker can
       hang beside/below the wrapper without being clipped. */
    <div className="customize-wrap absolute left-full top-0 z-40 ml-1 h-full w-[95%] max-w-[340px]">
      <div
        role="dialog"
        aria-label="Customize Portrait"
        className="parchment portrait-drawer customize-panel flex h-full w-full flex-col gap-1 overflow-hidden p-2"
      >
        {/* Title + close */}
        <div className="flex items-center justify-between gap-2">
          <h4 className="section-title text-[9px]">Customize Portrait</h4>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="ink-box flex h-5 w-5 shrink-0 items-center justify-center"
          >
            <X size={11} />
          </button>
        </div>

        {/* Category menu — one picker open at a time */}
        {menuOpen && (
          <div className="scrollbar-thin flex flex-1 flex-col gap-1 overflow-y-auto pr-0.5">
            {/* PORTRAIT TYPE — stored with the character's customization;
                will later drive which artwork and options are offered. */}
            <div className="ink-border-thin rounded-sm px-1.5 py-1.5">
              <span className="section-title text-[8px]">Portrait Type</span>
              <div className="mt-1 flex gap-1">
                {PORTRAIT_TYPES.map((t) => {
                  const active = (sel.portraitType || "male") === t.key;
                  return (
                    <button
                      key={t.key}
                      type="button"
                      onClick={() => {
                        set({ portraitType: t.key });
                        // A picker open on a now-hidden category closes.
                        const openCat = CATEGORIES.find((c) => c.key === openKey);
                        if (openCat && (openCat.hideFor || []).includes(t.key)) setOpenKey(null);
                      }}
                      className={`flex-1 rounded-sm border px-1 py-1.5 text-center font-display text-[8px] font-bold tracking-wide ${
                        active
                          ? "border-[var(--gold-bright)] bg-[rgba(212,160,85,0.22)] shadow-[inset_0_0_0_1px_var(--gold-bright)] text-[var(--ink)]"
                          : "border-[var(--gold)] bg-[rgba(255,248,220,0.10)] text-[var(--ink-soft)] hover:bg-[rgba(255,248,220,0.28)]"
                      }`}
                    >
                      {t.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Reposition Photo — existing positioning system, third-stage drawer */}
            <button
              type="button"
              onClick={() => setReposition(true)}
              style={{ visibility: openKey ? "hidden" : "visible" }}
              className="ink-box flex items-center justify-center gap-1.5 px-3 py-2 text-[10px]"
            >
              <Wand2 size={12} />
              Reposition Photo
            </button>

            {visibleCategories.map((cat) => {
              const expanded = openKey === cat.key;
              const selectedLabel = cat.options.find((o) => o.key === sel[cat.field])?.label;
              return (
                <div key={cat.key} className="ink-border-thin rounded-sm">
                  <button
                    type="button"
                    onClick={() => setOpenKey(expanded ? null : cat.key)}
                    aria-expanded={expanded}
                    className="flex w-full items-center gap-1.5 px-1.5 py-1.5 text-left"
                  >
                    <ChevronDown
                      size={10}
                      style={{ color: "var(--ink-soft)", transform: expanded ? "none" : "rotate(-90deg)" }}
                    />
                    <span className="section-title text-[8px]">{cat.label}</span>
                    <span
                      className="ml-auto font-fell italic text-[9px]"
                      style={{ color: selectedLabel ? "var(--ink)" : "var(--ink-faint)" }}
                    >
                      {selectedLabel || "—"}
                    </span>
                  </button>
                </div>
              );
            })}

            {notice && (
              <p
                className="text-center font-fell italic text-[10px] leading-snug"
                style={{ color: "var(--ink-soft)" }}
              >
                Portrait transformation will be applied when image editing is connected.
              </p>
            )}
          </div>
        )}

        {/* Reposition view — the EXISTING RepositionDrawer attaches right */}
        {reposition && (
          <p className="flex-1 text-center font-fell italic text-[10px] leading-snug">
            Drag the photo in the portrait to position it.
          </p>
        )}

        {/* Bottom controls — always available */}
        <div className="mt-auto flex items-center justify-center gap-1.5 pt-1">
          <button
            type="button"
            onClick={() => {
              onCustomizationChange?.(DEFAULT_CUSTOMIZATION);
              setNotice(false);
              setOpenKey(null);
            }}
            className="ink-box flex items-center gap-1 px-2 py-1.5 text-[9px]"
          >
            <RotateCcw size={10} />
            RESET
          </button>
          <button
            type="button"
            onClick={() => setNotice(true)}
            className="nameplate px-3 py-1.5 font-display text-[10px] font-bold text-[#f0e2c8]"
          >
            APPLY
          </button>
          <button
            type="button"
            onClick={() => (reposition ? setReposition(false) : openKey ? setOpenKey(null) : onClose())}
            className="ink-box flex items-center gap-1 px-2 py-1.5 text-[9px]"
          >
            <ArrowLeft size={10} />
            BACK
          </button>
        </div>

        {/* The EXISTING RepositionDrawer — third stage, attached right */}
        {reposition && (
          <RepositionDrawer settings={settings} onChange={onChange} onClose={() => setReposition(false)} />
        )}
      </div>

      {/* Dedicated one-option-at-a-time picker — beside this drawer on
          desktop/tablet, below it on phones. Reference artwork only. */}
      {openKey &&
        (() => {
          const cat = CATEGORIES.find((c) => c.key === openKey);
          return cat ? (
            <OptionPicker cat={cat} sel={sel} set={set} onClose={() => setOpenKey(null)} />
          ) : null;
        })()}
    </div>
  );
}