# Final Submission Master Guide

## Purpose

This document is the single most detailed project reference in the repository.

It is meant to help a student team quickly turn the implemented repository into:

1. a slide deck
2. a 2-page report
3. a live demo script
4. a repository submission with a coherent technical story

It is intentionally written as a practical synthesis of the current codebase, not as a generic template.

If the team only reads one document before making slides and the report, this should be that document.

## Project Title

**Multi-Stage Prompt-Agent Automated Fact Checking System**

## One-Sentence Project Pitch

This project builds an end-to-end fact-checking system that decomposes free-form text into atomic factual claims, retrieves evidence, verifies each claim as supported, refuted, or not enough info, and optionally produces a minimally edited citation-backed correction.

## Short Abstract

The core idea of the project is that fact checking should not be treated as one giant prompt. Instead, it should be treated as a staged prompt-engineering system with explicit interfaces between stages. The repository therefore implements a multi-stage pipeline with typed schemas, validation, retries, conservative fallback behavior, evidence retrieval, and recent-news evaluation support. The system is designed to demonstrate prompt engineering in the small through prompt design, strict JSON outputs, and schema constraints, and prompt engineering in the large through orchestration, data flow, environment effects, evaluation, and failure analysis.

## Why This Project Exists

## Main motivation

Large language models can produce fluent answers, but fact checking is difficult because:

- one paragraph may contain several distinct factual claims
- evidence retrieval is a separate problem from verdict assignment
- recent or post-cutoff claims may not be covered reliably by pretraining
- weak evidence should lead to a cautious answer, not forced certainty

## Main claim

The project argues that better fact checking comes not only from writing a better prompt, but from designing a better prompt system.

That system-level perspective is the main intellectual contribution of the repository.

## Course alignment

This repository is explicitly aligned with prompt-engineering course goals.

It demonstrates:

- prompt engineering in the small
- prompt engineering in the large
- positive and negative evidence of performance
- benchmark evaluation
- recent-news evaluation where stale pretraining is a real concern
- presentation-friendly and report-friendly deliverables

## Core Project Idea

Instead of asking one model call to:

- read a paragraph
- split it into claims
- find evidence
- decide labels
- rewrite incorrect claims

the repository separates those responsibilities into distinct pipeline stages.

Each stage has:

- a narrow responsibility
- a strict input schema
- a strict output schema
- validation logic
- bounded retries
- conservative fallback behavior

This is the main system design principle of the entire project.

## High-Level System Overview

The implemented workflow is:

1. receive raw user text
2. extract atomic factual claims
3. generate retrieval-friendly queries
4. retrieve top-k evidence chunks from a local corpus
5. rerank retrieved evidence
6. verify each claim as `supported`, `refuted`, or `not_enough_info`
7. optionally generate a minimally edited corrected rewrite with citations
8. log structured outputs for analysis and evaluation

## Architecture Summary

## Backend

The backend is implemented in Python with FastAPI.

It includes:

- modular pipeline stages in `backend/app/pipeline`
- strict Pydantic schemas in `backend/app/schemas`
- provider abstraction in `backend/app/providers`
- retrieval interfaces and indexing support
- experiment output writing
- API endpoints for interactive use

## Frontend

The frontend is implemented with:

- Next.js
- TypeScript
- Tailwind CSS
- Framer Motion
- shadcn/ui-style component structure

It includes:

- a polished landing page
- an interactive demo page
- an evaluation/results page
- architecture storytelling visuals
- benchmark and recent-news examples
- live backend support with local fallback samples

## Evaluation

The evaluation layer includes:

- a single-prompt baseline
- a multi-stage system evaluation mode
- benchmark-style data
- curated recent-news data
- metrics and summary tables
- comparison artifacts

## Repository Layout

```text
.
├── backend/      FastAPI backend, pipeline, providers, schemas, services
├── frontend/     Next.js presentation UI and interactive demo
├── docs/         Architecture, prompts, evaluation, presentation/report materials
├── scripts/      Setup, indexing, evaluation runner
├── data/         Benchmark data, recent-news data, evidence corpus
├── eval/         Evaluation runners, metrics, datasets, report tables
├── examples/     Sample prompt and output materials
└── tests/        Backend tests
```

## Detailed Backend Design

## Main backend entry

- [backend/app/main.py](/Users/macbook/Desktop/17-630 prompt engineering final project/backend/app/main.py)

This starts the FastAPI application and exposes the API under `/api/v1`.

## API routes

