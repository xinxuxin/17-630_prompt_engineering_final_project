"use client";

import { motion } from "framer-motion";
import {
  Braces,
  CheckCheck,
  CircleDashed,
  Database,
  FileCheck2,
  Search,
  Sparkles,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { architectureStages } from "@/lib/demo-data";
import type { StageTrace } from "@/lib/types";

const iconMap = {
  claim_extraction: FileCheck2,
  query_generation: Search,
  evidence_retrieval: Database,
  verdict_classification: Braces,
  corrective_rewrite: Sparkles,
};

type PipelineProgressProps = {
  isRunning: boolean;
  activeIndex: number;
  traces?: StageTrace[];
};

export function PipelineProgress({
  isRunning,
  activeIndex,
  traces = [],
}: PipelineProgressProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Pipeline Progress</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4">
        {architectureStages.map((stage, index) => {
          const Icon = iconMap[stage.id as keyof typeof iconMap];
          const trace = traces.find((item) => item.stage === stage.id);
          const status = resolveStatus({
            isRunning,
            index,
            activeIndex,
            trace,
          });

          return (
            <motion.div
              key={stage.id}
              layout
              className="rounded-[24px] border border-white/8 bg-white/4 p-4"
            >
              <div className="flex items-start gap-4">
                <motion.div
                  animate={
                    status === "active"
                      ? { scale: [1, 1.06, 1] }
                      : { scale: 1 }
                  }
                  transition={{ repeat: Number.POSITIVE_INFINITY, duration: 1.8 }}
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/8 bg-white/6 text-primary"
                >
                  <Icon className="h-4.5 w-4.5" />
                </motion.div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-foreground">{stage.title}</p>
                      <p className="mt-1 text-xs tracking-[0.18em] text-muted-foreground uppercase">
                        {stage.output}
                      </p>
                    </div>
                    <StatusBadge status={status} trace={trace} />
                  </div>
                  <p className="mt-3 text-sm leading-7 text-muted-foreground">
                    {trace?.detail ?? stage.description}
                  </p>
                  <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/6">
                    <motion.div
                      className="h-full rounded-full bg-gradient-to-r from-primary to-[#88f0db]"
                      initial={false}
                      animate={{
                        width:
                          status === "complete"
                            ? "100%"
                            : status === "active"
                              ? "72%"
                              : "10%",
                        opacity: status === "queued" ? 0.35 : 1,
                      }}
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </CardContent>
    </Card>
  );
}

function resolveStatus({
  isRunning,
  index,
  activeIndex,
  trace,
}: {
  isRunning: boolean;
  index: number;
  activeIndex: number;
  trace?: StageTrace;
}) {
  if (trace) {
    return "complete" as const;
  }
  if (isRunning) {
    if (index < activeIndex) return "complete" as const;
    if (index === activeIndex) return "active" as const;
  }
  return "queued" as const;
}

function StatusBadge({
  status,
  trace,
}: {
  status: "complete" | "active" | "queued";
  trace?: StageTrace;
}) {
  if (status === "complete") {
    return (
      <Badge variant={trace?.status === "fallback" ? "nei" : "supported"}>
        <CheckCheck className="mr-1 h-3.5 w-3.5" />
        {trace?.status === "fallback" ? "Fallback" : "Complete"}
      </Badge>
    );
  }

  if (status === "active") {
    return (
      <Badge variant="default">
        <CircleDashed className="mr-1 h-3.5 w-3.5 animate-spin" />
        Running
      </Badge>
    );
  }

  return <Badge variant="nei">Queued</Badge>;
}
