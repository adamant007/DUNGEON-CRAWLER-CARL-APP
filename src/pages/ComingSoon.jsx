import React from "react";
import { Link } from "react-router-dom";

/* Stub destination page — real content comes later, one destination at a time.
   The shared toolbar is rendered once by NavLayout, not here. */
export default function ComingSoon({ title }) {
  return (
    <div className="flex w-full items-center justify-center px-2 pb-10 min-h-[60svh]">
      <div className="text-center">
        <h1 className="font-display font-bold text-2xl text-[var(--gold-bright)] tracking-[0.15em] mb-3">{title}</h1>
        <p className="font-fell italic text-sm text-[#c4b18d] mb-6">This chamber is still being forged.</p>
        <Link
          to="/character"
          className="inline-block px-5 py-2 border border-[#4a3a26] rounded-md font-fell-sc text-xs tracking-[0.12em] text-[#e8d8b5] hover:border-[var(--gold)]"
        >
          Return to Character
        </Link>
      </div>
    </div>
  );
}