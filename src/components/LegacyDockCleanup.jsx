import { useEffect } from "react";

/*
 * The old pre-router app shell injected a fixed bottom dock containing
 * PARTY / MAP / DICE / NOTES / GM plus the active-crawler summary.
 * The current app has its own navigation, so that dock is obsolete.
 * Remove it once at the shared shell instead of hiding it page-by-page.
 */
function looksLikeLegacyDock(el) {
  if (!(el instanceof HTMLElement)) return false;
  const text = (el.innerText || "").replace(/\s+/g, " ").trim().toUpperCase();
  if (!text) return false;
  return (
    text.includes("CRAWLERS IN PARTY") ||
    (text.includes("PARTY") &&
      text.includes("MAP") &&
      text.includes("DICE") &&
      text.includes("NOTES") &&
      text.includes("GM"))
  );
}

function fixedBottomAncestor(el) {
  let node = el;
  for (let depth = 0; node && node !== document.body && depth < 8; depth += 1) {
    const style = window.getComputedStyle(node);
    const bottom = Number.parseFloat(style.bottom || "");
    const atBottom = Number.isFinite(bottom) ? bottom <= 48 : false;
    if ((style.position === "fixed" || style.position === "sticky") && atBottom) {
      return node;
    }
    node = node.parentElement;
  }
  return null;
}

function removeLegacyDock() {
  for (const el of document.body.querySelectorAll("body *")) {
    if (!looksLikeLegacyDock(el)) continue;
    const dock = fixedBottomAncestor(el);
    if (dock) {
      dock.remove();
      return true;
    }
  }
  return false;
}

export default function LegacyDockCleanup() {
  useEffect(() => {
    removeLegacyDock();

    const observer = new MutationObserver(() => {
      removeLegacyDock();
    });
    observer.observe(document.body, { childList: true, subtree: true });

    const timer = window.setInterval(removeLegacyDock, 750);
    return () => {
      observer.disconnect();
      window.clearInterval(timer);
    };
  }, []);

  return null;
}
