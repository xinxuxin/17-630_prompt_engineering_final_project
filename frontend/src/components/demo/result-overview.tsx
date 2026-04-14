import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { FactCheckResponse } from "@/lib/types";

type ResultOverviewProps = {
  result: FactCheckResponse;
  sourceMode: "sample" | "live" | "fallback";
};

export function ResultOverview({ result, sourceMode }: ResultOverviewProps) {
  const cards = [
    { label: "Claims", value: result.summary.total_claims },
    { label: "Supported", value: result.summary.supported },
    { label: "Refuted", value: result.summary.refuted },
    { label: "NEI", value: result.summary.not_enough_info },
  ];

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto]">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <Card key={card.label}>
            <CardContent className="p-5">
              <p className="text-xs font-semibold tracking-[0.18em] text-muted-foreground uppercase">
                {card.label}
              </p>
              <p className="metric-value mt-3 text-3xl font-semibold text-foreground">
                {card.value}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardContent className="flex h-full min-w-[220px] flex-col justify-between p-5">
          <div>
            <p className="text-xs font-semibold tracking-[0.18em] text-muted-foreground uppercase">
              Mode
            </p>
            <div className="mt-3">
              <Badge variant={sourceMode === "live" ? "supported" : "nei"}>
                {sourceMode === "live"
                  ? "Live backend"
                  : sourceMode === "fallback"
                    ? "Fallback sample"
                    : "Local sample"}
              </Badge>
            </div>
          </div>

          <div className="mt-6 text-sm leading-6 text-secondary-foreground">
            {result.pipeline_metadata ? (
              <>
                {result.pipeline_metadata.provider_name}
                {" · "}
                fallback {result.pipeline_metadata.total_stage_fallbacks}
              </>
            ) : (
              "Presentation-safe sample."
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
