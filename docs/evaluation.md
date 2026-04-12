# Evaluation

## Evaluation Goals

The evaluation plan is designed to show both strengths and weaknesses of the system.

The final deliverables should include:

- positive evidence that the staged pipeline improves reliability
- negative evidence that reveals brittle cases, retrieval failures, and prompt failures

## Evaluation Tracks

### 1. Benchmark Track

Use a relatively stable benchmark set with known labels for reproducible comparisons.

Questions this track answers:

- Does the pipeline reliably extract claims?
- Are verdict labels accurate under controlled conditions?
- Which prompt revisions improve structured consistency?

### 2. Recent-News Track

Use a curated set of recent, post-cutoff claims where model pretraining may be outdated and retrieval freshness matters.

Questions this track answers:

- Does evidence retrieval rescue time-sensitive claims?
- How often does the system appropriately fall back to `NEI`?
- Which failures come from stale corpora versus prompt errors?

## Metrics

Recommended core metrics:

- claim extraction coverage
- claim extraction precision
- verdict accuracy
- macro F1 over `supported`, `refuted`, `not_enough_info`
- citation coverage
- rewrite acceptability
- conservative `NEI` rate on low-evidence examples

## Positive Evidence

Examples to surface in the final presentation/report:

- clean decomposition of multi-claim inputs into atomic claims
- correct use of evidence to refute a misleading statement
- safe `NEI` fallback on insufficient or stale evidence
- improved performance after prompt revision or schema tightening

## Negative Evidence

Examples to keep on purpose:

- retrieval misses that cause false `NEI`
- evidence bundles with topical but non-decisive passages
- claim extraction errors that poison downstream stages
- rewrite outputs that over-correct or under-correct

These cases are useful because they show the failure analysis mindset expected in a prompt-engineering project.

## Reproducibility

Each evaluation run should store:

- config file used
- provider name
- prompt version markers
- dataset name
- claim-level outputs
- aggregate metrics

The scaffold already supports writing JSON outputs into `eval/results`.

## Suggested Final Report Framing

Use a simple table comparing:

- baseline prompt
- schema-constrained multi-stage pipeline
- pipeline plus retrieval tuning

Then include 2 to 4 representative failures with short interpretation.
