import React from "react";
import CompactDetails from "@/components/character/CompactDetails";

/* Identity card interior — the Crawler Details grid only, rendered bare
   (no own frame/title): it lives inside the ONE identity box together
   with the portrait and the name stack (mockup composition). */
export default function IdentityHeader({ info, setInfo, defense, setDefense, rulesetData, playMode = false }) {
  return (
    <CompactDetails
      info={info}
      setInfo={setInfo}
      defense={defense}
      setDefense={setDefense}
      rulesetData={rulesetData}
      playMode={playMode}
    />
  );
}