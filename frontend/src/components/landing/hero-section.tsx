"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Braces, ShieldCheck, Telescope } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const stats = [
  { label: "Pipeline Stages", value: "4" },
  { label: "Structured JSON", value: "Strict" },
  { label: "Fallback Policy", value: "Conservative NEI" },
];

export function HeroSection() {
  return (
    <section className="mx-auto grid w-full max-w-7xl gap-10 px-6 pb-18 pt-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-10 lg:pb-24 lg:pt-10">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55 }}
        className="flex flex-col justify-center"
      >
        <div className="mb-6 inline-flex w-fit items-center gap-2 rounded-full bg-white/70 px-4 py-2 text-xs font-medium tracking-[0.18em] text-primary uppercase ring-1 ring-border">
          Course Final Project Repository
        </div>
        <h1 className="max-w-3xl text-5xl font-semibold tracking-tight text-foreground sm:text-6xl">
          Multi-stage prompt engineering for grounded fact checking.
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
          A presentation-ready system that extracts atomic claims, retrieves evidence,
          applies strict schema-constrained judgment, and produces citation-backed
          corrective rewrites when the evidence is decisive.
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          <Button asChild size="lg">
            <Link href="/demo">
              Launch Interactive Demo
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button asChild size="lg" variant="secondary">
            <a href="#pipeline">See Pipeline Design</a>
          </Button>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-[24px] border border-white/60 bg-white/58 px-5 py-4 shadow-[0_16px_40px_rgba(15,23,42,0.05)]"
            >
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                {stat.label}
              </p>
              <p className="mt-2 text-xl font-semibold">{stat.value}</p>
            </div>
          ))}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.65, delay: 0.08 }}
      >
        <Card className="overflow-hidden rounded-[32px]">
          <CardHeader>
            <CardTitle>Large-system prompt orchestration</CardTitle>
            <CardDescription>
              The repository surfaces prompt engineering at both the micro and system levels.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4">
              <FeatureTile
                icon={Braces}
                title="Schema-constrained outputs"
                description="Every stage returns typed JSON with validation, retries, and repair boundaries."
              />
              <FeatureTile
                icon={Telescope}
                title="Evidence-grounded retrieval"
                description="Dense retrieval hooks, FAISS indexing, and fallback search keep judgment separate from lookup."
              />
              <FeatureTile
                icon={ShieldCheck}
                title="Conservative decision policy"
                description="Low-confidence cases fall back to not_enough_info instead of forcing brittle answers."
              />
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </section>
  );
}

function FeatureTile({
  icon: Icon,
  title,
  description,
}: {
  icon: typeof Braces;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-[24px] border border-white/60 bg-white/72 p-5">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-secondary text-secondary-foreground">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="font-medium">{title}</p>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">{description}</p>
        </div>
      </div>
    </div>
  );
}