- [backend/app/api/router.py](/Users/macbook/Desktop/17-630 prompt engineering final project/backend/app/api/router.py)

Implemented routes:

- `/api/v1/health`
- `/api/v1/analyze`
- `/api/v1/fact-check`
- `/api/v1/examples`

### Important route behavior

`/analyze` is the main current route for the frontend and returns:

- claims
- evidence per claim
- labels
- rationales
- corrected rewrite if enabled
- pipeline metadata

`/fact-check` is preserved for compatibility.

## Pipeline stages

The pipeline is orchestrated through:

- [backend/app/pipeline/orchestrator.py](/Users/macbook/Desktop/17-630 prompt engineering final project/backend/app/pipeline/orchestrator.py)

Implemented stage modules:

- [claim_extractor.py](/Users/macbook/Desktop/17-630 prompt engineering final project/backend/app/pipeline/claim_extractor.py)
- [query_generator.py](/Users/macbook/Desktop/17-630 prompt engineering final project/backend/app/pipeline/query_generator.py)
- [evidence_retriever.py](/Users/macbook/Desktop/17-630 prompt engineering final project/backend/app/pipeline/evidence_retriever.py)
- [evidence_reranker.py](/Users/macbook/Desktop/17-630 prompt engineering final project/backend/app/pipeline/evidence_reranker.py)
- [verifier.py](/Users/macbook/Desktop/17-630 prompt engineering final project/backend/app/pipeline/verifier.py)
- [correction_rewriter.py](/Users/macbook/Desktop/17-630 prompt engineering final project/backend/app/pipeline/correction_rewriter.py)

### Stage responsibilities

#### 1. ClaimExtractor

Input:

- raw source text
- extraction limit

Output:

- atomic claims
- source spans
- extraction notes

Why it matters:

- retrieval and verification are much easier when claims are split into smaller factual units

#### 2. QueryGenerator

Input:

- one atomic claim

Output:

- primary retrieval query
- optional alternative queries

Why it matters:

- it separates retrieval optimization from factual judgment

#### 3. EvidenceRetriever

Input:

- claim
- query bundle
- top-k setting

Output:

- retrieved evidence items
- retrieval strategy metadata

Why it matters:

- evidence retrieval is explicit rather than hidden inside the verifier

#### 4. EvidenceReranker

Input:

- claim
- retrieved evidence items

Output:

- reranked evidence items
- selected evidence ids
- weak-evidence signal

Why it matters:

- ranking evidence quality is a separate step from simply retrieving topical chunks

#### 5. Verifier

Input:

- claim
- reranked evidence bundle

Output:

- `supported`, `refuted`, or `not_enough_info`
- confidence
- rationale
- citation ids
- evidence strength

Why it matters:

- this is where the final factual decision is made, but only from the provided evidence

#### 6. CorrectionRewriter

Input:

- original claim
- verification result
- evidence bundle

Output:

- minimally edited corrected rewrite
- citation list
- edit summary

Why it matters:

- it turns fact checking into a user-facing corrective tool instead of only a label classifier

#### 7. PipelineOrchestrator

Role:

- execute the stages in order
- aggregate stage traces
- collect claim-level results
- produce summary statistics
- emit run metadata

Why it matters:

- this is prompt engineering in the large: the system behavior depends on how the stages are connected

## Schema design

The project uses strict Pydantic schemas across stage boundaries.

Key files:

- [backend/app/schemas/common.py](/Users/macbook/Desktop/17-630 prompt engineering final project/backend/app/schemas/common.py)
- [backend/app/schemas/claims.py](/Users/macbook/Desktop/17-630 prompt engineering final project/backend/app/schemas/claims.py)
- [backend/app/schemas/evidence.py](/Users/macbook/Desktop/17-630 prompt engineering final project/backend/app/schemas/evidence.py)
- [backend/app/schemas/verification.py](/Users/macbook/Desktop/17-630 prompt engineering final project/backend/app/schemas/verification.py)
- [backend/app/schemas/correction.py](/Users/macbook/Desktop/17-630 prompt engineering final project/backend/app/schemas/correction.py)
- [backend/app/schemas/pipeline.py](/Users/macbook/Desktop/17-630 prompt engineering final project/backend/app/schemas/pipeline.py)

### Important schema principles

- `extra='forbid'` style strictness
- explicit labels through `VerdictLabel`
- separate models for stage input and stage output
- response models suitable for both API and evaluation output

### Why this is important for the course

