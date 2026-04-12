"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { LoaderCircle, Sparkles } from "lucide-react";

import { ClaimResultCard } from "@/components/demo/claim-result-card";
import { StageTimeline } from "@/components/demo/stage-timeline";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { exampleCases } from "@/lib/demo-data";
import { getLocalSample, runFactCheckRequest } from "@/lib/api";
import type { ExampleCase, FactCheckResponse } from "@/lib/types";

export function DemoShell() {
  const [selectedCase, setSelectedCase] = useState<ExampleCase>(exampleCases[0]);
  const [inputText, setInputText] = useState(exampleCases[0].inputText);
  const [result, setResult] = useState<FactCheckResponse | null>(
    getLocalSample(exampleCases[0].id),
  );
  const [statusMessage, setStatusMessage] = useState(
    "Showing the local sample by default. Run the pipeline to query the backend.",
  );
  const [isRunning, setIsRunning] = useState(false);

  const summaryBadges = useMemo(() => {
    if (!result) {
      return [];
    }
    return [
      { label: "Claims", value: result.summary.total_claims.toString() },
      { label: "Supported", value: result.summary.supported.toString() },
      { label: "Refuted", value: result.summary.refuted.toString() },
      { label: "NEI", value: result.summary.not_enough_info.toString() },
    ];
  }, [result]);

  async function handleRun() {
    setIsRunning(true);
    try {
      const liveResult = await runFactCheckRequest(inputText, selectedCase.dataset);
      setResult(liveResult);
      setStatusMessage("Live backend response loaded successfully.");
    } catch {
      const fallback = getLocalSample(selectedCase.id);
      setResult(fallback);
      setStatusMessage(
        "Backend was unavailable, so the UI fell back to a presentation-safe local sample.",
      );
    } finally {
      setIsRunning(false);
    }
  }

  function handleSelect(exampleCase: ExampleCase) {
    setSelectedCase(exampleCase);
    setInputText(exampleCase.inputText);
    setResult(getLocalSample(exampleCase.id));
    setStatusMessage("Loaded curated example input and its local sample output.");
  }

  return (
    <section className="mx-auto grid w-full max-w-7xl gap-6 px-6 py-8 lg:grid-cols-[420px_minmax(0,1fr)] lg:px-10">
      <motion.div
        initial={{ opacity: 0, x: -18 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.45 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Interactive Demo</CardTitle>
            <CardDescription>
              Load benchmark or recent-news-style inputs, then inspect the claim-by-claim output.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-3">
              <p className="text-xs font-semibold tracking-[0.18em] text-muted-foreground uppercase">
                Example cases
              </p>
              {exampleCases.map((exampleCase) => (
                <button
                  key={exampleCase.id}
                  type="button"
                  onClick={() => handleSelect(exampleCase)}
                  className={`w-full rounded-[22px] border px-4 py-4 text-left transition ${
                    selectedCase.id === exampleCase.id
                      ? "border-primary/30 bg-white/85 shadow-[0_12px_24px_rgba(15,23,42,0.08)]"
                      : "border-white/60 bg-white/60"
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-medium">{exampleCase.title}</p>
                    <Badge variant={exampleCase.dataset === "benchmark" ? "supported" : "nei"}>
                      {exampleCase.dataset}
                    </Badge>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {exampleCase.blurb}
                  </p>
                </button>
              ))}
            </div>

            <div className="space-y-3">
              <p className="text-xs font-semibold tracking-[0.18em] text-muted-foreground uppercase">
                Input text
              </p>
              <Textarea value={inputText} onChange={(event) => setInputText(event.target.value)} />
            </div>

            <Button onClick={handleRun} className="w-full" size="lg" disabled={isRunning}>
              {isRunning ? (
                <>
                  <LoaderCircle className="h-4 w-4 animate-spin" />
                  Running pipeline
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Run Fact Check
                </>
              )}
            </Button>

            <p className="rounded-[20px] bg-secondary px-4 py-3 text-sm leading-6 text-secondary-foreground">
              {statusMessage}
            </p>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: 18 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.05 }}
        className="min-w-0"
      >
        <Tabs defaultValue="results">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <TabsList>
              <TabsTrigger value="results">Results</TabsTrigger>
              <TabsTrigger value="trace">Trace</TabsTrigger>
            </TabsList>
            <div className="flex flex-wrap gap-2">
              {summaryBadges.map((badge) => (
                <Badge key={badge.label}>{badge.label}: {badge.value}</Badge>
              ))}
            </div>
          </div>

          <TabsContent value="results">
            <ScrollArea className="h-[72vh] pr-3">
              <div className="space-y-5">
                {result?.claims.map((claim) => (
                  <ClaimResultCard key={claim.claim_id} claim={claim} />
                ))}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="trace">
            {result ? <StageTimeline stages={result.stage_trace} /> : null}
          </TabsContent>
        </Tabs>
      </motion.div>
    </section>
  );
}
