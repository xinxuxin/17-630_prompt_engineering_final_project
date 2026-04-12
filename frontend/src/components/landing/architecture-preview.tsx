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

import { architectureStages } from "@/lib/demo-data";
import { Card } from "@/components/ui/card";

const icons = {
  claim_extraction: FileCheck2,
  query_generation: Search,
  evidence_retrieval: Database,
  verdict_classification: Braces,
  corrective_rewrite: Sparkles,
};

export function ArchitecturePreview() {
  return (
    <Card className="presentation-frame overflow-hidden p-6 sm:p-8">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold tracking-[0.22em] text-primary uppercase">
            Live Architecture Preview
          </p>
          <h3 className="mt-3 text-2xl font-semibold text-foreground">
            A pipeline board that reads well on screen and on slides.
          </h3>
        </div>
        <div className="metric-pill rounded-full px-4 py-2 text-xs tracking-[0.2em] text-muted-foreground uppercase">
          Orchestrated system
        </div>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[220px_minmax(0,1fr)_220px]">
        <div className="rounded-[28px] border border-white/8 bg-white/4 p-5">
          <p className="text-xs font-semibold tracking-[0.18em] text-muted-foreground uppercase">
            Input
          </p>
          <div className="mt-4 space-y-4">
            <div className="rounded-[22px] border border-white/8 bg-[rgba(6,18,34,0.58)] p-4">
              <p className="text-sm leading-7 text-secondary-foreground">
                “A city transit briefing said the Blue Line opened early and ridership doubled.”
              </p>
            </div>
            <div className="metric-pill rounded-[20px] p-4 text-sm leading-7 text-muted-foreground">
              The raw paragraph arrives unstructured. The system turns it into atomic claims before
              retrieval and verification begin.
            </div>
          </div>
        </div>

        <div className="relative">
          <div className="absolute left-6 top-8 bottom-8 w-px pipeline-glow-line" />
          <motion.div
            className="absolute left-[21px] top-8 h-6 w-6 rounded-full bg-primary/30 blur-sm"
            animate={{ y: [0, 90, 180, 270, 360] }}
            transition={{ duration: 8, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
          />

          <div className="grid gap-4">
            {architectureStages.map((stage, index) => {
              const Icon = icons[stage.id as keyof typeof icons];
              return (
                <motion.div
                  key={stage.id}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.45, delay: index * 0.07 }}
                  className="relative pl-14"
                >
                  <div className="absolute left-0 top-5 flex h-12 w-12 items-center justify-center rounded-2xl border border-white/8 bg-white/6 text-primary shadow-[0_0_32px_rgba(141,199,255,0.12)]">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="rounded-[24px] border border-white/8 bg-[rgba(9,22,40,0.8)] p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs font-semibold tracking-[0.18em] text-primary uppercase">
                          Stage {stage.shortLabel}
                        </p>
                        <p className="mt-2 text-lg font-semibold text-foreground">{stage.title}</p>
                      </div>
                      <div className="hidden items-center gap-2 rounded-full border border-white/8 bg-white/5 px-3 py-1.5 text-[11px] tracking-[0.14em] text-muted-foreground uppercase sm:flex">
                        {stage.output}
                        <ArrowRight className="h-3.5 w-3.5" />
                      </div>
                    </div>
                    <p className="mt-3 text-sm leading-7 text-muted-foreground">
                      {stage.description}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        <div className="rounded-[28px] border border-white/8 bg-white/4 p-5">
          <p className="text-xs font-semibold tracking-[0.18em] text-muted-foreground uppercase">
            Outputs
          </p>
          <div className="mt-4 grid gap-4">
            {[
              "Typed claim list",
              "Evidence bundle with dates and URLs",
              "Verdicts + minimal corrected rewrite",
            ].map((item, index) => (
              <motion.div
                key={item}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.16 + index * 0.06 }}
                className="rounded-[22px] border border-white/8 bg-[rgba(6,18,34,0.58)] p-4"
              >
                <div className="flex items-center gap-3">
                  <div className="signal-dot text-primary" />
                  <p className="text-sm font-medium text-foreground">{item}</p>
                </div>
              </motion.div>
            ))}
            <div className="metric-pill rounded-[20px] p-4 text-sm leading-7 text-muted-foreground">
              The UI surfaces enough structure that a single screenshot can communicate both the
              system design and the result quality.
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
