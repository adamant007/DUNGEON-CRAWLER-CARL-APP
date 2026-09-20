import React, { useEffect } from "react";
import { X } from "lucide-react";

/* Small centered parchment modal used by the character-management dialogs.
   ink-border (not hand-frame) on purpose — hand-frame's background shorthand
   would wipe the parchment texture. Most dialogs close on Escape/backdrop/X;
   critical flows can set dismissible={false} and rely only on their explicit
   in-dialog navigation controls. */
export default function ParchmentDialog({
  title,
  onClose,
  children,
  wide = false,
  large = false,
  medium = false,
  dismissible = true,
}) {
  useEffect(() => {
    const onKey = (e) => {
      if (dismissible && e.key === "Escape") onClose?.();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [dismissible, onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(24,15,7,0.6)] p-4"
      onClick={() => {
        if (dismissible) onClose?.();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
        className={`parchment dialog-parchment ink-border w-full flex max-h-[calc(100dvh-2rem)] flex-col ${
          large
            ? "h-[min(820px,88dvh)] max-w-[min(720px,88vw)]"
            : medium
              ? "h-[min(620px,84dvh)] max-w-[min(540px,94vw)]"
              : wide
                ? "max-w-md"
                : "max-w-sm"
        } p-5 shadow-[0_25px_60px_rgba(0,0,0,0.6)]`}
      >
        <div className="mb-2 flex shrink-0 items-center justify-between gap-3">
          <h3 className="section-title text-[20px] font-bold text-[#24180f]">{title}</h3>
          {dismissible && (
            <button
              type="button"
              aria-label="Close"
              onClick={() => onClose?.()}
              className="ink-box flex h-5 w-5 shrink-0 items-center justify-center"
            >
              <X size={11} />
            </button>
          )}
        </div>
        {/* Mobile-safe scroll area: the modal caps at the dynamic viewport
            height (dvh — shrinks with browser chrome), the header stays
            pinned, and only this middle region scrolls. overscroll-contain
            stops touch scrolling from chaining to the page behind. */}
        <div className="scrollbar-thin min-h-0 flex-1 overflow-y-auto overscroll-contain">
          {children}
        </div>
      </div>
    </div>
  );
}