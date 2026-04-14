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

import { Card } from "@/components/ui/card";
import { architectureStages } from "@/lib/demo-data";

const icons = {
  claim_extraction: FileCheck2,
  query_generation: Search,
  evidence_retrieval: Database,
  verdict_classification: Braces,
  corrective_rewrite: Sparkles,
};

const stageNotes: Record<string, string> = {
  claim_extraction: "Atomic claims",
  query_generation: "Search-ready queries",
  evidence_retrieval: "Evidence + rerank",
  verdict_classification: "Supported / Refuted / NEI",
  corrective_rewrite: "Minimal cited rewrite",
};

export function ArchitecturePreview() {
  return (
    <Card className="presentation-frame overflow-hidden p-6 sm:p-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold tracking-[0.22em] text-primary uppercase">
            Live Architecture Preview
          </p>
          <h3 className="mt-3 text-2xl font-semibold text-foreground sm:text-3xl">
            A screenshot-ready flow for the whole system.
          </h3>
        </div>
        <div className="metric-pill rounded-full px-4 py-2 text-xs tracking-[0.2em] text-foreground uppercase">
          Prompt orchestration
        </div>
      </div>

      <div className="relative mt-8 overflow-hidden rounded-[28px] border border-white/10 bg-[rgba(8,20,36,0.92)] p-4 sm:p-5">
        <div className="absolute inset-x-8 top-1/2 hidden h-px -translate-y-1/2 bg-gradient-to-r from-transparent via-primary/40 to-transparent lg:block" />
        <motion.div
          className="absolute top-1/2 hidden h-3 w-24 -translate-y-1/2 rounded-full bg-gradient-to-r from-transparent via-primary/55 to-transparent blur-md lg:block"
          animate={{ x: ["-12%", "92%"] }}
          transition={{ duration: 5.2, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
        />

        <div className="grid gap-3 lg:grid-cols-5">
          {architectureStages.map((stage, index) => {
            const Icon = icons[stage.id as keyof typeof icons];

            return (
              <motion.div
                key={stage.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.42, delay: index * 0.06 }}
                className="relative"
              >
                <div className="rounded-[24px] border border-white/10 bg-[rgba(11,25,44,0.96)] p-4 shadow-[0_22px_45px_rgba(0,0,0,0.16)]">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-[rgba(7,18,32,0.95)] text-primary">
                      <Icon className="h-5 w-5" />
                    </div>
                    <p className="text-xs font-semibold tracking-[0.18em] text-primary uppercase">
                      {stage.shortLabel}
                    </p>
                  </div>

                  <p className="mt-4 text-base font-semibold text-foreground">
                    {stage.title}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-secondary-foreground">
                    {stageNotes[stage.id]}
                  </p>
                </div>

                {index < architectureStages.length - 1 ? (
                  <div className="mt-3 flex justify-center lg:absolute lg:-right-5 lg:top-1/2 lg:mt-0 lg:-translate-y-1/2">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-[rgba(7,18,32,0.95)] text-primary shadow-[0_14px_32px_rgba(0,0,0,0.18)]">
                      <ArrowRight className="h-4 w-4 lg:block" />
                    </div>
                  </div>
                ) : null}
              </motion.div>
            );
          })}
        </div>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-[1.1fr_0.9fr_0.9fr]">
        <Panel
          label="Input"
          title="Unstructured paragraph"
          body="One messy paragraph enters. The system turns it into inspectable, typed steps."
        />
        <Panel
          label="Grounding"
          title="Evidence stays visible"
          body="Dates, snippets, and source links remain attached to every claim-level decision."
        />
        <Panel
          label="Output"
          title="Verdicts you can defend"
          body="Claims, evidence, labels, confidence, and rewrite all fit cleanly on one screen."
        />
      </div>
    </Card>
  );
}

function Panel({
  label,
  title,
  body,
}: {
  label: string;
  title: string;
  body: string;
}) {
  return (
    <div className="rounded-[24px] border border-white/10 bg-[rgba(10,24,42,0.92)] p-4">
      <p className="text-xs font-semibold tracking-[0.18em] text-muted-foreground uppercase">
        {label}
      </p>
      <p className="mt-3 text-base font-semibold text-foreground">{title}</p>
      <p className="mt-2 text-sm leading-6 text-secondary-foreground">{body}</p>
    </div>
  );
}
