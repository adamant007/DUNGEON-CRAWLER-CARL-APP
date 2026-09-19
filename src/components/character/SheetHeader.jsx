import React from "react";

const HEADER_ART = "https://media.base44.com/images/public/6aa08093485633062c57e946/7934da15c_Crawler_Companion_Approved_Top_Header.png";

export default function SheetHeader() {
  return (
    <header className="select-none">
      {/* Approved GDS top-header artwork — used as-is, original aspect ratio locked */}
      <img
        src={HEADER_ART}
        alt="Crawler Companion — Prepare ♦ Play ♦ Survive"
        className="block w-full h-auto"
        draggable={false}
      />
    </header>
  );
}