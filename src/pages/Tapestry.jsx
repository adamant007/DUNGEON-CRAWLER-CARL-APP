import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const TAPESTRY = "https://media.base44.com/images/public/user_68b2613af2012fdde419b413/fef9f9109_Ginger_Dragon_Tapestry.png";

export default function Tapestry() {
  const navigate = useNavigate();
  const [ratio, setRatio] = useState(16 / 9);

  return (
    <div className="h-[100svh] w-full bg-[#1a1410] flex items-center justify-center overflow-hidden">
      {/* Box sized exactly to the rendered image so percentage overlays align at every viewport */}
      <div
        className="relative select-none"
        style={{ width: `min(100%, 560px, calc(100svh * ${ratio}))`, aspectRatio: `${ratio}` }}
      >
        <img
          src={TAPESTRY}
          alt="Ginger Dragon Studios tapestry"
          className="absolute inset-0 h-full w-full pointer-events-none"
          draggable={false}
          onLoad={(e) => {
            const r = e.target.naturalWidth / e.target.naturalHeight;
            if (r > 0 && r !== ratio) setRatio(r);
          }}
        />
        {/* Clickable ENTER region — overlaid on the navy "ENTER CRAWLER COMPANION" panel */}
        <button
          aria-label="Enter Crawler Companion"
          onClick={() => navigate("/library")}
          className="absolute group"
          style={{
            left: "18%",
            right: "18%",
            top: "70%",
            bottom: "11%",
          }}
        >
          <span className="block h-full w-full rounded-[2px] transition-all duration-300 group-hover:shadow-[0_0_0_2px_rgba(212,160,85,0.0)] group-active:scale-[0.98]" />
        </button>
      </div>
    </div>
  );
}