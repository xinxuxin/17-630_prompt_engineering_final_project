"use client";

import { motion } from "framer-motion";
import { ArrowRight, Braces, Database, FileCheck2, Search, Sparkles } from "lucide-react";

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
    <Card className="overflow-hidden p-6 sm:p-8">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold tracking-[0.22em] text-primary uppercase">
            Live Architecture Preview
          </p>
          <h3 className="mt-3 text-2xl font-semibold text-foreground">
            Prompt boundaries stay visible.
          </h3>
        </div>
        <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs tracking-[0.2em] text-muted-foreground uppercase">
          Multi-stage
        </div>
      </div>

      <div className="mt-8 grid gap-4">
        {architectureStages.map((stage, index) => {
          const Icon = icons[stage.id as keyof typeof icons];
          return (
            <motion.div
              key={stage.id}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: index * 0.08 }}
              className="relative"
            >
              {index < architectureStages.length - 1 ? (
                <div className="absolute left-8 top-16 h-12 w-px bg-gradient-to-b from-primary/60 to-transparent" />
              ) : null}
              <div className="pipeline-rail relative flex items-start gap-4 rounded-[26px] border border-white/8 p-4">
                <motion.div
                  className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/8 bg-white/6 text-primary"
                  animate={{ y: [0, -3, 0] }}
                  transition={{ repeat: Number.POSITIVE_INFINITY, duration: 3 + index * 0.2 }}
                >
                  <Icon className="h-5 w-5" />
                </motion.div>
                <div className="flex-1">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold text-foreground">{stage.title}</p>
                      <p className="mt-1 text-sm leading-6 text-muted-foreground">
                        {stage.description}
                      </p>
                    </div>
                    <div className="hidden items-center gap-2 rounded-full border border-white/8 bg-white/5 px-3 py-1.5 text-xs text-muted-foreground sm:flex">
                      {stage.output}
                      <ArrowRight className="h-3.5 w-3.5" />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </Card>
  );
}
