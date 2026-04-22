"use client";

import Image from "next/image";
import { useState } from "react";

export function ZentrixaLogo({
  variant = "full",
  className = "",
  priority = false
}: {
  variant?: "full" | "icon";
  className?: string;
  priority?: boolean;
}) {
  const [failed, setFailed] = useState(false);
  const src = variant === "icon" ? "/branding/zentrixa-icon.png" : "/branding/zentrixa-logo.png";
  const alt = variant === "icon" ? "Zentrixa icon" : "Zentrixa - We Build. You Grow.";

  if (failed) {
    return (
      <span className={`zentrixa-logo-fallback ${variant} ${className}`.trim()}>
        {variant === "icon" ? "Z" : "Zentrixa"}
      </span>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={variant === "icon" ? 82 : 320}
      height={variant === "icon" ? 82 : 104}
      className={className}
      priority={priority}
      style={variant === "icon" ? undefined : { width: "auto", height: "auto", objectFit: "contain" }}
      onError={() => setFailed(true)}
    />
  );
}
