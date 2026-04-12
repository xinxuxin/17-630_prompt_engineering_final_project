import { ExternalLink, Quote } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { ClaimAssessment } from "@/lib/types";

function labelVariant(label: ClaimAssessment["label"]) {
  if (label === "supported") return "supported";
  if (label === "refuted") return "refuted";
  return "nei";
}

function labelText(label: ClaimAssessment["label"]) {
  if (label === "not_enough_info") return "Not Enough Info";
  return label.charAt(0).toUpperCase() + label.slice(1);
}

export function ClaimResultCard({ claim }: { claim: ClaimAssessment }) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Badge variant={labelVariant(claim.label)}>{labelText(claim.label)}</Badge>
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">
            Confidence {Math.round(claim.confidence * 100)}%
          </p>
        </div>
        <div>
          <CardTitle className="text-xl leading-8">{claim.claim_text}</CardTitle>
          <CardDescription className="mt-2">{claim.justification}</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid gap-3">
          {claim.evidence.map((item) => (
            <div
              key={item.evidence_id}
              className="rounded-[22px] border border-white/60 bg-white/75 p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-medium">{item.title}</p>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    <Quote className="mr-1 inline h-3.5 w-3.5" />
                    {item.snippet}
                  </p>
                </div>
                {item.url ? (
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-full bg-secondary px-3 py-2 text-secondary-foreground transition hover:opacity-85"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                ) : null}
              </div>
              <p className="mt-3 font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">
                score {item.score.toFixed(2)}
                {item.published_at ? ` · ${item.published_at}` : ""}
              </p>
            </div>
          ))}
        </div>

        {claim.corrected_rewrite ? (
          <>
            <Separator />
            <div className="rounded-[22px] bg-[#f8fbff] p-4 ring-1 ring-border">
              <p className="text-xs font-semibold tracking-[0.18em] text-primary uppercase">
                Corrected Rewrite
              </p>
              <p className="mt-3 text-base leading-7">{claim.corrected_rewrite.text}</p>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                {claim.corrected_rewrite.edit_summary}
              </p>
            </div>
          </>
        ) : null}
      </CardContent>
    </Card>
  );
}
