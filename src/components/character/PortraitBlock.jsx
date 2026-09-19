import React from "react";
import Portrait from "@/components/character/Portrait";

/* Upper-left sheet cell — the live portrait (approved frame PNG with the
   EDIT PORTRAIT workshop beneath it). Pure positioning wrapper; the
   Portrait component keeps every workshop behavior. */
export default function PortraitBlock({
  portrait,
  setPortrait,
  portraitSettings,
  setPortraitSettings,
  customization,
  setCustomization,
  playMode = false,
}) {
  return (
    <div className="w-full max-w-[190px] mx-auto lg:mx-0 lg:max-w-none">
      <Portrait
        portraitUrl={portrait}
        onPortraitChange={setPortrait}
        settings={portraitSettings}
        onSettingsChange={setPortraitSettings}
        customization={customization}
        onCustomizationChange={setCustomization}
        playMode={playMode}
      />
    </div>
  );
}