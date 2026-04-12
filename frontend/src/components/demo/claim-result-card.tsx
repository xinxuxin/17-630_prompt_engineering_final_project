"use client";

import { motion } from "framer-motion";
import { ExternalLink, Quote, Search, WandSparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { ClaimAssessment } from "@/lib/types";

function labelVariant(label: ClaimAssessment["label"]) {
  if (label === "supported") return "supported";
  if (label === "refuted") return "refuted";
  return "nei";
}

function labelText(label: ClaimAssessment["label"]) {
  if (label === "not_enough_info") return "Not Enough Info";
  return label.charAt(0).toUpperCase() + label.slice(1);
}

export function ClaimResultCard({
  claim,
  index,
}: {
  claim: ClaimAssessment;
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.06 }}
    >
      <Card className="overflow-hidden">
        <CardHeader className="gap-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant={labelVariant(claim.label)}>{labelText(claim.label)}</Badge>
                <div className="rounded-full border border-white/8 bg-white/5 px-3 py-1 text-xs tracking-[0.18em] text-muted-foreground uppercase">
                  Claim {String(index + 1).padStart(2, "0")}
                </div>
              </div>
              <CardTitle className="max-w-3xl text-2xl leading-9">
                {claim.claim_text}
              </CardTitle>
            </div>
            <div className="rounded-[22px] border border-white/8 bg-white/4 px-4 py-3 text-right">
              <p className="text-xs font-semibold tracking-[0.18em] text-muted-foreground uppercase">
                Confidence
              </p>
              <p className="metric-value mt-2 text-2xl font-semibold text-foreground">
                {Math.round(claim.confidence * 100)}%
              </p>
            </div>
          </div>
          <CardDescription className="max-w-4xl text-base leading-8">
            {claim.justification}
          </CardDescription>
          {claim.query_text ? (
            <div className="flex flex-wrap items-center gap-3 rounded-[22px] border border-white/8 bg-white/4 px-4 py-3 text-sm text-muted-foreground">
              <Search className="h-4 w-4 text-primary" />
              <span className="font-medium text-foreground">Retrieval query</span>
              <span className="font-mono text-xs text-muted-foreground">{claim.query_text}</span>
            </div>
          ) : null}
        </CardHeader>

        <CardContent className="space-y-5">
          <div className="grid gap-4">
            {claim.evidence.map((item) => (
              <motion.div
                key={item.evidence_id}
                whileHover={{ y: -2 }}
                className="rounded-[24px] border border-white/8 bg-white/4 p-5 transition-shadow"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold text-foreground">{item.title}</p>
                      {item.stance_hint ? (
                        <Badge
                          variant={
                            item.stance_hint === "supports"
                              ? "supported"
                              : item.stance_hint === "refutes"
                                ? "refuted"
                                : "nei"
                          }
                        >
                          {item.stance_hint}
                        </Badge>
                      ) : null}
                    </div>
                    <p className="mt-3 text-sm leading-7 text-muted-foreground">
                      <Quote className="mr-1 inline h-3.5 w-3.5 text-primary" />
                      {item.snippet}
                    </p>
                  </div>
                  {item.url ? (
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-full border border-white/8 bg-white/6 p-2.5 text-muted-foreground transition hover:text-foreground"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  ) : null}
                </div>

                <div className="mt-4 flex flex-wrap gap-3 text-xs text-muted-foreground">
                  <span className="rounded-full border border-white/8 bg-white/5 px-3 py-1.5">
                    Score {item.score.toFixed(2)}
                  </span>
                  {item.published_at ? (
                    <span className="rounded-full border border-white/8 bg-white/5 px-3 py-1.5">
                      {item.published_at}
                    </span>
                  ) : null}
                  {item.source_document_id ? (
                    <span className="rounded-full border border-white/8 bg-white/5 px-3 py-1.5">
                      {item.source_document_id}
                    </span>
                  ) : null}
                </div>
              </motion.div>
            ))}
          </div>

          {claim.corrected_rewrite ? (
            <>
              <Separator className="bg-white/8" />
              <div className="rounded-[26px] border border-primary/14 bg-primary/8 p-5">
                <div className="flex items-center gap-2 text-primary">
                  <WandSparkles className="h-4 w-4" />
                  <p className="text-xs font-semibold tracking-[0.2em] uppercase">
                    Corrected Rewrite
                  </p>
                </div>
                <p className="mt-4 text-base leading-8 text-foreground">
                  {claim.corrected_rewrite.text}
                </p>
                <p className="mt-3 text-sm leading-7 text-muted-foreground">
                  {claim.corrected_rewrite.edit_summary}
                </p>
                {claim.corrected_rewrite.citations.length ? (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {claim.corrected_rewrite.citations.map((citation) => (
                      <a
                        key={citation.evidence_id}
                        href={citation.url ?? "#"}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-full border border-white/8 bg-white/6 px-3 py-1.5 text-xs text-secondary-foreground transition hover:text-foreground"
                      >
                        {citation.title}
                      </a>
                    ))}
                  </div>
                ) : null}
              </div>
            </>
          ) : null}
        </CardContent>
      </Card>
    </motion.div>
  );
}
