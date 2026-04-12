"use client";

import { motion } from "framer-motion";
import {
  ArrowRight,
  Braces,
  Database,
  FileCheck2,
  Search,
  Sparkles,
} from "lucide-react";

import { SectionHeading } from "@/components/shared/section-heading";
import { Card, CardContent } from "@/components/ui/card";
import { architectureStages } from "@/lib/demo-data";

const icons = [FileCheck2, Search, Database, Braces, Sparkles];

export function PipelineSection() {
  return (
    <section id="architecture" className="mx-auto w-full max-w-7xl px-6 py-20 lg:px-10">
      <SectionHeading
        eyebrow="About Architecture"
        title="A visual flow that explains the system without hiding the engineering."
        description="The architecture is intentionally presentation-friendly: each stage exposes a narrow responsibility, a structured output, and a clear handoff to the next stage. That makes the system easier to debug, easier to evaluate, and easier to explain."
      />

      <div className="mt-12 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <Card className="overflow-hidden p-6 sm:p-8">
          <div className="grid gap-4">
            {architectureStages.map((stage, index) => {
              const Icon = icons[index];
              return (
                <motion.div
                  key={stage.id}
                  initial={{ opacity: 0, x: -18 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, amount: 0.35 }}
                  transition={{ duration: 0.45, delay: index * 0.08 }}
                  className="relative rounded-[24px] border border-white/8 bg-white/4 p-5"
                >
                  {index < architectureStages.length - 1 ? (
                    <div className="absolute bottom-[-1.15rem] left-10 z-10 flex h-8 w-8 items-center justify-center rounded-full border border-white/8 bg-background/90 text-muted-foreground">
                      <ArrowRight className="h-3.5 w-3.5 rotate-90" />
                    </div>
                  ) : null}
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/8 bg-secondary text-secondary-foreground">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-3">
                        <p className="text-sm font-semibold tracking-[0.18em] text-primary uppercase">
                          Stage {stage.shortLabel}
                        </p>
                        <div className="rounded-full border border-white/8 bg-white/5 px-3 py-1 text-xs text-muted-foreground">
                          {stage.output}
                        </div>
                      </div>
                      <h3 className="mt-3 text-xl font-semibold text-foreground">{stage.title}</h3>
                      <p className="mt-2 max-w-xl text-sm leading-7 text-muted-foreground">
                        {stage.description}
                      </p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </Card>

        <div className="grid gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="eyebrow">Why It Works</div>
              <div className="mt-5 space-y-5">
                <Insight
                  title="Prompt engineering in the small"
                  body="Every stage has a specific role, a schema contract, and a bounded retry path."
                />
                <Insight
                  title="Prompt engineering in the large"
                  body="The orchestration layer makes data flow, environment effects, and fallback behavior visible."
                />
                <Insight
                  title="Built for recent claims"
                  body="Curated recent-news examples include publication date and source metadata so outdated pretraining becomes measurable."
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="eyebrow">Demo Walkthrough</div>
              <ol className="mt-5 grid gap-4">
                {[
                  "Paste a paragraph or load a curated example.",
                  "Watch the pipeline move through extraction, retrieval, and verification.",
                  "Inspect evidence cards and label decisions claim by claim.",
                  "Use the evaluation view to compare the baseline against the orchestrated system.",
                ].map((item, index) => (
                  <li
                    key={item}
                    className="flex items-start gap-4 rounded-[22px] border border-white/8 bg-white/4 p-4"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                      {index + 1}
                    </div>
                    <p className="text-sm leading-7 text-muted-foreground">{item}</p>
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}

function Insight({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-[22px] border border-white/8 bg-white/4 p-4">
      <p className="font-semibold text-foreground">{title}</p>
      <p className="mt-2 text-sm leading-7 text-muted-foreground">{body}</p>
    </div>
  );
}
