"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Play, Sparkles } from "lucide-react";

import { ArchitecturePreview } from "@/components/landing/architecture-preview";
import { Button } from "@/components/ui/button";

const stats = [
  { label: "Prompt Agents", value: "5" },
  { label: "Typed Outputs", value: "Strict JSON" },
  { label: "Fallback Policy", value: "Conservative NEI" },
  { label: "Recent-News Track", value: "Post-cutoff ready" },
];

export function HeroSection() {
  return (
    <section className="mx-auto grid w-full max-w-7xl gap-12 px-6 pb-20 pt-8 lg:grid-cols-[minmax(0,1.02fr)_minmax(420px,0.98fr)] lg:px-10 lg:pb-28 lg:pt-12">
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55 }}
        className="flex flex-col justify-center"
      >
        <div className="eyebrow">
          <Sparkles className="h-3.5 w-3.5" />
          Final Project Demo Interface
        </div>
        <h1 className="mt-7 max-w-4xl text-5xl font-semibold tracking-tight text-foreground sm:text-6xl xl:text-7xl">
          A premium interface for <span className="text-gradient">multi-stage, evidence-grounded</span>{" "}
          fact checking.
        </h1>
        <p className="mt-7 max-w-2xl text-lg leading-8 text-muted-foreground">
          This UI is built to explain the system clearly under presentation pressure: the
          pipeline stays visible, the evidence stays inspectable, and recent-news claims stay
          grounded in retrieved sources instead of stale model memory.
        </p>

        <div className="mt-9 flex flex-wrap gap-3">
          <Button asChild size="lg">
            <Link href="/demo">
              Try Demo
              <Play className="h-4 w-4" />
            </Link>
          </Button>
          <Button asChild size="lg" variant="secondary">
            <Link href="/demo?example=recent_news_headline&autoload=sample">
              Load Example
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button asChild size="lg" variant="ghost">
            <a href="#architecture">View Pipeline</a>
          </Button>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.12 + index * 0.06, duration: 0.42 }}
              className="surface-outline rounded-[24px] border border-white/8 bg-white/4 p-5 backdrop-blur-md"
            >
              <p className="text-xs font-semibold tracking-[0.2em] text-muted-foreground uppercase">
                {stat.label}
              </p>
              <p className="metric-value mt-3 text-xl font-semibold text-foreground">
                {stat.value}
              </p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.08 }}
        className="relative"
      >
        <ArchitecturePreview />
      </motion.div>
    </section>
  );
}
