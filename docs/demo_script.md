# Demo Script

## Purpose

This script is designed for a 10-minute final presentation demo of the implemented repository.

It assumes the team wants to show:

1. the problem clearly
2. the multi-stage system design
3. one benchmark-style success case
4. one recent-news stress case
5. at least one honest failure or limitation

The script is written to match the current repository:

- landing page: `/`
- interactive demo: `/demo`
- evaluation/results page: `/results`
- benchmark and recent-news examples already loaded in the frontend

## Before The Presentation

### Recommended setup

Open three browser tabs in advance:

1. [http://localhost:3000](http://localhost:3000)
2. [http://localhost:3000/demo](http://localhost:3000/demo)
3. [http://localhost:3000/results](http://localhost:3000/results)

### Recommended terminal setup

Run:

```bash
make backend
make frontend
```

If you want a fully presentation-safe mode, the frontend can still fall back to local sample outputs when the backend is unavailable.

### Presenter roles

If the team has multiple people:

1. Presenter 1: problem statement and architecture
2. Presenter 2: live demo
3. Presenter 3: results, failure analysis, and recommendations

## 10-Minute Flow

## 0:00-1:15 Problem Statement

Show the landing page.

Say:

- Our project is a multi-stage prompt-engineering fact-checking system rather than a single-prompt demo.
- The core challenge is that free-form text often contains multiple factual claims, and a one-shot prompt tends to mix extraction, retrieval, and judgment together.
- This gets even harder for recent claims, where model pretraining may be outdated.

Point to:

- the hero section
- the recent-news emphasis
- the system framing as prompt engineering in the small and in the large

## 1:15-2:45 Approach Overview

Stay on the landing page and scroll to the architecture section.

Say:

- We decompose the task into claim extraction, query generation, evidence retrieval plus reranking, verification, and optional correction rewriting.
- Every stage uses a strict schema boundary.
- The backend validates stage outputs, retries malformed outputs, caps loops, and falls back conservatively to `not_enough_info`.

Point to:

- the animated pipeline visualization
- the example showcase section
- the claim that recent-news freshness is explicit rather than assumed

## 2:45-5:30 Live Demo: Benchmark Example

Open `/demo`.

Load:

- `Benchmark Press Release`

Suggested narration:

1. This is a benchmark-style paragraph with multiple factual claims.
2. We run the full pipeline and inspect the output claim by claim.
3. Notice that the interface exposes the pipeline progress, evidence cards, confidence, and any corrected rewrite.

While the result is visible, point out:

- one supported claim
- one refuted claim
- one `not_enough_info` claim
- one corrected rewrite with citations

Recommended concrete example to mention:

- supported: 18 percent electricity reduction
- supported: $4 million project cost
- refuted: no state funding
- NEI: “first carbon-neutral campus in Pennsylvania”

Key message:

- the system is not just producing an answer
- it is exposing evidence-backed intermediate structure

## 5:30-7:15 Recent-News Stress Test

Still on `/demo`, load:

- `Recent Headline Bundle`

Suggested narration:

1. This example is meant to simulate the harder post-cutoff setting.
2. The key issue is that a model may sound confident about a recent headline even when its internal knowledge is stale.
3. Our system forces the decision to depend on retrieved evidence rather than just parametric memory.

Point to:

- the source metadata in evidence cards
- the refuted ridership claim
- the NEI handling for the unsupported budget-surplus claim

Recommended concrete example:

- “ridership doubled” is corrected by retrieved dashboard evidence showing about 24 percent growth

Key message:

- recent-news examples make retrieval quality much more important

## 7:15-8:45 Results View

Open `/results`.

Suggested narration:

1. We evaluate two modes: a single-prompt baseline and the full multi-stage system.
2. We also separate benchmark and curated recent-news tracks.
3. This lets us argue that improvements come from system design, not just prompt wording.

Point to:

- baseline versus multi-stage comparison cards
- benchmark track
- curated recent-news track
- one success case and one failure case

Recommended line:

- The recent-news track is especially important because it directly tests the outdated-pretraining problem.

## 8:45-9:35 Failure Analysis

Stay on `/results` or return to a slide.

Say:

- We do not claim the system is perfect.
- Failure can come from claim extraction mistakes, retrieval misses, topical-but-not-decisive evidence, or ambiguous claims that should remain unresolved.

Use one concrete limitation:

- the Blue Line budget-surplus claim remains unresolved because the system does not retrieve decisive financial evidence

Key message:

- the repository explicitly keeps negative evidence instead of hiding it

## 9:35-10:00 Close

End with:

1. The project demonstrates prompt engineering in the small through prompt design, schemas, retries, and output constraints.
2. It demonstrates prompt engineering in the large through orchestration, retrieval, environment effects, evaluation, and failure analysis.
3. The next steps are live provider integration, stronger corpora, and better calibration on recent claims.

## Fast Backup Plan

If time is short or the live backend is slow:

1. show the landing page quickly
2. open `/demo` and use the preloaded local sample
3. open `/results`
4. still cover benchmark, recent-news, and one failure case

This still supports the main course argument because the UI and repository structure reflect the implemented system design.

## Suggested Final Slide Or Spoken Close

Use a closing sentence like:

> Our main claim is not that one prompt can do fact checking well, but that a well-orchestrated prompt system can make fact checking more structured, auditable, and responsible.
