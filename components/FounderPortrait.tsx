"use client";

import { useState } from "react";
import Image from "next/image";

const PHOTO_SRC = "/founder/tang-tri-duc.jpg";

export function FounderPortrait({
  className = "",
  priority = false,
}: {
  className?: string;
  priority?: boolean;
}) {
  const [errored, setErrored] = useState(false);

  if (errored) {
    return (
      <div
        className={`relative flex items-center justify-center bg-gradient-to-br from-ink-soft via-ink to-black ${className}`}
      >
        <span className="font-display bg-gradient-to-br from-gold-400 to-gold-600 bg-clip-text text-6xl font-extrabold tracking-tight text-transparent sm:text-7xl">
          TTĐ
        </span>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <Image
        src={PHOTO_SRC}
        alt="Tăng Trí Đức — Founder Trí Đức Car Media"
        fill
        priority={priority}
        sizes="(min-width: 1024px) 420px, 384px"
        className="object-cover"
        onError={() => setErrored(true)}
      />
    </div>
  );
}
