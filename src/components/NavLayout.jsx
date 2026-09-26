import React from "react";
import { Outlet } from "react-router-dom";
import SideNav from "@/components/home/SideNav";

/* Signed-in app shell. Keep every working area in the same clean dashboard
   language: charcoal/black surfaces, antique-gold accents, and the compact
   GDS sidebar. The old illustrated shield toolbar and full-page fantasy
   backdrop are intentionally not used here. */
export default function NavLayout() {
  return (
    <div className="min-h-[100svh] bg-[#0a0a0a] text-[#efe8dc] lg:flex">
      <SideNav />
      <main className="min-w-0 flex-1">
        <div className="mx-auto w-full max-w-6xl px-4 py-5 sm:px-6 lg:px-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
