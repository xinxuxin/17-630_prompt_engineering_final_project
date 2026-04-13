# Results Interpretation

## Purpose

This document explains how to discuss project results responsibly.

It is especially useful when the team presents:

- baseline versus multi-stage comparisons
- benchmark versus recent-news comparisons
- success and failure examples from the frontend

## Core Principle

Do not treat one metric or one example as the whole story.

This repository is intentionally designed to support a richer interpretation that includes:

- label quality
- retrieval quality
- conservative NEI behavior
- recent-news freshness effects
- visible failure cases

## How To Discuss Strengths

### Strength 1: Better structure than a single prompt

Say:

- The multi-stage system separates extraction, retrieval, and verification, which makes the system more inspectable and easier to debug.

Avoid:

- saying the multi-stage system is automatically better in every possible setting

### Strength 2: Retrieval-grounded decisions

Say:

- The system surfaces evidence bundles, source metadata, and citation-aware rewrites rather than only returning a label.

Why this matters:

- it makes the system easier to explain and easier to audit

### Strength 3: Responsible NEI behavior

Say:

- `not_enough_info` is treated as a deliberate guardrail, not merely an error class.

Why this matters:

- in fact checking, refusing to overclaim can be better than producing a brittle answer

### Strength 4: Explicit recent-news handling

Say:

- The recent-news track directly addresses the outdated-pretraining problem by attaching publication date, source title, and source URL to each curated claim.

## How To Discuss Limitations

### Limitation 1: Retrieval quality still dominates

Say:

- The verifier can only be as good as the evidence it receives.

Implication:

- retrieval misses and non-decisive evidence can still lead to weak outcomes

### Limitation 2: Some claims remain unresolved

Say:

- Some claims should remain unresolved because the current corpus does not contain decisive evidence.

This is a limitation of:

- corpus coverage
- retrieval
- not necessarily the label policy itself

### Limitation 3: Recent-news evaluation is harder to fully label

Say:

- Some curated recent claims may not yet have gold labels, so they are useful for analysis and demo stress tests even before they become part of a fully scored benchmark.

## How To Compare Baseline vs Multi-Stage

### Good framing

- The baseline is useful because it tells us what a simpler prompt-only setup can do.
- The multi-stage system is useful because it shows the value of decomposition, retrieval, and explicit interfaces.

### What to emphasize

1. accuracy and macro F1
2. retrieval recall@k where available
3. NEI rate and whether it appears responsible or evasive
4. concrete examples where the baseline overclaims and the multi-stage system stays grounded

### Avoid

- claiming victory from one metric alone
- ignoring cases where the multi-stage system is slower or more complex

## How To Compare Benchmark vs Recent-News

### Good framing

- Benchmark data tests controlled system behavior.
- Recent-news data tests whether the system can stay grounded when model pretraining may be outdated.

### Why the comparison matters

If benchmark performance is good but recent-news performance is weaker, that does not invalidate the system.

Instead, it supports the project’s central claim:

- freshness and retrieval quality are real system variables

## How To Use Positive And Negative Evidence

### Positive evidence examples

- the multi-stage system correctly refutes the exaggerated ridership claim
- the system preserves NEI on the “first carbon-neutral campus” claim
- the correction rewrite stays close to the original wording while adding citations

### Negative evidence examples

- unresolved budget-surplus claim
- possible extraction granularity errors
- retrieval misses or topic-only evidence

### Recommended framing

- We intentionally include both positive and negative evidence because a credible fact-checking system should be evaluated honestly.

## Suggested Language For The Final Presentation

### Strong but responsible

- The repository demonstrates that multi-stage prompt engineering can make fact checking more structured, grounded, and explainable.

### Too strong

- The repository proves that LLMs can reliably fact check recent events.

## Suggested Language For The Final Report

Use a sentence like:

> The multi-stage system should be interpreted as an engineering workflow for improving control and auditability, not as a claim of universal factual reliability.

## Short Closing Interpretation

If the team needs one final summary sentence, use:

> Our strongest result is not just higher accuracy in some cases, but a more inspectable and more responsible fact-checking process, especially for recent claims where stale pretrained knowledge is a real concern.
