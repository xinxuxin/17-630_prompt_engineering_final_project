import { ArrowRight, Database, FileCheck2, Search, Sparkles } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const stages = [
  {
    icon: FileCheck2,
    title: "Claim Extraction",
    description:
      "Decompose free-form text into atomic factual claims using a strict output schema.",
  },
  {
    icon: Search,
    title: "Evidence Retrieval",
    description:
      "Search the corpus with dense retrieval and a lexical fallback when the FAISS index is unavailable.",
  },
  {
    icon: Database,
    title: "Verdict Classification",
    description:
      "Judge each claim against retrieved evidence as supported, refuted, or not_enough_info.",
  },
  {
    icon: Sparkles,
    title: "Corrective Rewrite",
    description:
      "Optionally produce a minimally edited, citation-backed rewrite for refuted claims.",
  },
];

export function PipelineSection() {
  return (
    <section id="pipeline" className="mx-auto w-full max-w-7xl px-6 py-20 lg:px-10">
      <div className="mb-10 max-w-2xl">
        <p className="text-sm font-semibold tracking-[0.2em] text-primary uppercase">
          Pipeline
        </p>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight">
          Designed to make prompt boundaries visible.
        </h2>
        <p className="mt-4 text-base leading-7 text-muted-foreground">
          Instead of hiding everything inside one oversized prompt, the system exposes each
          decision boundary, validates each payload, and makes it easy to debug retrieval,
          classification, and rewrite behavior separately.
        </p>
      </div>

      <div className="grid gap-5 lg:grid-cols-4">
        {stages.map((stage, index) => (
          <Card key={stage.title} className="relative">
            <CardHeader>
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/70 text-primary ring-1 ring-border">
                <stage.icon className="h-5 w-5" />
              </div>
              <CardTitle>{stage.title}</CardTitle>
              <CardDescription>{stage.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-between text-sm text-muted-foreground">
              <span>Stage {index + 1}</span>
              {index < stages.length - 1 ? <ArrowRight className="h-4 w-4" /> : null}
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
