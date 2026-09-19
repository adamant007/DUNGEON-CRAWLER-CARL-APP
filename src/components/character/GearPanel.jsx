import React from "react";
import {
  GD_GEAR,
  GD_SLOT_HEAD,
  GD_SLOT_CHEST,
  GD_SLOT_HANDS,
  GD_SLOT_LEGS,
  GD_SLOT_FEET,
  GD_SLOT_MAINHAND,
  GD_SLOT_OFFHAND,
  GD_SLOT_OTHER,
} from "@/components/ui/GingerDragonIcons";
import SheetPanel from "@/components/character/SheetPanel";
import ViewAllLink from "@/components/character/ViewAllLink";

/* V3 compact Equipped Gear panel — a read-only summary of the
   character's live canonical equipment slots, NOT the gear-management
   editor. Filled slots render first so the character's actual equipment
   (e.g. an equipped collar) is immediately visible; adding, removing and
   managing gear belongs to the Gear tab — both reference the SAME
   canonical character equipment data. VIEW ALL GEAR routes to the
   existing Gear tab. */
/* Mockup-style colorful slot icons — presentation only; the slot keys,
   labels, ordering, and canonical gear data are unchanged. */
const GEAR = [
  { key: "head", label: "Head", icon: GD_SLOT_HEAD },
  { key: "chest", label: "Chest", icon: GD_SLOT_CHEST },
  { key: "hands", label: "Hands", icon: GD_SLOT_HANDS },
  { key: "legs", label: "Legs", icon: GD_SLOT_LEGS },
  { key: "feet", label: "Feet", icon: GD_SLOT_FEET },
  { key: "mainHand", label: "Main Hand", icon: GD_SLOT_MAINHAND },
  { key: "offHand", label: "Off Hand", icon: GD_SLOT_OFFHAND },
  { key: "other", label: "Other", icon: GD_SLOT_OTHER },
];

export default function GearPanel({ gear }) {
  const isFilled = (f) => (gear?.[f.key] ?? "").toString().trim() !== "";
  const ordered = [...GEAR.filter(isFilled), ...GEAR.filter((f) => !isFilled(f))];

  return (
    <SheetPanel icon={GD_GEAR} title="Equipped Gear" iconClass="text-[#d4a055]" action={<ViewAllLink to="/gear" label="VIEW ALL GEAR" />}>
      <div className="grid grid-cols-2 gap-x-3 gap-y-1.5">
        {ordered.map((f) => {
          const Icon = f.icon;
          const filled = isFilled(f);
          return (
            <div key={f.key} className="flex items-center gap-2 min-w-0">
              <span aria-hidden="true" className="w-10 shrink-0 flex items-center justify-center">
                <Icon size={40} tone={filled ? undefined : "text-[rgba(138,119,92,0.45)]"} />
              </span>
              <div className="min-w-0 flex-1">
                <span className="field-label text-[8px] block leading-tight mb-0.5">{f.label}</span>
                <p className="font-garamond text-[13px] text-[var(--ink)] border-b border-[var(--rule)] min-h-[20px] truncate leading-[20px]">
                  {gear?.[f.key] || "—"}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </SheetPanel>
  );
}