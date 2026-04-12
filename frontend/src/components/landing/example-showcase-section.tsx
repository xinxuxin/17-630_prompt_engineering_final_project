"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Quote, Sparkles } from "lucide-react";

import { SectionHeading } from "@/components/shared/section-heading";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { exampleCases, sampleResponses } from "@/lib/demo-data";

export function ExampleShowcaseSection() {
  return (
    <section className="mx-auto w-full max-w-7xl px-6 py-8 lg:px-10 lg:py-10">
      <SectionHeading
        eyebrow="Example Showcase"
        title="Three curated inputs, already framed for a clean live demo or slide screenshot."
        description="Each sample is tuned to tell a different story: a benchmark walkthrough, a recent-news retrieval stress test, and a flexible custom stack for live editing."
      />

      <div className="mt-12 grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <Card className="presentation-frame">
          <CardContent className="p-6 sm:p-7">
            <div className="flex items-center justify-between gap-3">
              <div className="eyebrow">
                <Sparkles className="h-3.5 w-3.5" />
                Preloaded Examples
              </div>
              <Button asChild variant="secondary">
                <Link href="/demo?example=recent_news_headline&autoload=sample">
                  Open in Demo
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>

            <div className="mt-8 grid gap-4">
              {exampleCases.map((exampleCase, index) => {
                const response = sampleResponses[exampleCase.id];
                return (
                  <motion.div
                    key={exampleCase.id}
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.35 }}
                    transition={{ duration: 0.38, delay: index * 0.06 }}
                    className="rounded-[26px] border border-white/8 bg-white/4 p-5"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-xl font-semibold text-foreground">
                            {exampleCase.title}
                          </p>
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
                      </div>
                      {response ? (
                        <div className="grid min-w-[180px] grid-cols-2 gap-2">
                          <MiniMetric label="Claims" value={response.summary.total_claims} />
                          <MiniMetric
                            label="Refuted"
                            value={response.summary.refuted}
                          />
                          <MiniMetric
                            label="Supported"
                            value={response.summary.supported}
                          />
                          <MiniMetric
                            label="NEI"
                            value={response.summary.not_enough_info}
                          />
                        </div>
                      ) : null}
                    </div>

                    <div className="story-divider my-5" />

                    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_220px]">
                      <div className="rounded-[22px] border border-white/8 bg-[rgba(6,18,34,0.58)] p-4">
                        <p className="text-xs font-semibold tracking-[0.18em] text-muted-foreground uppercase">
                          Input Snapshot
                        </p>
                        <p className="mt-3 text-sm leading-7 text-secondary-foreground">
                          <Quote className="mr-1 inline h-3.5 w-3.5 text-primary" />
                          {exampleCase.inputText}
                        </p>
                      </div>
                      <div className="rounded-[22px] border border-primary/14 bg-primary/8 p-4">
                        <p className="text-xs font-semibold tracking-[0.18em] text-primary uppercase">
                          Why It Plays Well
                        </p>
                        <p className="mt-3 text-sm leading-7 text-secondary-foreground">
                          {exampleCase.highlight}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6">
          <StoryCard
            eyebrow="Benchmark Story"
            title="Clean label diversity for a fast walkthrough"
            body="The benchmark sample shows supported, refuted, and NEI decisions in one screen, which makes it ideal for explaining the label taxonomy quickly."
          />
          <StoryCard
            eyebrow="Recent-News Story"
            title="Fresh claims force retrieval to do the real work"
            body="The recent-news sample highlights the exact course argument: stale model memory is not enough, so the UI keeps source dates and evidence snippets visible."
          />
          <StoryCard
            eyebrow="Screenshot Story"
            title="Composed for slides, not just interaction"
            body="Cards, spacing, and motion are deliberately tuned so a single screenshot still tells a coherent story when dropped into a presentation deck."
          />
        </div>
      </div>
    </section>
  );
}

function MiniMetric({ label, value }: { label: string; value: number }) {
  return (
    <div className="metric-pill rounded-[18px] px-3 py-3">
      <p className="text-[10px] font-semibold tracking-[0.18em] text-muted-foreground uppercase">
        {label}
      </p>
      <p className="metric-value mt-2 text-lg font-semibold text-foreground">{value}</p>
    </div>
  );
}

function StoryCard({
  eyebrow,
  title,
  body,
}: {
  eyebrow: string;
  title: string;
  body: string;
}) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="eyebrow">{eyebrow}</div>
        <p className="mt-5 text-2xl font-semibold text-foreground">{title}</p>
        <p className="mt-4 text-sm leading-8 text-muted-foreground">{body}</p>
      </CardContent>
    </Card>
  );
}
