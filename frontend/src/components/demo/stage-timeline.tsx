import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { StageTrace } from "@/lib/types";

const stageLabels: Record<string, string> = {
  claim_extraction: "Claim Extraction",
  query_generation: "Query Generation",
  evidence_retrieval: "Evidence Retrieval",
  verdict_classification: "Verification",
  corrective_rewrite: "Correction Rewrite",
};

export function StageTimeline({ stages }: { stages: StageTrace[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Execution Trace</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4">
        {stages.map((stage, index) => (
          <div
            key={`${stage.stage}-${stage.duration_ms}-${index}`}
            className="rounded-[24px] border border-white/8 bg-white/4 p-5"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-semibold text-foreground">
                  {stageLabels[stage.stage] ?? stage.stage}
                </p>
                <p className="mt-1 text-xs tracking-[0.18em] text-muted-foreground uppercase">
                  {stage.duration_ms} ms · retries {stage.retries}
                </p>
              </div>
              <Badge variant={stage.status === "success" ? "supported" : "nei"}>
                {stage.status}
              </Badge>
            </div>
            <p className="mt-3 text-sm leading-7 text-muted-foreground">{stage.detail}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
