import React from "react";
import { Outlet } from "react-router-dom";
import GlobalNav from "@/components/GlobalNav";
import GdsBackdrop from "@/components/home/GdsBackdrop";
import CampaignEventInbox from "@/components/campaign/CampaignEventInbox";

/* Shared shell for every destination under the toolbar. The nav lives HERE,
   not inside each page: when every page rendered its own GlobalNav, each
   route change unmounted and remounted the nav image, re-arming its blurred
   load placeholder — the brief sharpness flash during navigation. Mounted
   once here, the artwork never reloads between routes, and its container
   (max-w-[1240px], px-2 inset) is identical on every page so the rendered
   width never changes either. */
export default function NavLayout() {
  return (
    <div className="relative min-h-[100svh] bg-[#17110d] px-2 pt-0 pb-3 sm:px-5 sm:pt-0 sm:pb-5">
      {/* Persistent GDS dragon/castle artwork — full-bleed behind every
          section under the toolbar, with a dark overlay for readability.
          Content layers above; the solid root color stays as a fallback
          while the image loads. */}
      <GdsBackdrop />
      <CampaignEventInbox />
      <div className="relative z-10 mx-auto w-full max-w-[1240px]">
        <div className="px-2 mb-2">
          <GlobalNav />
        </div>
        <Outlet />
      </div>
    </div>
  );
}