import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { StageTrace } from "@/lib/types";

const stageLabels: Record<string, string> = {
  claim_extraction: "Claim Extraction",
  evidence_retrieval: "Evidence Retrieval",
  verdict_classification: "Verdict Classification",
  corrective_rewrite: "Corrective Rewrite",
};

export function StageTimeline({ stages }: { stages: StageTrace[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Pipeline Trace</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4 lg:grid-cols-3">
        {stages.map((stage, index) => (
          <div
            key={`${stage.stage}-${stage.duration_ms}-${index}`}
            className="rounded-[22px] border border-white/60 bg-white/68 p-4"
          >
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-medium">
                {stageLabels[stage.stage] ?? stage.stage}
              </p>
              <Badge variant={stage.status === "success" ? "supported" : "nei"}>
                {stage.status}
              </Badge>
            </div>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">{stage.detail}</p>
            <p className="mt-3 text-xs uppercase tracking-[0.18em] text-muted-foreground">
              {stage.duration_ms} ms · retries {stage.retries}
            </p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
