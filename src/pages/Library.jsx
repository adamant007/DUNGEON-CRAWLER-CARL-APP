import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const LIBRARY = "https://mitbmrdeksicjzxjajyx.supabase.co/storage/v1/object/public/app-assets/5b383626d_ginger-library-1.png";

export default function Library() {
  const navigate = useNavigate();
  const [ratio, setRatio] = useState(16 / 9);

  return (
    <div className="h-[100svh] w-full bg-[#0d0a07] flex items-center justify-center overflow-hidden">
      {/* Box sized exactly to the rendered image so percentage overlays align at every viewport */}
      <div
        className="relative select-none"
        style={{ width: `min(100%, calc(100svh * ${ratio}))`, aspectRatio: `${ratio}` }}
      >
        <img
          src={LIBRARY}
          alt="Ginger Dragon library"
          className="absolute inset-0 h-full w-full pointer-events-none"
          draggable={false}
          onLoad={(e) => {
            const r = e.target.naturalWidth / e.target.naturalHeight;
            if (r > 0 && r !== ratio) setRatio(r);
          }}
        />
        {/* Clickable open book — central floating glowing book */}
        <button
          aria-label="Open character sheet"
          onClick={() => navigate("/character")}
          className="absolute group"
          style={{
            left: "33%",
            right: "33%",
            top: "30%",
            bottom: "42%",
          }}
        >
          <span className="block h-full w-full transition-transform duration-200 group-active:scale-95 relative">
            <span className="book-hint" />
          </span>
        </button>
      </div>
    </div>
  );
}