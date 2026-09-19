import React from "react";
import SideNav from "@/components/home/SideNav";
import DashboardHero from "@/components/home/dashboard/DashboardHero";
import YourCharacters from "@/components/home/dashboard/YourCharacters";
import CampaignsCard from "@/components/home/CampaignsCard";
import QuickTools from "@/components/home/dashboard/QuickTools";
import WhatsNew from "@/components/home/dashboard/WhatsNew";
import DashboardFooter from "@/components/home/dashboard/DashboardFooter";

/* RETURNING DASHBOARD — reproduced from the approved mockup: sidebar,
   dragon-hoard hero with Continue Playing, Your Characters, Recent
   Campaigns, Quick Tools, What's New, and the quote banner. */
export default function ReturningHome({ me, characters = [], activeCharacter, onContinue, onCreateNew }) {
  return (
    <div className="relative z-10 flex min-h-[100svh] flex-col lg:flex-row">
      <SideNav />
      <main className="mx-auto flex min-w-0 max-w-6xl flex-1 flex-col gap-4 px-4 py-6 lg:px-8">
        <DashboardHero
          me={me}
          activeCharacter={activeCharacter}
          onContinue={() => onContinue(activeCharacter)}
          onCreateNew={onCreateNew}
        />
        <YourCharacters characters={characters} onContinue={onContinue} onCreateNew={onCreateNew} />
        <CampaignsCard />
        <div className="grid gap-4 md:grid-cols-[1.2fr_1fr]">
          <QuickTools />
          <WhatsNew />
        </div>
        <DashboardFooter />
      </main>
    </div>
  );
}