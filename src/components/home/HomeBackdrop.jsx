import React from "react";

/* Shared atmospheric backdrop for the home page — background scenes
   recreated directly from the approved mockup references. A light dim
   keeps the candlelit scene visible while the translucent cards sit on
   top as dark glass. */
const BACKGROUNDS = {
  welcome: "https://media.base44.com/images/public/6aa08093485633062c57e946/989bf3e5b_generated_image.png",
  returning: "https://media.base44.com/images/public/6aa08093485633062c57e946/18104a7af_generated_image.png",
};

export default function HomeBackdrop({ variant = "welcome" }) {
  return (
    <div aria-hidden="true" className="fixed inset-0 z-0">
      <img
        src={BACKGROUNDS[variant] ?? BACKGROUNDS.welcome}
        alt=""
        draggable={false}
        className="h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-[rgba(0,0,0,0.45)]" />
    </div>
  );
}