These schemas are a concrete example of prompt engineering in the small:

- prompts are written to match the schema
- model outputs are validated against the schema
- malformed outputs trigger repair or fallback logic

## Reliability and safety controls

The system includes multiple safeguards:

- max retries per stage
- max pipeline loop caps
- conservative `not_enough_info` fallback
- structured logging
- experiment output persistence

Relevant settings are defined in:

- [backend/app/core/settings.py](/Users/macbook/Desktop/17-630 prompt engineering final project/backend/app/core/settings.py)

Important configurable values include:

- provider selection
- OpenAI model name
- chunk size
- chunk overlap
- retrieval candidate pool
- max claims per request
- max stage retries
- max pipeline loops
- conservative NEI threshold

## Provider abstraction

Provider files:

- [backend/app/providers/base.py](/Users/macbook/Desktop/17-630 prompt engineering final project/backend/app/providers/base.py)
- [backend/app/providers/mock.py](/Users/macbook/Desktop/17-630 prompt engineering final project/backend/app/providers/mock.py)
- [backend/app/providers/openai.py](/Users/macbook/Desktop/17-630 prompt engineering final project/backend/app/providers/openai.py)

### Why provider abstraction matters

It lets the repository:

- run without external API access
- remain demo-safe
- support later real OpenAI integration

### Current design

- `mock` provider keeps the system runnable offline
- OpenAI-compatible provider is scaffolded for future live use

## Prompt design

Prompt files are externalized here:

- [backend/app/pipeline/prompt_templates](/Users/macbook/Desktop/17-630 prompt engineering final project/backend/app/pipeline/prompt_templates)

Implemented prompt families:

- claim extraction
- query generation
- verification
- correction rewrite

Prompt management:

- [backend/app/pipeline/prompt_manager.py](/Users/macbook/Desktop/17-630 prompt engineering final project/backend/app/pipeline/prompt_manager.py)

Prompt design summary:

- every prompt defines role, task, constraints, and output format
- prompts explicitly request JSON-only outputs
- verifier prompts explicitly encourage conservative NEI behavior
- correction prompts are minimal-edit and citation-aware

Extended explanation is in:

- [docs/prompt_design.md](/Users/macbook/Desktop/17-630 prompt engineering final project/docs/prompt_design.md)

## Retrieval subsystem

The repository implements a practical local retrieval subsystem.

Relevant files:

- [backend/retrieval/chunking.py](/Users/macbook/Desktop/17-630 prompt engineering final project/backend/retrieval/chunking.py)
- [backend/retrieval/index_store.py](/Users/macbook/Desktop/17-630 prompt engineering final project/backend/retrieval/index_store.py)
- [backend/retrieval/retriever.py](/Users/macbook/Desktop/17-630 prompt engineering final project/backend/retrieval/retriever.py)
- [backend/retrieval/reranker.py](/Users/macbook/Desktop/17-630 prompt engineering final project/backend/retrieval/reranker.py)
- [scripts/build_index.py](/Users/macbook/Desktop/17-630 prompt engineering final project/scripts/build_index.py)

### Retrieval features

- local evidence corpus support
- chunking with metadata preservation
- sentence-transformers embeddings
- FAISS indexing
- lexical fallback retrieval
- reranking layer
- evidence metadata preservation for frontend display

### Why retrieval matters

Retrieval quality strongly affects:

- claim verification quality
- rewrite quality
- recent-news robustness
- evaluation results

This is especially important for recent-news cases where model pretraining may be stale.

## Datasets and data design

## Benchmark-style dataset

Location:

- [data/benchmark/claims.jsonl](/Users/macbook/Desktop/17-630 prompt engineering final project/data/benchmark/claims.jsonl)

Purpose:

- stable, reproducible comparisons
- controlled evaluation of baseline vs multi-stage behavior

## Curated recent-news dataset

Locations:

- [data/recent_news/claims.jsonl](/Users/macbook/Desktop/17-630 prompt engineering final project/data/recent_news/claims.jsonl)
- [data/recent_news/curated_examples](/Users/macbook/Desktop/17-630 prompt engineering final project/data/recent_news/curated_examples)

Purpose:

- stress post-cutoff knowledge
- make freshness explicit
- preserve source metadata

Each recent claim entry supports:

- claim text
- source article title
- publication date
- source URL
- optional gold label
- notes
- optional gold evidence ids
- optional gold source document ids

### Why recent-news is a major design choice

The recent-news track directly addresses the challenge that:

