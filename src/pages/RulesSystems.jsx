import React from "react";
import { useNavigate } from "react-router-dom";
import RulebookLibrary from "@/components/rulebooks/RulebookLibrary";
import RuleSearch from "@/components/rulebooks/RuleSearch";
import { listBuiltinProfiles } from "@/rules-profile";

/* RULES & SYSTEMS — its own section, NOT routed through the character
   sheet. Reuses the existing Rulebook Library component and Rulebook
   records exactly as they are; creating a character from a READY
   rulebook hands off to the existing creation flow on the sheet. */
export default function RulesSystems() {
  const navigate = useNavigate();
  const builtins = React.useMemo(() => listBuiltinProfiles(), []);

  return (
    <div className="px-2 pb-8">
      <article className="parchment sheet-frame sheet-edge relative mx-auto w-full max-w-[900px] p-3 sm:p-6">
        <div className="relative z-[1]">
          <header className="mb-3 text-center">
            <h1 className="section-title text-[20px]">Rules &amp; Systems</h1>
            <p className="font-fell italic text-[13px] text-[var(--ink-soft)]">
              Your private rulebook library and Rules Profiles.
            </p>
          </header>
          <RuleSearch />
          <RulebookLibrary
            builtins={builtins}
            onBack={() => navigate("/")}
            onStartCreation={() => navigate("/character?action=new")}
          />
        </div>
      </article>
    </div>
  );
}