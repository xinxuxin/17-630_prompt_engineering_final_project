# Report Outline

## Goal

This outline is designed for a concise 2-page course report.

It is intentionally aligned with the current repository, which already contains:

- a modular FastAPI backend
- externalized prompt templates
- a retrieval subsystem
- benchmark and recent-news evaluation support
- a polished frontend demo

## Recommended 2-Page Structure

Use approximately:

1. 0.25 page for problem and motivation
2. 0.5 page for architecture and prompts
3. 0.5 page for evaluation setup
4. 0.5 page for results, positive evidence, and negative evidence
5. 0.25 page for recommendations and next steps

## 1. Problem And Motivation

### Include

- why fact checking is hard for a single prompt
- why multiple claims in one paragraph are challenging
- why recent claims stress outdated pretrained knowledge
- why conservative `not_enough_info` behavior matters

### Suggested claim

This project argues that prompt engineering should be treated as system design, not just prompt wording.

## 2. Architecture

### Include

- the five main stages:
  - claim extraction
  - query generation
  - evidence retrieval
  - reranking
  - verification
  - optional correction rewrite

### Explain

- strict Pydantic schemas between stages
- retries and loop caps
- conservative NEI fallback
- provider abstraction and mock provider support
- retrieval with sentence-transformers and FAISS

### Suggested repository references

- [docs/architecture.md](/Users/macbook/Desktop/17-630 prompt engineering final project/docs/architecture.md)
- [backend/app/pipeline/orchestrator.py](/Users/macbook/Desktop/17-630 prompt engineering final project/backend/app/pipeline/orchestrator.py)

## 3. Prompts / LLM Usage

### Include

- prompts are externalized per stage
- prompts define role, task, constraints, and output schema
- verifier prompt explicitly favors `not_enough_info` when evidence is weak
- correction prompt is minimal-edit and citation-aware

### Explain the course relevance

This is prompt engineering in the small because the prompts:

- shape output structure
- constrain label boundaries
- reduce malformed JSON
- encode conservative behavior

### Suggested repository references

- [docs/prompt_design.md](/Users/macbook/Desktop/17-630 prompt engineering final project/docs/prompt_design.md)
- [backend/app/pipeline/prompt_templates](/Users/macbook/Desktop/17-630 prompt engineering final project/backend/app/pipeline/prompt_templates)

## 4. Evaluation Setup

### Include

- single-prompt baseline
- multi-stage pipeline system
- benchmark track
- curated recent-news track
- metrics:
  - label accuracy
  - macro F1
  - retrieval recall@k
  - NEI usage statistics

### Explain why recent-news matters

The recent-news track exists to test post-cutoff knowledge, where retrieval freshness matters more than parametric memory.

### Suggested repository references

- [docs/evaluation.md](/Users/macbook/Desktop/17-630 prompt engineering final project/docs/evaluation.md)
- [eval/run_baseline.py](/Users/macbook/Desktop/17-630 prompt engineering final project/eval/run_baseline.py)
- [eval/run_multistage.py](/Users/macbook/Desktop/17-630 prompt engineering final project/eval/run_multistage.py)

## 5. Positive Evidence

### What to include

- at least one benchmark success case
- at least one recent-news success case
- a case where the multi-stage system outperforms the baseline
- a case where NEI is used responsibly instead of forcing a wrong label

### Good examples from this repo

- Riverdale funding claim is refuted with grant evidence
- Blue Line ridership exaggeration is corrected by retrieved dashboard evidence
- “first carbon-neutral campus” remains NEI because the evidence is insufficient

## 6. Negative Evidence

### What to include

- one retrieval miss
- one ambiguous claim that remains unresolved
- one case where topical evidence exists but is not decisive

### Good example from this repo

- Blue Line budget-surplus claim remains unresolved because the current corpus does not contain decisive financial evidence

### Why this matters

Including negative evidence makes the report more credible and academically responsible.

## 7. Recommendations

### Practical recommendations

1. strengthen the retrieval corpus before tuning prompts further
2. keep benchmark and recent-news tracks separate
3. treat `not_enough_info` as an intended behavior, not a failure by default
4. continue prompt iteration with tracked versions and regression checks

## 8. Suggested Final Paragraph

End with a statement like:

> The main contribution of this project is a modular prompt-engineering workflow that makes fact checking more inspectable, more grounded, and easier to evaluate under both stable benchmark settings and post-cutoff recent-news settings.