- model pretraining can be outdated
- recent claims must rely on retrieval rather than assumed internal knowledge

This is one of the strongest intellectually defensible aspects of the whole project.

## Evidence corpus

Demo evidence corpus files live under:

- [data/corpus/demo](/Users/macbook/Desktop/17-630 prompt engineering final project/data/corpus/demo)

These include synthetic but presentation-safe documents for:

- Riverdale energy and funding claims
- Blue Line transit and ridership claims

## Evaluation harness

Evaluation files:

- [eval/run_baseline.py](/Users/macbook/Desktop/17-630 prompt engineering final project/eval/run_baseline.py)
- [eval/run_multistage.py](/Users/macbook/Desktop/17-630 prompt engineering final project/eval/run_multistage.py)
- [eval/metrics.py](/Users/macbook/Desktop/17-630 prompt engineering final project/eval/metrics.py)
- [eval/compare_runs.py](/Users/macbook/Desktop/17-630 prompt engineering final project/eval/compare_runs.py)
- [eval/report_tables.py](/Users/macbook/Desktop/17-630 prompt engineering final project/eval/report_tables.py)
- [eval/recent_claims.py](/Users/macbook/Desktop/17-630 prompt engineering final project/eval/recent_claims.py)

### Two evaluation modes

#### 1. Single-prompt baseline

The baseline:

- processes the whole claim through one prompt
- predicts label and rationale directly
- provides a useful comparison target

#### 2. Multi-stage system

The multi-stage evaluation:

- runs the full orchestrated pipeline
- measures the value of decomposition

### Metrics

The repository computes:

- label accuracy
- macro F1
- retrieval recall@k
- NEI usage statistics
- label distributions

Metric implementation:

- [eval/metrics.py](/Users/macbook/Desktop/17-630 prompt engineering final project/eval/metrics.py)

### Evaluation outputs

Runs are stored in timestamped folders under:

- `eval/results/`

Typical artifacts:

- `config.json`
- `predictions.json`
- `claim_predictions.csv`
- `summary.json`
- comparison tables
- report tables

### Why this matters for slides and report

The evaluation layer makes it easy to show:

- baseline vs multi-stage
- benchmark vs recent-news
- strong cases
- failure cases
- both quantitative and qualitative evidence

## Frontend design

Frontend source:

- [frontend/src](/Users/macbook/Desktop/17-630 prompt engineering final project/frontend/src)

Implemented views:

### 1. Landing page

- [frontend/src/app/page.tsx](/Users/macbook/Desktop/17-630 prompt engineering final project/frontend/src/app/page.tsx)

Contains:

- hero section
- architecture preview
- example showcase
- evaluation teaser

### 2. Interactive demo page

- [frontend/src/app/demo/page.tsx](/Users/macbook/Desktop/17-630 prompt engineering final project/frontend/src/app/demo/page.tsx)

Contains:

- example selector
- text input
- live run button
- progress UI
- claim result cards
- evidence metadata
- corrected rewrite panel
- error, loading, and fallback states

### 3. Results page

- [frontend/src/app/results/page.tsx](/Users/macbook/Desktop/17-630 prompt engineering final project/frontend/src/app/results/page.tsx)

Contains:

- baseline vs multi-stage comparison
- benchmark vs recent-news tracks
- case studies
- presentation-friendly metric cards

### Key frontend components

- [frontend/src/components/demo/demo-shell.tsx](/Users/macbook/Desktop/17-630 prompt engineering final project/frontend/src/components/demo/demo-shell.tsx)
- [frontend/src/components/demo/claim-result-card.tsx](/Users/macbook/Desktop/17-630 prompt engineering final project/frontend/src/components/demo/claim-result-card.tsx)
- [frontend/src/components/demo/pipeline-progress.tsx](/Users/macbook/Desktop/17-630 prompt engineering final project/frontend/src/components/demo/pipeline-progress.tsx)
- [frontend/src/components/results/evaluation-shell.tsx](/Users/macbook/Desktop/17-630 prompt engineering final project/frontend/src/components/results/evaluation-shell.tsx)
- [frontend/src/components/landing/architecture-preview.tsx](/Users/macbook/Desktop/17-630 prompt engineering final project/frontend/src/components/landing/architecture-preview.tsx)
- [frontend/src/components/landing/example-showcase-section.tsx](/Users/macbook/Desktop/17-630 prompt engineering final project/frontend/src/components/landing/example-showcase-section.tsx)

### Frontend design goals

