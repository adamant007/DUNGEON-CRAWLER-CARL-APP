import React from "react";

const WELCOME_BACKGROUND =
  "https://mitbmrdeksicjzxjajyx.supabase.co/storage/v1/object/public/app-assets/989bf3e5b_generated_image.png";

export default function HomeBackdrop({ variant = "welcome" }) {
  if (variant === "returning") {
    return (
      <div
        aria-hidden="true"
        className="fixed inset-0 z-0 bg-[radial-gradient(circle_at_72%_8%,rgba(88,24,32,.16),transparent_32%),linear-gradient(180deg,#090b10_0%,#07090d_58%,#050608_100%)]"
      />
    );
  }

  return (
    <div aria-hidden="true" className="fixed inset-0 z-0">
      <img
        src={WELCOME_BACKGROUND}
        alt=""
        draggable={false}
        className="h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-[rgba(0,0,0,0.45)]" />
    </div>
  );
}
