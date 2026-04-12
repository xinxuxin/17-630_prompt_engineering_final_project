# Multi-Stage Prompt-Agent Automated Fact Checking System

An end-to-end course project repository for a multi-stage prompt-engineering system that turns free-form text into atomic claims, retrieves evidence, classifies each claim, and optionally produces a minimally edited corrective rewrite with citations.

## Why This Repository Exists

This project is intentionally structured as a prompt-engineering system rather than a generic ML demo.

It demonstrates prompt engineering in the small:

- stage-specific prompt design
- strict structured outputs
- schema validation and repair
- bounded retries and conservative fallbacks

It also demonstrates prompt engineering in the large:

- orchestration across multiple prompts and agents
- data flow between stages
- retrieval and evidence grounding
- environment and configuration effects
- evaluation, failure analysis, and experiment logging

## Repository Layout

```text
.
├── backend/         FastAPI app, pipeline orchestration, retrieval, provider layer
├── frontend/        Next.js demo UI, design system, interactive results page
├── docs/            Architecture, prompt design, evaluation, demo script
├── scripts/         Local setup, indexing, evaluation, demo launch
├── data/            Benchmark data, recent-news claim sets, corpora
├── eval/            Reproducible evaluation configs and experiment outputs
├── examples/        Sample prompts, inputs, and outputs for presentation/report use
└── tests/           Critical pipeline and API tests
```

## System Overview

The intended workflow is:

1. Accept user-provided text.
2. Extract atomic factual claims with a schema-constrained claim extraction stage.
3. Retrieve evidence from a local corpus using sentence-transformers embeddings and FAISS.
4. Classify each claim as `supported`, `refuted`, or `not_enough_info`.
5. Optionally generate a minimally edited corrected rewrite with evidence citations.
6. Log structured outputs for demos, evaluation, and failure analysis.

## Architecture Summary

### Backend

- `FastAPI` API for interactive demos and programmatic evaluation
- modular multi-stage pipeline under `backend/app/pipeline`
- provider abstraction under `backend/app/providers` so an OpenAI client can be plugged in later
- Pydantic schemas between every stage to enforce structured contracts
- retry helpers, loop caps, validation, and conservative `NEI` fallback
- experiment output writing for reproducible runs

### Frontend

- `Next.js` App Router with `TypeScript`
- `Tailwind CSS`, `Framer Motion`, and a `shadcn/ui`-style component foundation
- polished landing page for presentation
- interactive demo page that shows claims, evidence cards, verdicts, confidence, and corrected rewrites
- sample case loader for benchmark-style and recent-news-style inputs

### Evaluation

- benchmark evaluation set support under `data/benchmark`
- curated recent-news claim set support under `data/recent_news`
- config-driven evaluation runs under `eval/configs`
- outputs written to `eval/results`
- explicit space for positive and negative evidence of performance

## Local Setup

### 1. Backend

Recommended minimal install:

```bash
python3.11 -m venv .venv
.venv/bin/pip install -U pip
.venv/bin/pip install -e './backend[dev]'
```

Full install with retrieval extras:

```bash
.venv/bin/pip install -e './backend[dev,retrieval]'
```

Copy the environment template:

```bash
cp backend/.env.example backend/.env
```

### 2. Frontend

```bash
cd frontend
npm install
cp .env.example .env.local
cd ..
```

## Development Commands

Using the root `Makefile`:

```bash
make setup          # backend dev install + frontend install
make setup-full     # include retrieval extras
make backend        # run FastAPI locally on :8000
make frontend       # run Next.js locally on :3000
make test           # run backend tests
make lint           # run frontend linting
make index          # build the FAISS retrieval index
make eval-benchmark # run benchmark evaluation
make eval-recent    # run recent-news evaluation
make demo           # start frontend + backend with Docker
```

## Docker

The repository includes:

- `backend/Dockerfile`
- `frontend/Dockerfile`
- `docker-compose.yml`

To launch both services together:

```bash
docker compose up --build
```

Frontend: [http://localhost:3000](http://localhost:3000)  
Backend API: [http://localhost:8000/docs](http://localhost:8000/docs)

## Evaluation Overview

This project is designed to support two complementary evaluation modes:

1. A benchmark split with stable labels for reproducible comparisons.
2. A curated recent-news split where pretraining may be stale and retrieval quality matters more.

Evaluation outputs are intentionally structured to capture:

- accuracy and label distribution
- claim-level success and failure cases
- evidence coverage
- unsupported rewrites
- false supports, false refutations, and conservative `NEI` behavior

See [docs/evaluation.md](docs/evaluation.md) for the full plan.

## Demo Overview

The repository supports three deliverables:

1. A 10-minute presentation with a polished UI and scripted walkthrough
2. A 2-page report using the architecture, prompt, and evaluation docs
3. A clean repository submission URL with readable structure and reproducible commands

See:

- [docs/architecture.md](docs/architecture.md)
- [docs/prompt_design.md](docs/prompt_design.md)
- [docs/evaluation.md](docs/evaluation.md)
- [docs/demo_script.md](docs/demo_script.md)

## Current Status

This initial scaffold already includes:

- a working FastAPI service skeleton
- a presentation-ready Next.js UI foundation
- modular pipeline contracts
- retrieval/indexing hooks
- evaluation scripts and sample data
- Docker and local workflow support

The next implementation steps are straightforward:

1. connect a live LLM provider
2. expand the local evidence corpus
3. calibrate prompt versions against benchmark and recent-news sets
4. collect stronger positive and negative evidence for the final report