The frontend is intentionally:

- presentation-ready
- dark-mode-friendly
- motion-rich but stable
- screenshot-friendly for slides
- reusable in component structure

## API and frontend integration

Frontend API layer:

- [frontend/src/lib/api.ts](/Users/macbook/Desktop/17-630 prompt engineering final project/frontend/src/lib/api.ts)

Current behavior:

- the frontend calls `/api/v1/analyze`
- if the backend fails, it falls back to curated local sample data

This is useful because:

- the live demo stays stable
- the team can still present even if the backend is unavailable

## Example cases currently available

Frontend demo data:

- [frontend/src/lib/demo-data.ts](/Users/macbook/Desktop/17-630 prompt engineering final project/frontend/src/lib/demo-data.ts)

Current presentation examples:

1. `benchmark_press_release`
2. `recent_news_headline`
3. `custom_claim_stack`

These cover:

- controlled benchmark behavior
- recent-news freshness stress
- flexible live demo editing

## What this project demonstrates academically

## Prompt engineering in the small

The project demonstrates prompt engineering in the small through:

- concise but constrained prompts
- schema-aware output formatting
- structured response parsing
- retry logic for malformed outputs
- NEI guardrails
- minimal-edit rewrite control

## Prompt engineering in the large

The project demonstrates prompt engineering in the large through:

- multi-stage orchestration
- explicit data flow
- retrieval and evidence grounding
- environment effects
- benchmark and recent-news evaluation
- error handling and failure analysis

This distinction is one of the most important things to explain in slides and the report.

## Strengths of the implemented system

These are strong points worth emphasizing.

## 1. Modular architecture

The project is easy to explain because the stages are separated cleanly.

## 2. Typed interfaces

Every major stage uses explicit input and output models.

## 3. Demo-safe provider layer

The system runs with a mock provider and does not require live API access to function as a course project.

## 4. Practical retrieval subsystem

The project goes beyond a generic LLM wrapper and includes chunking, embeddings, FAISS, reranking, and metadata preservation.

## 5. Recent-news design choice

The curated recent-news track makes the project more academically interesting because it directly addresses outdated pretrained knowledge.

## 6. Presentation-ready frontend

The UI is strong enough to support both live demo flow and static screenshot use in slides.

## Limitations and honest constraints

These are limitations the team should state clearly.

## 1. Mock provider is still the default

The repository supports a real provider interface, but the offline-safe path is still important for demo stability.

## 2. Corpus size is still limited

The demo corpus is enough for a course project, but not enough for broad real-world fact checking.

## 3. Retrieval still dominates downstream quality

Good verification depends on good evidence.

## 4. Recent-news labels may be incomplete

Some curated claims may not yet be fully annotated, which means they are useful for stress testing even if they are not all fully scored.

## 5. Evaluation scale is still modest

The evaluation harness is well-structured, but the included datasets are still relatively small and course-oriented.

## Recommended slides structure

Use a deck roughly like this:

1. Title and problem
2. Why one-shot fact checking is brittle
3. System architecture
4. Prompt design and schema boundaries
5. Retrieval subsystem
6. Live demo or demo screenshots
7. Benchmark vs recent-news evaluation
8. Failure analysis
9. Recommendations and next steps

## Recommended 2-page report structure

Use sections like:

1. problem and motivation
2. architecture and prompt design
3. retrieval and evaluation setup
4. results with positive and negative evidence
5. recommendations and future work

Detailed outlines already exist in:

- [docs/presentation_outline.md](/Users/macbook/Desktop/17-630 prompt engineering final project/docs/presentation_outline.md)
- [docs/report_outline.md](/Users/macbook/Desktop/17-630 prompt engineering final project/docs/report_outline.md)

## Recommended demo story

Use this sequence:

1. landing page
2. architecture preview
3. benchmark demo
4. recent-news demo
5. results page
6. one failure case
7. close with recommendations

Detailed script:

- [docs/demo_script.md](/Users/macbook/Desktop/17-630 prompt engineering final project/docs/demo_script.md)

## Recommended results interpretation language

Good framing:

- the multi-stage system is more inspectable and more grounded than a single-prompt baseline
- recent-news performance highlights the importance of retrieval freshness
- conservative NEI use is a design feature, not automatically a weakness

Avoid:

- claiming the system solves fact checking in general
- overclaiming from a small number of examples

See:

- [docs/results_interpretation.md](/Users/macbook/Desktop/17-630 prompt engineering final project/docs/results_interpretation.md)

