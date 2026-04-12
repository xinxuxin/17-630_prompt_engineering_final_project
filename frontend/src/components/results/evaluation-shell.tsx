"use client";

import { motion } from "framer-motion";
import { ArrowUpRight, BarChart3, ShieldCheck, TriangleAlert } from "lucide-react";

import { SectionHeading } from "@/components/shared/section-heading";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { evaluationCaseStudies, evaluationTracks } from "@/lib/demo-data";

export function EvaluationShell() {
  const summaryCards = [
    {
      label: "Benchmark Accuracy Gain",
      value: `+${Math.round(
        (evaluationTracks[0].multistage.accuracy - evaluationTracks[0].baseline.accuracy) * 100,
      )} pts`,
    },
    {
      label: "Recent-News Accuracy Gain",
      value: `+${Math.round(
        (evaluationTracks[1].multistage.accuracy - evaluationTracks[1].baseline.accuracy) * 100,
      )} pts`,
    },
    {
      label: "Recent Retrieval Recall",
      value: evaluationTracks[1].multistage.recallAtK.toFixed(2),
    },
    {
      label: "NEI Guardrail Shift",
      value: `${Math.round(
        (evaluationTracks[1].multistage.predictedNeiRate -
          evaluationTracks[1].baseline.predictedNeiRate) *
          100,
      )} pts`,
    },
  ];

  return (
    <section className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-6 py-8 lg:px-10">
      <SectionHeading
        eyebrow="Evaluation / Results"
        title="A presentation-ready view of what the multi-stage system improves, and where it still fails."
        description="This page is designed for fast explanation under time pressure: key deltas are visible immediately, then each track drills down into metrics and case studies."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map((card, index) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.05 }}
          >
            <Card>
              <CardContent className="p-5">
                <p className="text-xs font-semibold tracking-[0.18em] text-muted-foreground uppercase">
                  {card.label}
                </p>
                <p className="metric-value mt-3 text-3xl font-semibold text-foreground">
                  {card.value}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <Tabs defaultValue={evaluationTracks[0].id}>
        <TabsList>
          {evaluationTracks.map((track) => (
            <TabsTrigger key={track.id} value={track.id}>
              {track.title}
            </TabsTrigger>
          ))}
        </TabsList>

        {evaluationTracks.map((track) => {
          const deltaAccuracy = track.multistage.accuracy - track.baseline.accuracy;
          const deltaRecall = track.multistage.recallAtK - track.baseline.recallAtK;
          const trackCases = evaluationCaseStudies.filter((item) => item.track === track.id);

          return (
            <TabsContent key={track.id} value={track.id} className="space-y-6">
              <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
                <Card>
                  <CardHeader>
                    <div className="eyebrow">{track.title}</div>
                    <CardTitle className="mt-5 text-2xl">{track.description}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-5">
                    <p className="text-sm leading-7 text-muted-foreground">{track.challenge}</p>
                    <div className="rounded-[24px] border border-primary/14 bg-primary/8 p-5">
                      <div className="flex items-center gap-2 text-primary">
                        <BarChart3 className="h-4 w-4" />
                        <p className="text-xs font-semibold tracking-[0.18em] uppercase">
                          Interpretation
                        </p>
                      </div>
                      <p className="mt-3 text-sm leading-7 text-secondary-foreground">
                        {track.highlight}
                      </p>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <DeltaCard
                        label="Accuracy Gain"
                        value={`${Math.round(deltaAccuracy * 100)} pts`}
                      />
                      <DeltaCard
                        label="Recall@K Gain"
                        value={deltaRecall.toFixed(2)}
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Baseline vs Multi-Stage</CardTitle>
                  </CardHeader>
                  <CardContent className="grid gap-4">
                    {[track.baseline, track.multistage].map((run) => (
                      <div
                        key={run.label}
                        className="rounded-[24px] border border-white/8 bg-white/4 p-5"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <p className="font-semibold text-foreground">{run.label}</p>
                          <Badge variant={run.label === "Multi-Stage" ? "supported" : "nei"}>
                            {run.claims} claims
                          </Badge>
                        </div>
                        <div className="mt-5 grid gap-4 sm:grid-cols-2">
                          <RunMetric label="Accuracy" value={run.accuracy} />
                          <RunMetric label="Macro F1" value={run.macroF1} />
                          <RunMetric label="Recall@K" value={run.recallAtK} />
                          <RunMetric label="Predicted NEI" value={run.predictedNeiRate} percentage />
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>

              <div className="grid gap-6 lg:grid-cols-3">
                {trackCases.map((caseStudy, index) => (
                  <motion.div
                    key={caseStudy.id}
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.35 }}
                    transition={{ duration: 0.4, delay: index * 0.05 }}
                  >
                    <Card className="h-full">
                      <CardContent className="flex h-full flex-col p-5">
                        <div className="flex items-center justify-between gap-3">
                          <Badge variant={caseStudy.outcome === "success" ? "supported" : "refuted"}>
                            {caseStudy.outcome}
                          </Badge>
                          {caseStudy.outcome === "success" ? (
                            <ShieldCheck className="h-4 w-4 text-emerald-300" />
                          ) : (
                            <TriangleAlert className="h-4 w-4 text-[#ffb6a4]" />
                          )}
                        </div>
                        <p className="mt-4 text-lg font-semibold text-foreground">
                          {caseStudy.title}
                        </p>
                        <p className="mt-3 text-sm leading-7 text-muted-foreground">
                          {caseStudy.claim}
                        </p>
                        <div className="mt-5 grid gap-3">
                          <CaseBlock label="Baseline" body={caseStudy.baselineOutcome} />
                          <CaseBlock label="Multi-Stage" body={caseStudy.multistageOutcome} highlight />
                        </div>
                        <div className="mt-auto pt-5 text-sm leading-7 text-secondary-foreground">
                          <ArrowUpRight className="mr-1 inline h-4 w-4 text-primary" />
                          {caseStudy.whyItMatters}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </TabsContent>
          );
        })}
      </Tabs>
    </section>
  );
}

function RunMetric({
  label,
  value,
  percentage = false,
}: {
  label: string;
  value: number;
  percentage?: boolean;
}) {
  return (
    <div className="rounded-[20px] border border-white/8 bg-white/4 p-4">
      <p className="text-xs font-semibold tracking-[0.18em] text-muted-foreground uppercase">
        {label}
      </p>
      <p className="metric-value mt-3 text-2xl font-semibold text-foreground">
        {percentage ? `${Math.round(value * 100)}%` : value.toFixed(2)}
      </p>
    </div>
  );
}

function DeltaCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[22px] border border-white/8 bg-white/4 p-4">
      <p className="text-xs font-semibold tracking-[0.18em] text-muted-foreground uppercase">
        {label}
      </p>
      <p className="metric-value mt-3 text-2xl font-semibold text-foreground">{value}</p>
    </div>
  );
}

function CaseBlock({
  label,
  body,
  highlight = false,
}: {
  label: string;
  body: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-[20px] border p-4 ${
        highlight
          ? "border-primary/14 bg-primary/8"
          : "border-white/8 bg-white/4"
      }`}
    >
      <p className="text-xs font-semibold tracking-[0.18em] text-muted-foreground uppercase">
        {label}
      </p>
      <p className="mt-2 text-sm leading-7 text-muted-foreground">{body}</p>
    </div>
  );
}
