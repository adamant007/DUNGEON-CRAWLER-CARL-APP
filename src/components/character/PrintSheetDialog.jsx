import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Printer, X } from "lucide-react";
import { base44 } from "@/api/base44Client";
import PrintSheetPage from "@/components/character/PrintSheetPage";
import "./print-sheet.css";

/* PRINT CHARACTER SHEET — options + on-screen preview of the dedicated
   printer-friendly layout (NOT the dark app UI). The preview renders in
   a portal at the end of <body>; window.print() then prints ONLY that
   page (print CSS hides the app), while the browser's own dialog picks
   the printer, Save-as-PDF, paper size, and orientation. Options:
   Ink Saver (default on — white background, no fills), and toggles for
   portrait, inventory, and notes. Buffs/debuffs come from the character
   record's status_effects (kept current by the GM tools), fetched at
   open time. */

export default function PrintSheetDialog({ sheet, statMods, characterId, onClose }) {
  const [inkSaver, setInkSaver] = useState(true);
  const [withPortrait, setWithPortrait] = useState(true);
  const [withInventory, setWithInventory] = useState(true);
  const [withNotes, setWithNotes] = useState(true);
  const [status, setStatus] = useState("");

  /* Close on Escape. */
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  /* Active buffs/debuffs live on the canonical record (status_effects),
     not the sheet state — read them fresh at open time. Anonymous drafts
     have no record and simply print "None". */
  useEffect(() => {
    if (!characterId) return undefined;
    let alive = true;
    base44.entities.Character.get(characterId)
      .then((rec) => {
        if (alive) setStatus(rec?.status_effects ?? "");
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [characterId]);

  return createPortal(
    <div id="print-sheet-root">
      <div className="ps-backdrop" />
      <div className="ps-screen">
        {/* Options + actions — hidden entirely in print mode. */}
        <div className="ps-toolbar">
          <label className="ps-opt">
            <input
              type="checkbox"
              checked={inkSaver}
              onChange={(e) => setInkSaver(e.target.checked)}
            />
            Ink Saver
          </label>
          <label className="ps-opt">
            <input
              type="checkbox"
              checked={withPortrait}
              onChange={(e) => setWithPortrait(e.target.checked)}
            />
            Include Portrait
          </label>
          <label className="ps-opt">
            <input
              type="checkbox"
              checked={withInventory}
              onChange={(e) => setWithInventory(e.target.checked)}
            />
            Include Inventory
          </label>
          <label className="ps-opt">
            <input
              type="checkbox"
              checked={withNotes}
              onChange={(e) => setWithNotes(e.target.checked)}
            />
            Include Notes
          </label>
          <span className="ps-hint">
            Choose your printer — or Save as PDF — in the browser print dialog.
          </span>
          <span className="ps-toolbar-spacer" />
          <button type="button" className="ps-btn" onClick={onClose}>
            <X size={13} /> Close
          </button>
          <button
            type="button"
            className="ps-btn ps-btn-print"
            onClick={() => window.print()}
          >
            <Printer size={13} /> Print
          </button>
        </div>
        <div className="ps-scroll">
          <PrintSheetPage
            sheet={sheet}
            statMods={statMods}
            status={status}
            withPortrait={withPortrait}
            withInventory={withInventory}
            withNotes={withNotes}
            inkSaver={inkSaver}
          />
        </div>
      </div>
    </div>,
    document.body
  );
}