## Failure analysis language

Good failure analysis categories:

- extraction errors
- query drift
- retrieval miss
- topical but non-decisive evidence
- verifier overconfidence
- verifier over-conservatism
- correction rewrite issues
- freshness gaps

See:

- [docs/failure_analysis.md](/Users/macbook/Desktop/17-630 prompt engineering final project/docs/failure_analysis.md)

## Commands you may need for the final submission

## Setup

```bash
make setup
```

Full retrieval install:

```bash
make setup-full
```

## Run backend

```bash
make backend
```

## Run frontend

```bash
make frontend
```

## Run tests

```bash
make test
```

## Build retrieval index

```bash
make index
```

## Evaluation commands

Benchmark multi-stage:

```bash
make eval-benchmark
```

Recent-news multi-stage:

```bash
make eval-recent
```

Benchmark baseline:

```bash
make eval-baseline-benchmark
```

Recent-news baseline:

```bash
make eval-baseline-recent
```

Toy baseline:

```bash
make eval-baseline-toy
```

Toy multi-stage:

```bash
make eval-multistage-toy
```

## Frontend URLs

Landing page:

- [http://localhost:3000](http://localhost:3000)

Demo page:

- [http://localhost:3000/demo](http://localhost:3000/demo)

Results page:

- [http://localhost:3000/results](http://localhost:3000/results)

Backend docs:

- [http://localhost:8000/docs](http://localhost:8000/docs)

## Best concrete examples to mention in the presentation

## Good positive examples

### Riverdale funding claim

Why it is useful:

- clean refutation
- clear supporting evidence
- easy to explain rewrite

### Blue Line ridership exaggeration

Why it is useful:

- recent-news style
- strong retrieval story
- good illustration of why topical similarity is not enough

### “First carbon-neutral campus” claim

Why it is useful:

- good example of responsible NEI behavior

## Good negative example

### Blue Line budget-surplus claim

Why it is useful:

- demonstrates unresolved cases
- shows corpus and retrieval limitations
- supports honest failure analysis

## Best one-minute summary for the team

If the team needs a short spoken summary, use something like:

> Our project is a multi-stage prompt-engineering fact-checking system. Instead of using one monolithic prompt, we separate claim extraction, retrieval, verification, and correction into typed stages with schema validation, retries, and conservative fallbacks. We also evaluate both stable benchmark examples and recent-news claims where model pretraining may be stale. The result is a system that is more inspectable, more grounded, and easier to evaluate honestly.

## Suggested final recommendation slide

Use three recommendations:

1. prefer multi-stage prompt orchestration over one opaque prompt
2. evaluate recent claims separately from stable benchmark claims
3. treat retrieval quality and honest failure analysis as first-class parts of the system

## Suggested final report conclusion

Use a conclusion like:

> The main value of this repository is not a claim of universal fact-checking accuracy, but a concrete demonstration that multi-stage prompt engineering can make factual reasoning more structured, auditable, and defensible, especially when recent claims require fresh evidence rather than stale pretrained knowledge.

## Related supporting documents

For more focused materials, see:

- [docs/architecture.md](/Users/macbook/Desktop/17-630 prompt engineering final project/docs/architecture.md)
- [docs/prompt_design.md](/Users/macbook/Desktop/17-630 prompt engineering final project/docs/prompt_design.md)
- [docs/evaluation.md](/Users/macbook/Desktop/17-630 prompt engineering final project/docs/evaluation.md)
- [docs/demo_script.md](/Users/macbook/Desktop/17-630 prompt engineering final project/docs/demo_script.md)
- [docs/presentation_outline.md](/Users/macbook/Desktop/17-630 prompt engineering final project/docs/presentation_outline.md)
- [docs/report_outline.md](/Users/macbook/Desktop/17-630 prompt engineering final project/docs/report_outline.md)
- [docs/failure_analysis.md](/Users/macbook/Desktop/17-630 prompt engineering final project/docs/failure_analysis.md)
- [docs/results_interpretation.md](/Users/macbook/Desktop/17-630 prompt engineering final project/docs/results_interpretation.md)

## Final advice

For slides and report, do not try to describe every file in the repository.

Instead, tell one coherent story:

1. one-shot fact checking is brittle
2. multi-stage prompt engineering makes the process more controllable
3. retrieval matters, especially for recent claims
4. the system should be evaluated with both positive and negative evidence
5. the contribution is a credible, inspectable workflow rather than a claim of perfect factual reliability
