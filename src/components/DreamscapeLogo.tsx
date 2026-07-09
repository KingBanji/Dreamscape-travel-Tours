import React from "react";

interface DreamscapeLogoProps {
  className?: string;
}

export default function DreamscapeLogo({ className = "w-11 h-11" }: DreamscapeLogoProps) {
  return (
    <img
      src="/images/logo dreamscape-1.png"
      alt="Dreamscape Tours Logo"
      className={className}
      loading="lazy"
    />
  );
}

