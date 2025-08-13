import React from "react";

export function Progress({ value = 0, className = "" }) {
  const v = Math.max(0, Math.min(100, Number(value) || 0));

  // Tailwind class + hex fallback (ensures color even if Tailwind classes are missing)
  let colorClass = "bg-red-500";
  let colorHex = "#ef4444";
  if (v >= 70) {
    colorClass = "bg-green-500";
    colorHex = "#16a34a";
  } else if (v >= 40) {
    colorClass = "bg-yellow-500";
    colorHex = "#eab308";
  }

  return (
    <div className={`relative h-3 w-full overflow-hidden rounded-full bg-gray-200 ${className}`}>
      <div
        className={`h-full transition-all duration-300 ${colorClass}`}
        style={{ width: `${v}%`, backgroundColor: colorHex }}
      />
    </div>
  );
}
