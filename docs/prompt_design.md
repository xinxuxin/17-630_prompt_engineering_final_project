# Prompt Design

This document is the prompt-design workspace for the final report. The repository code already includes prompt templates and structured output contracts; this file is for versioned human-readable prompt notes.

## Shared Prompting Principles

- require strict JSON outputs
- include explicit label definitions
- remind the model to avoid unsupported inference
- use bounded retries and validation
- prefer `not_enough_info` over overconfident guessing

## Agent 1: Claim Extraction Prompt

### Objective

Transform a paragraph or article into atomic, factual, independently checkable claims.

### Inputs

- user text
- max claims
- extraction instructions
- output schema

### Output Contract

- `claims[]`
- `claim_id`
- `text`
- `source_span`
- `notes`

### Failure Modes to Track

- merged claims that should be split
- opinions incorrectly treated as facts
- omitted claims
- hallucinated claims not grounded in the input

## Agent 2: Retrieval Query Prompt

### Objective

Create retrieval-friendly search text from each atomic claim while preserving the factual core.

### Inputs

- atomic claim
- corpus constraints

### Output Contract

- retrieval query text
- optional disambiguation keywords

### Failure Modes to Track

- over-specified queries that miss relevant evidence
- under-specified queries that retrieve noise

## Agent 3: Verdict Classification Prompt

### Objective

Judge one claim against retrieved evidence and assign one of three labels:

- `supported`
- `refuted`
- `not_enough_info`

### Inputs

- claim text
- evidence bundle
- label definitions
- confidence guidance
- output schema

### Output Contract

- `label`
- `confidence`
- `justification`
- `citations`

### Failure Modes to Track

- false support from weak lexical overlap
- false refutation from partial contradiction
- overuse or underuse of `NEI`

## Agent 4: Corrective Rewrite Prompt

### Objective

Produce a minimally edited rewrite that preserves as much of the original claim as possible while aligning it with evidence.

### Inputs

- original claim
- verdict
- evidence citations
- rewrite constraints
- output schema

### Output Contract

- `text`
- `citations`
- `edit_summary`

### Failure Modes to Track

- changing too much of the original sentence
- introducing unsupported wording
- citation mismatch

## Prompt Versioning Notes

Track prompt variants by:

- version tag
- intended change
- benchmark delta
- recent-news delta
- failure cases improved
- new regressions introduced
