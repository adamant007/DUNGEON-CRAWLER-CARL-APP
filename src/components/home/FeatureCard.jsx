import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import ComingSoonPill from "@/components/home/ComingSoonPill";

/* One dark glass destination card — gold-ringed icon, Cinzel title,
   description, and a circle-enclosed arrow, exactly as the approved
   mockup. */
export default function FeatureCard({ icon: Icon, title, description, to, soon = false }) {
  return (
    <Link
      to={to}
      className="group relative flex flex-col items-center gap-3 rounded-lg border border-[#3c352a] bg-[rgba(10,10,10,0.65)] p-5 text-center backdrop-blur-sm transition-colors duration-150 hover:border-[var(--gold)]"
    >
      {soon && <ComingSoonPill className="absolute right-2.5 top-2.5" />}
      <span className="mt-1 flex h-12 w-12 items-center justify-center rounded-full border border-[#4a3a26] text-[#d4a055] transition-colors group-hover:border-[var(--gold)]">
        <Icon size={21} />
      </span>
      <h3 className="font-display text-[14px] font-bold tracking-[0.09em] text-white">{title}</h3>
      <p className="text-[12px] leading-snug text-[#a0a0a0]">{description}</p>
      <span className="mt-auto flex h-8 w-8 items-center justify-center rounded-full border border-[#4a3a26] text-[#d4a055] transition-colors group-hover:border-[var(--gold-bright)]">
        <ArrowRight size={13} />
      </span>
    </Link>
  );
}