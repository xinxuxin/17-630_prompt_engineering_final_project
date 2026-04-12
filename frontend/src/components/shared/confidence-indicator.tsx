"use client";

import { cn } from "@/lib/utils";

type ConfidenceIndicatorProps = {
  value: number;
  size?: "md" | "lg";
  label?: string;
  className?: string;
};

export function ConfidenceIndicator({
  value,
  size = "md",
  label = "Confidence",
  className,
}: ConfidenceIndicatorProps) {
  const normalized = Math.max(0, Math.min(1, value));
  const angle = Math.round(normalized * 360);
  const isLarge = size === "lg";
  const descriptor =
    normalized >= 0.8
      ? "High"
      : normalized >= 0.6
        ? "Strong"
        : normalized >= 0.4
          ? "Moderate"
          : "Cautious";

  return (
    <div
      className={cn(
        "confidence-shell flex flex-col items-center justify-center rounded-[28px] border border-white/8",
        isLarge ? "gap-3 px-5 py-4" : "gap-2 px-4 py-3",
        className,
      )}
    >
      <div
        className={cn(
          "relative flex items-center justify-center rounded-full border border-white/10",
          isLarge ? "h-24 w-24" : "h-[4.5rem] w-[4.5rem]",
        )}
        style={{
          background: `conic-gradient(rgba(141, 199, 255, 0.95) ${angle}deg, rgba(255, 255, 255, 0.07) ${angle}deg)`,
        }}
      >
        <div
          className={cn(
            "absolute inset-[5px] rounded-full bg-[rgba(5,15,29,0.96)]",
            isLarge ? "inset-[6px]" : "inset-[5px]",
          )}
        />
        <div className="relative text-center">
          <div className={cn("metric-value font-semibold text-foreground", isLarge ? "text-2xl" : "text-lg")}>
            {Math.round(normalized * 100)}%
          </div>
          <div className="mt-0.5 text-[10px] tracking-[0.18em] text-muted-foreground uppercase">
            {descriptor}
          </div>
        </div>
      </div>
      <p className="text-xs font-semibold tracking-[0.18em] text-muted-foreground uppercase">
        {label}
      </p>
    </div>
  );
}
