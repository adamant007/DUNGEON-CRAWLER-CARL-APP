import React from "react";

/* Decorative hero bookshelf — the far-right shelf of system books from
   the approved mockup. Pure presentation: vertical spines with tiny gold
   labels, standing on a shelf plank. */
const BOOKS = [
  { label: "D&D", bg: "#5a1a1a", h: 58 },
  { label: "PATHFINDER", bg: "#1a2a4a", h: 66 },
  { label: "STARFINDER", bg: "#3a2a4a", h: 54 },
  { label: "AND MORE", bg: "#2a3a2a", h: 62 },
];

export default function HeroBookShelf() {
  return (
    <div aria-hidden="true" className="hidden flex-col items-end xl:flex">
      <div className="flex items-end gap-[3px]">
        {BOOKS.map((book) => (
          <span
            key={book.label}
            className="flex items-center justify-center rounded-t-[2px] border border-[#3c352a]"
            style={{ width: 22, height: book.h, backgroundColor: book.bg }}
          >
            <span
              className="font-display text-[5px] font-bold tracking-[0.14em] text-[#d4a055]"
              style={{ writingMode: "vertical-rl" }}
            >
              {book.label}
            </span>
          </span>
        ))}
      </div>
      <span className="mt-[3px] block h-[5px] w-full rounded-[1px] border border-[#3c352a] bg-[#1a1208]" />
    </div>
  );
}