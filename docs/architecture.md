# Architecture

## Goal

The system checks free-form text through a multi-stage prompt-agent pipeline instead of a single monolithic prompt. Each stage has a narrow responsibility, a strict schema contract, and bounded error handling.

## Pipeline Stages

### 1. Claim Extraction Agent

Input:

- user text
- extraction limits
- schema contract for atomic claims

Output:

- a list of atomic factual claims
- source spans
- extraction notes for traceability

Design intent:

- split compound statements into claim-sized units
- avoid opinion and speculation when possible
- return only schema-valid JSON

### 2. Evidence Retrieval Agent

Input:

- atomic claim text
- retrieval configuration
- corpus/index state

Output:

- ranked evidence passages
- scores
- metadata such as source title, URL, date, and stance hint

Design intent:

- use sentence-transformers embeddings and FAISS for dense retrieval
- allow a lexical fallback when the FAISS index is unavailable
- keep retrieval separate from judgment

### 3. Verdict Classification Agent

Input:

- one atomic claim
- retrieved evidence bundle
- label schema

Output:

- `supported`, `refuted`, or `not_enough_info`
- confidence
- evidence-linked rationale

Design intent:

- enforce conservative classification
- prefer `not_enough_info` when evidence is sparse, stale, or contradictory
- keep chain-of-thought private while preserving a concise public justification

### 4. Corrective Rewrite Agent

Input:

- original claim
- verdict
- selected evidence
- rewrite schema

Output:

- minimally edited corrected rewrite
- citation list
- rewrite notes

Design intent:

- preserve the original wording when possible
- only change the unsupported part
- omit a rewrite when the evidence is insufficient

## Data Flow

```mermaid
flowchart LR
    A["User Text"] --> B["Claim Extraction"]
    B --> C["Atomic Claim JSON"]
    C --> D["Retrieval"]
    D --> E["Evidence Bundle JSON"]
    E --> F["Verdict Classification"]
    F --> G["Claim Assessment JSON"]
    G --> H["Corrective Rewrite"]
    H --> I["Final Response + Experiment Log"]
```

## Structured Contracts

Every stage boundary uses Pydantic models with `extra='forbid'`.

This supports:

- schema-constrained prompting
- validation after every model call
- retry-on-invalid-output behavior
- safer downstream consumption

## Reliability Controls

The backend scaffold includes:

- bounded retries per stage
- loop caps for self-repair logic
- conservative `NEI` fallback when evidence quality is poor
- logging for each run
- persisted experiment outputs for later analysis

## Environment Effects

This repository is designed to make environment effects explicit rather than hiding them.

Examples:

- provider choice changes latency and rewrite quality
- dense retrieval quality depends on corpus freshness and index build date
- recent-news performance is more sensitive to retrieval than benchmark performance
- prompt versions can change extraction granularity and classification conservatism

## Evaluation and Failure Analysis

The architecture is intentionally evaluation-friendly.

It stores:

- claim-level predictions
- evidence selections
- confidence and rationale summaries
- run metadata
- outputs that are easy to compare across prompt and config variants

That makes it suitable for:

- a short live demo
- a 2-page report
- post-hoc failure analysis on both benchmark and recent-news cases
