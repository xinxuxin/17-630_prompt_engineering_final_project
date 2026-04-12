import { cn } from "@/lib/utils";

type EvidenceRelevanceProps = {
  label: string;
  value: number;
  accent?: "blue" | "teal" | "amber";
};

const accentClasses = {
  blue: "from-primary to-[#6fdff0]",
  teal: "from-[#6ce5d0] to-[#9effef]",
  amber: "from-[#f6c67f] to-[#ffd8a6]",
};

export function EvidenceRelevance({
  label,
  value,
  accent = "blue",
}: EvidenceRelevanceProps) {
  const width = `${Math.max(6, Math.min(100, Math.round(value * 100)))}%`;

  return (
    <div className="grid gap-2">
      <div className="flex items-center justify-between gap-3 text-[11px] tracking-[0.14em] text-muted-foreground uppercase">
        <span>{label}</span>
        <span className="metric-value">{value.toFixed(2)}</span>
      </div>
      <div className="evidence-grid h-2 overflow-hidden rounded-full bg-white/6">
        <div
          className={cn("h-full rounded-full bg-gradient-to-r", accentClasses[accent])}
          style={{ width }}
        />
      </div>
    </div>
  );
}
