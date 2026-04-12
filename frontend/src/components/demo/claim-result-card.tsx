"use client";

import { motion } from "framer-motion";
import {
  ArrowRight,
  ExternalLink,
  Quote,
  Search,
  ShieldCheck,
  WandSparkles,
} from "lucide-react";

import { ConfidenceIndicator } from "@/components/shared/confidence-indicator";
import { EvidenceRelevance } from "@/components/shared/evidence-relevance";
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
      <Card className="presentation-frame overflow-hidden">
        <CardHeader className="gap-5">
          <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_180px] xl:items-start">
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant={labelVariant(claim.label)}>{labelText(claim.label)}</Badge>
                <div className="metric-pill rounded-full px-3 py-1 text-xs tracking-[0.18em] text-muted-foreground uppercase">
                  Claim {String(index + 1).padStart(2, "0")}
                </div>
                {claim.evidence.length ? (
                  <div className="metric-pill rounded-full px-3 py-1 text-xs tracking-[0.18em] text-muted-foreground uppercase">
                    {claim.evidence.length} evidence item{claim.evidence.length > 1 ? "s" : ""}
                  </div>
                ) : null}
              </div>
              <CardTitle className="max-w-3xl text-2xl leading-9">
                {claim.claim_text}
              </CardTitle>
              <div className="rounded-[22px] border border-white/8 bg-white/4 p-4">
                <p className="text-xs font-semibold tracking-[0.18em] text-primary uppercase">
                  Verification rationale
                </p>
                <CardDescription className="mt-3 max-w-4xl text-base leading-8">
                  {claim.justification}
                </CardDescription>
              </div>
            </div>
            <ConfidenceIndicator value={claim.confidence} size="lg" />
          </div>

          {claim.query_text ? (
            <div className="grid gap-3 rounded-[24px] border border-white/8 bg-white/4 px-4 py-4 text-sm text-muted-foreground">
              <div className="flex flex-wrap items-center gap-3">
                <Search className="h-4 w-4 text-primary" />
                <span className="font-medium text-foreground">Retrieval query</span>
                <span className="font-mono text-xs text-muted-foreground">{claim.query_text}</span>
              </div>
              {claim.alternative_queries?.length ? (
                <div className="flex flex-wrap gap-2">
                  {claim.alternative_queries.map((query) => (
                    <span
                      key={query}
                      className="metric-pill rounded-full px-3 py-1.5 font-mono text-[11px] text-muted-foreground"
                    >
                      {query}
                    </span>
                  ))}
                </div>
              ) : null}
            </div>
          ) : null}
        </CardHeader>

        <CardContent className="space-y-5">
          <div className="grid gap-4">
            {claim.evidence.map((item) => (
              <motion.div
                key={item.evidence_id}
                whileHover={{ y: -2, scale: 1.003 }}
                className="rounded-[24px] border border-white/8 bg-white/4 p-5 transition-shadow"
              >
                <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_220px]">
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
                    <div className="mt-4 flex flex-wrap gap-3 text-xs text-muted-foreground">
                      <span className="metric-pill rounded-full px-3 py-1.5">
                        Score {item.score.toFixed(2)}
                      </span>
                      {item.published_at ? (
                        <span className="metric-pill rounded-full px-3 py-1.5">
                          {item.published_at}
                        </span>
                      ) : null}
                      {item.source_document_id ? (
                        <span className="metric-pill rounded-full px-3 py-1.5">
                          {item.source_document_id}
                        </span>
                      ) : null}
                    </div>
                  </div>
                  <div className="rounded-[20px] border border-white/8 bg-[rgba(6,18,34,0.56)] p-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-xs font-semibold tracking-[0.18em] text-muted-foreground uppercase">
                        Evidence relevance
                      </p>
                      {item.url ? (
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-2 rounded-full border border-white/8 bg-white/6 px-3 py-1.5 text-[11px] tracking-[0.14em] text-muted-foreground uppercase transition hover:text-foreground"
                        >
                          Source
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      ) : null}
                    </div>
                    <div className="mt-4 grid gap-4">
                      <EvidenceRelevance
                        label="Combined signal"
                        value={item.score}
                        accent="blue"
                      />
                      <EvidenceRelevance
                        label="Retrieval"
                        value={item.retrieval_score ?? item.score}
                        accent="teal"
                      />
                      <EvidenceRelevance
                        label="Rerank"
                        value={item.rerank_score ?? item.score}
                        accent="amber"
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {claim.corrected_rewrite ? (
            <>
              <Separator className="bg-white/8" />
              <div className="rounded-[28px] border border-primary/14 bg-primary/8 p-5">
                <div className="flex items-center gap-2 text-primary">
                  <WandSparkles className="h-4 w-4" />
                  <p className="text-xs font-semibold tracking-[0.2em] uppercase">
                    Corrected Rewrite
                  </p>
                </div>
                <div className="mt-5 grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] lg:items-start">
                  <div className="rounded-[22px] border border-white/8 bg-[rgba(6,18,34,0.34)] p-4">
                    <p className="text-xs font-semibold tracking-[0.18em] text-muted-foreground uppercase">
                      Original claim
                    </p>
                    <p className="mt-3 text-sm leading-8 text-secondary-foreground">
                      {claim.claim_text}
                    </p>
                  </div>
                  <div className="flex h-full items-center justify-center text-primary">
                    <ArrowRight className="h-5 w-5 lg:mt-10" />
                  </div>
                  <div className="rounded-[22px] border border-primary/16 bg-[rgba(141,199,255,0.08)] p-4">
                    <p className="text-xs font-semibold tracking-[0.18em] text-primary uppercase">
                      Minimal corrected rewrite
                    </p>
                    <p className="mt-3 text-sm leading-8 text-foreground">
                      {claim.corrected_rewrite.text}
                    </p>
                  </div>
                </div>
                <div className="mt-4 rounded-[22px] border border-white/8 bg-[rgba(6,18,34,0.34)] p-4">
                  <div className="flex items-center gap-2 text-secondary-foreground">
                    <ShieldCheck className="h-4 w-4 text-primary" />
                    <p className="text-xs font-semibold tracking-[0.18em] uppercase">
                      Edit summary
                    </p>
                  </div>
                  <p className="mt-3 text-sm leading-7 text-muted-foreground">
                    {claim.corrected_rewrite.edit_summary}
                  </p>
                </div>
                {claim.corrected_rewrite.citations.length ? (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {claim.corrected_rewrite.citations.map((citation) => (
                      <a
                        key={citation.evidence_id}
                        href={citation.url ?? "#"}
                        target="_blank"
                        rel="noreferrer"
                        className="metric-pill rounded-full px-3 py-1.5 text-xs text-secondary-foreground transition hover:text-foreground"
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
