import React from "react";

/* Shared hand-frame panel: icon + title header with an optional
   right-side action (e.g. a VIEW ALL link), then content. */
export default function SheetPanel({ icon: Icon, title, action = null, frame = "hand-frame", className = "", iconClass = "text-[var(--gold-bright)]", children }) {
  return (
    <section className={`${frame} p-2 ${className}`}>
      <header className="flex items-center gap-2 mb-2">
        {Icon && <Icon size={40} className={`${iconClass} shrink-0`} fill="currentColor" strokeWidth={2} />}
        <h3 className="section-title text-[10px]">{title}</h3>
        {action && <div className="ml-auto">{action}</div>}
      </header>
      {children}
    </section>
  );
}