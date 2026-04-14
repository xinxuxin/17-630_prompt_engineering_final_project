"use client";

import Link from "next/link";
import { startTransition, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, LoaderCircle, Play, Sparkles } from "lucide-react";

import { ClaimResultCard } from "@/components/demo/claim-result-card";
import { PipelineProgress } from "@/components/demo/pipeline-progress";
import { ResultOverview } from "@/components/demo/result-overview";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { exampleCases } from "@/lib/demo-data";
import { getLocalSample, runFactCheckRequest } from "@/lib/api";
import type { FactCheckResponse } from "@/lib/types";

const featuredCase = exampleCases.find((item) => item.id === "recent_news_headline") ?? exampleCases[0];

export function PresentationCaseShell() {
  const [result, setResult] = useState<FactCheckResponse | null>(getLocalSample(featuredCase.id));
  const [sourceMode, setSourceMode] = useState<"sample" | "live" | "fallback">("sample");
  const [isRunning, setIsRunning] = useState(false);
  const [activeStageIndex, setActiveStageIndex] = useState(4);

  async function handleRunLive() {
    setIsRunning(true);
    setActiveStageIndex(1);

    const timer = window.setInterval(() => {
      setActiveStageIndex((current) => (current >= 4 ? current : current + 1));
    }, 850);

    try {
      const liveResult = await runFactCheckRequest(featuredCase.inputText, featuredCase.dataset);
      startTransition(() => {
        setResult(liveResult);
        setSourceMode("live");
      });
    } catch {
      const fallback = getLocalSample(featuredCase.id);
      startTransition(() => {
        setResult(fallback);
        setSourceMode("fallback");
      });
    } finally {
      window.clearInterval(timer);
      setIsRunning(false);
      setActiveStageIndex(4);
    }
  }

  return (
    <section className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-6 py-8 lg:px-10">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="grid gap-6 xl:grid-cols-[0.94fr_1.06fr]"
      >
        <Card className="presentation-frame overflow-hidden">
          <CardHeader>
            <div className="eyebrow">Showcase Mode</div>
            <CardTitle className="mt-5 text-4xl text-foreground">
              One strong example for a live presentation.
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="rounded-[28px] border border-white/10 bg-[rgba(8,20,36,0.96)] p-5">
              <p className="text-xs font-semibold tracking-[0.18em] text-muted-foreground uppercase">
                Featured input
              </p>
              <p className="mt-4 text-xl leading-9 text-foreground">
                {featuredCase.inputText}
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <SpotlightStat label="Track" value="Recent-news" />
              <SpotlightStat label="Why this case" value="Freshness + retrieval" />
            </div>

            <div className="rounded-[24px] border border-primary/14 bg-primary/8 p-4 text-sm leading-6 text-secondary-foreground">
              {featuredCase.highlight}
            </div>

            <div className="flex flex-wrap gap-3">
              <Button onClick={handleRunLive} size="lg" disabled={isRunning}>
                {isRunning ? (
                  <>
                    <LoaderCircle className="h-4 w-4 animate-spin" />
                    Running
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4" />
                    Run Live
                  </>
                )}
              </Button>
              <Button asChild size="lg" variant="secondary">
                <Link href={`/demo?example=${featuredCase.id}&autoload=sample`}>
                  Open Full Demo
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6">
          <PipelineProgress
            isRunning={isRunning}
            activeIndex={activeStageIndex}
            traces={result?.stage_trace}
          />
          {result ? <ResultOverview result={result} sourceMode={sourceMode} /> : null}
        </div>
      </motion.div>

      {result ? (
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.48, delay: 0.05 }}
          className="space-y-5"
        >
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="eyebrow">Featured Analysis</div>
              <h2 className="mt-4 text-3xl font-semibold text-foreground">
                Claim-by-claim verdicts with visible evidence.
              </h2>
            </div>
            <div className="metric-pill inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm text-secondary-foreground">
              <Sparkles className="h-4 w-4 text-primary" />
              Slide-ready layout
            </div>
          </div>

          <div className="space-y-5">
            {result.claims.map((claim, index) => (
              <ClaimResultCard key={`${claim.claim_id}-${index}`} claim={claim} index={index} />
            ))}
          </div>
        </motion.div>
      ) : null}
    </section>
  );
}

function SpotlightStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[22px] border border-white/10 bg-[rgba(9,24,44,0.92)] p-4">
      <p className="text-xs font-semibold tracking-[0.18em] text-muted-foreground uppercase">
        {label}
      </p>
      <p className="mt-3 text-lg font-semibold text-foreground">{value}</p>
    </div>
  );
}
