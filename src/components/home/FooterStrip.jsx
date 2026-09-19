import React from "react";
import { Users, Settings, Shield, Heart } from "lucide-react";

/* The four benefits band at the bottom of the welcome page, plus the
   script flourish — reproduced from the approved mockup. */
const SEGMENTS = [
  { icon: Users, title: "Play Your Way.", sub: "Supports multiple systems and homebrew content." },
  { icon: Settings, title: "Built for Players & GMs.", sub: "Everything you need at one table." },
  { icon: Shield, title: "Your Data, Your Control.", sub: "Secure, private, and always yours." },
  { icon: Heart, title: "A Growing Community.", sub: "Great games bring people together." },
];

export default function FooterStrip() {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 border-t border-[#3c352a] bg-[rgba(10,8,5,0.88)] px-4 py-4 sm:px-8">
      <div className="grid flex-1 grid-cols-2 gap-x-6 gap-y-4 lg:grid-cols-4">
        {SEGMENTS.map((seg) => (
          <div key={seg.title} className="flex items-start gap-2.5">
            <seg.icon size={17} className="mt-[2px] shrink-0 text-[#d4a055]" />
            <div>
              <p className="text-[11px] font-semibold text-white">{seg.title}</p>
              <p className="text-[10px] leading-snug text-[#8d8578]">{seg.sub}</p>
            </div>
          </div>
        ))}
      </div>
      <p className="w-full text-right font-fell italic text-[13px] text-[#d4a055] sm:w-auto sm:pl-6">
        More Tools. A Higher Adventure.
      </p>
    </div>
  );
}