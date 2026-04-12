import Link from "next/link";
import { ArrowRight, TrendingUp } from "lucide-react";

import { SectionHeading } from "@/components/shared/section-heading";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { evaluationTracks } from "@/lib/demo-data";

export function EvaluationSection() {
  return (
    <section className="mx-auto w-full max-w-7xl px-6 pb-24 lg:px-10">
      <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
        <SectionHeading
          eyebrow="Evaluation View"
          title="Baseline versus multi-stage, in a format that is easy to show on slides."
          description="The frontend includes a presentation-ready evaluation view with benchmark and recent-news tracks, summary metrics, and success and failure case studies."
          className="max-w-3xl"
        />
        <Button asChild size="lg" variant="secondary">
          <Link href="/results">
            Open Results View
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>

      <div className="mt-12 grid gap-6 lg:grid-cols-2">
        {evaluationTracks.map((track) => {
          const accuracyDelta = Math.round(
            (track.multistage.accuracy - track.baseline.accuracy) * 100,
          );
          return (
            <Card key={track.id} className="overflow-hidden">
              <CardContent className="p-6 sm:p-7">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="eyebrow">{track.title}</div>
                    <h3 className="mt-4 text-2xl font-semibold text-foreground">
                      {track.description}
                    </h3>
                  </div>
                  <div className="rounded-full border border-emerald-400/15 bg-emerald-400/8 px-4 py-2 text-sm font-semibold text-emerald-200">
                    +{accuracyDelta} pts acc.
                  </div>
                </div>

                <p className="mt-5 text-sm leading-7 text-muted-foreground">
                  {track.challenge}
                </p>

                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  {[track.baseline, track.multistage].map((run) => (
                    <div
                      key={run.label}
                      className="rounded-[24px] border border-white/8 bg-white/4 p-4"
                    >
                      <p className="text-xs font-semibold tracking-[0.2em] text-muted-foreground uppercase">
                        {run.label}
                      </p>
                      <div className="mt-4 grid gap-3">
                        <Metric label="Accuracy" value={`${Math.round(run.accuracy * 100)}%`} />
                        <Metric label="Macro F1" value={run.macroF1.toFixed(2)} />
                        <Metric label="Recall@K" value={run.recallAtK.toFixed(2)} />
                        <Metric label="NEI Rate" value={`${Math.round(run.predictedNeiRate * 100)}%`} />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 flex items-start gap-3 rounded-[22px] border border-primary/15 bg-primary/8 p-4 text-sm leading-7 text-secondary-foreground">
                  <TrendingUp className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <p>{track.highlight}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </section>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="metric-value text-sm font-semibold text-foreground">{value}</span>
    </div>
  );
}
