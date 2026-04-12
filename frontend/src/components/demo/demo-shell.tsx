"use client";

import {
  startTransition,
  useEffect,
  useEffectEvent,
  useState,
} from "react";
import { useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  LoaderCircle,
  Play,
  RefreshCcw,
  Sparkles,
} from "lucide-react";

import { ClaimResultCard } from "@/components/demo/claim-result-card";
import { PipelineProgress } from "@/components/demo/pipeline-progress";
import { ResultOverview } from "@/components/demo/result-overview";
import { StageTimeline } from "@/components/demo/stage-timeline";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { architectureStages, exampleCases } from "@/lib/demo-data";
import { getLocalSample, runFactCheckRequest } from "@/lib/api";
import type { ExampleCase, FactCheckResponse } from "@/lib/types";

export function DemoShell() {
  const searchParams = useSearchParams();
  const initialCase = getExampleById(searchParams.get("example")) ?? exampleCases[1];

  const [selectedCase, setSelectedCase] = useState<ExampleCase>(initialCase);
  const [inputText, setInputText] = useState(initialCase.inputText);
  const [result, setResult] = useState<FactCheckResponse | null>(
    getLocalSample(initialCase.id),
  );
  const [sourceMode, setSourceMode] = useState<"sample" | "live" | "fallback">("sample");
  const [statusMessage, setStatusMessage] = useState(
    "A curated presentation sample is loaded by default. You can run the backend or keep the safe local mode.",
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [activeStageIndex, setActiveStageIndex] = useState(0);

  const advanceStage = useEffectEvent(() => {
    setActiveStageIndex((current) =>
      current >= architectureStages.length - 1 ? current : current + 1,
    );
  });

  useEffect(() => {
    if (!isRunning) {
      return;
    }

    setActiveStageIndex(0);
    const interval = window.setInterval(() => {
      advanceStage();
    }, 820);

    return () => {
      window.clearInterval(interval);
    };
  }, [isRunning]);

  useEffect(() => {
    if (searchParams.get("autoload") !== "sample") {
      return;
    }

    const requestedCase = getExampleById(searchParams.get("example"));
    if (!requestedCase) {
      return;
    }

    startTransition(() => {
      setSelectedCase(requestedCase);
      setInputText(requestedCase.inputText);
      setResult(getLocalSample(requestedCase.id));
      setSourceMode("sample");
      setStatusMessage("Loaded a presentation-safe sample from the landing page.");
      setErrorMessage(null);
    });
  }, [searchParams]);

  async function handleRun() {
    setIsRunning(true);
    setErrorMessage(null);
    setStatusMessage("Running the full pipeline and updating the stage progress as results arrive.");

    try {
      const liveResult = await runFactCheckRequest(inputText, selectedCase.dataset);
      startTransition(() => {
        setResult(liveResult);
        setSourceMode("live");
        setStatusMessage("Live backend response loaded successfully.");
      });
    } catch {
      const fallback = getLocalSample(selectedCase.id);
      if (fallback) {
        startTransition(() => {
          setResult(fallback);
          setSourceMode("fallback");
          setStatusMessage(
            "Backend unavailable. The UI fell back to a curated local sample so the demo remains stable.",
          );
        });
      } else {
        startTransition(() => {
          setResult(null);
          setErrorMessage("The backend request failed and no local sample was available for this input.");
          setStatusMessage("The run could not be completed.");
        });
      }
    } finally {
      setIsRunning(false);
      setActiveStageIndex(architectureStages.length - 1);
    }
  }

  function handleSelect(exampleCase: ExampleCase) {
    startTransition(() => {
      setSelectedCase(exampleCase);
      setInputText(exampleCase.inputText);
      setResult(getLocalSample(exampleCase.id));
      setSourceMode("sample");
      setStatusMessage("Loaded a curated example input and presentation-safe sample output.");
      setErrorMessage(null);
    });
  }

  function handleReset() {
    handleSelect(selectedCase);
  }

  return (
    <section className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-6 py-8 lg:px-10">
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="grid gap-6 lg:grid-cols-[380px_minmax(0,1fr)]"
      >
        <Card className="h-fit">
          <CardHeader>
            <div className="eyebrow">Interactive Demo</div>
            <CardTitle className="mt-5 text-3xl">Run the pipeline live or stay in safe presentation mode.</CardTitle>
            <CardDescription className="text-base">
              Choose an example, edit the input, and inspect how the multi-stage system responds claim by claim.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              {exampleCases.map((exampleCase) => (
                <button
                  key={exampleCase.id}
                  type="button"
                  onClick={() => handleSelect(exampleCase)}
                  className={`w-full rounded-[24px] border p-4 text-left transition-all ${
                    selectedCase.id === exampleCase.id
                      ? "border-primary/30 bg-primary/8 shadow-[0_20px_45px_rgba(0,0,0,0.18)]"
                      : "border-white/8 bg-white/4 hover:bg-white/6"
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-semibold text-foreground">{exampleCase.title}</p>
                    <Badge
                      variant={
                        exampleCase.dataset === "benchmark"
                          ? "supported"
                          : exampleCase.dataset === "recent_news"
                            ? "refuted"
                            : "nei"
                      }
                    >
                      {exampleCase.dataset}
                    </Badge>
                  </div>
                  <p className="mt-2 text-sm leading-7 text-muted-foreground">
                    {exampleCase.blurb}
                  </p>
                  <p className="mt-3 text-xs font-medium tracking-[0.16em] text-primary uppercase">
                    {exampleCase.highlight}
                  </p>
                </button>
              ))}
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs font-semibold tracking-[0.18em] text-muted-foreground uppercase">
                  Input Text
                </p>
                <button
                  type="button"
                  onClick={handleReset}
                  className="inline-flex items-center gap-2 text-xs text-muted-foreground transition hover:text-foreground"
                >
                  <RefreshCcw className="h-3.5 w-3.5" />
                  Reset example
                </button>
              </div>
              <Textarea
                value={inputText}
                onChange={(event) => setInputText(event.target.value)}
                placeholder="Paste a paragraph or write your own fact-check target."
              />
            </div>

            <div className="flex flex-wrap gap-3">
              <Button onClick={handleRun} size="lg" disabled={isRunning || inputText.trim().length < 10}>
                {isRunning ? (
                  <>
                    <LoaderCircle className="h-4 w-4 animate-spin" />
                    Running pipeline
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4" />
                    Analyze text
                  </>
                )}
              </Button>
              <Button
                onClick={() => handleSelect(selectedCase)}
                variant="secondary"
                size="lg"
              >
                <Sparkles className="h-4 w-4" />
                Reload sample
              </Button>
            </div>

            <div className="rounded-[24px] border border-white/8 bg-white/4 p-4">
              <p className="text-sm leading-7 text-muted-foreground">{statusMessage}</p>
              {errorMessage ? (
                <div className="mt-4 flex items-start gap-3 rounded-[18px] border border-[#72322a] bg-[rgba(226,102,73,0.12)] p-3 text-sm text-[#ffd1c7]">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                  <p>{errorMessage}</p>
                </div>
              ) : null}
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

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, delay: 0.06 }}
      >
        <Tabs defaultValue="results">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="eyebrow">Analysis Workspace</div>
              <h2 className="mt-4 text-3xl font-semibold text-foreground">
                Inspect verdicts, evidence, and pipeline metadata.
              </h2>
            </div>
            <TabsList>
              <TabsTrigger value="results">Claim Results</TabsTrigger>
              <TabsTrigger value="trace">Pipeline Trace</TabsTrigger>
              <TabsTrigger value="metadata">Run Metadata</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="results">
            <AnimatePresence mode="wait">
              {result ? (
                <ScrollArea className="h-[78vh] pr-3">
                  <div className="space-y-5">
                    {result.claims.map((claim, index) => (
                      <ClaimResultCard key={`${result.run_id}-${claim.claim_id}`} claim={claim} index={index} />
                    ))}
                  </div>
                </ScrollArea>
              ) : (
                <EmptyState />
              )}
            </AnimatePresence>
          </TabsContent>

          <TabsContent value="trace">
            {result ? <StageTimeline stages={result.stage_trace} /> : <EmptyState compact />}
          </TabsContent>

          <TabsContent value="metadata">
            {result ? (
              <Card>
                <CardContent className="grid gap-4 p-6 sm:grid-cols-2 xl:grid-cols-4">
                  <MetaStat label="Run ID" value={result.run_id} mono />
                  <MetaStat label="Dataset" value={result.dataset_name} />
                  <MetaStat
                    label="Provider"
                    value={result.pipeline_metadata?.provider_name ?? sourceMode}
                  />
                  <MetaStat
                    label="Stage Fallbacks"
                    value={String(result.pipeline_metadata?.total_stage_fallbacks ?? 0)}
                  />
                </CardContent>
              </Card>
            ) : (
              <EmptyState compact />
            )}
          </TabsContent>
        </Tabs>
      </motion.div>
    </section>
  );
}

function MetaStat({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="rounded-[22px] border border-white/8 bg-white/4 p-4">
      <p className="text-xs font-semibold tracking-[0.18em] text-muted-foreground uppercase">
        {label}
      </p>
      <p className={`mt-3 text-sm text-foreground ${mono ? "font-mono break-all" : ""}`}>
        {value}
      </p>
    </div>
  );
}

function EmptyState({ compact = false }: { compact?: boolean }) {
  return (
    <Card>
      <CardContent className={`flex flex-col items-center justify-center ${compact ? "py-12" : "py-20"}`}>
        <div className="rounded-full border border-white/8 bg-white/5 p-4 text-primary">
          <Sparkles className="h-5 w-5" />
        </div>
        <p className="mt-4 text-lg font-semibold text-foreground">No analysis loaded yet.</p>
        <p className="mt-2 max-w-lg text-center text-sm leading-7 text-muted-foreground">
          Load an example or run the pipeline to populate this workspace with claims, evidence cards, and stage traces.
        </p>
      </CardContent>
    </Card>
  );
}

function getExampleById(exampleId: string | null) {
  if (!exampleId) {
    return null;
  }
  return exampleCases.find((exampleCase) => exampleCase.id === exampleId) ?? null;
}
