# Prompt Design

This document explains the prompt set used by the multi-stage fact-checking pipeline. The goal is not to show one giant prompt, but to show how prompt engineering is distributed across specialized stages with strict schema contracts.

## Shared Prompting Principles

- Every stage returns JSON only.
- Every stage prompt includes an explicit role, task, constraints, and output format.
- The prompts are short enough to explain in a presentation, but specific enough to reduce brittle outputs.
- Schema validation happens after generation, so prompts are written to cooperate with typed parsing.
- `not_enough_info` is explicit and preferred over unsupported certainty.
- Later stages are not allowed to “repair” errors by inventing unstated facts.

## Why This Is Prompt Engineering In The Small

This project treats each prompt as a local control surface.

The design work here is prompt engineering in the small because it focuses on:

- exact output shape
- wording that reduces hallucinated structure
- label definitions that affect decision boundaries
- stage-specific guardrails
- prompt brevity versus robustness tradeoffs

Each prompt is narrow, typed, and intentionally optimized for one step in the larger system.

## Stage 1: Claim Extraction

### Prompt Goal

Turn raw text into atomic, independently checkable claims.

### Design Rationale

The extraction prompt explicitly says:

- only factual assertions
- split compound claims
- do not invent claims
- preserve source wording where possible

This matters because downstream retrieval and verification both become less reliable when one extracted item contains multiple assertions.

### Expected Schema

- `claims[]`
- `claim_id`
- `text`
- `source_span`
- `notes`

### Likely Failure Modes

- a compound sentence remains unsplit
- an opinion is incorrectly extracted as a factual claim
- the model omits a checkable claim
- the model creates a cleaner but unsupported paraphrase

## Stage 2: Query Generation

### Prompt Goal

Rewrite one atomic claim into a retrieval-friendly query.

### Design Rationale

The query generator is not allowed to verify the claim. Its job is only to improve search recall while preserving the factual core. The prompt therefore emphasizes:

- keep entities, dates, quantities, and event terms
- do not decide truth
- do not add unsupported specifics
- provide alternatives only when useful for retrieval

This separation makes the pipeline easier to explain and debug.

### Expected Schema

- `claim_id`
- `query_text`
- `alternative_queries`
- `keywords`

### Likely Failure Modes

- the query becomes too broad and retrieves topical noise
- the query becomes too narrow and misses evidence
- the model silently rewrites away an important factual constraint

## Stage 3: Verification

### Prompt Goal

Assign `supported`, `refuted`, or `not_enough_info` from the retrieved evidence only.

### Design Rationale

The verifier prompt is the most important decision prompt in the pipeline. It explicitly defines each label and makes conservative behavior mandatory:

- use only the supplied evidence
- choose `not_enough_info` when evidence is weak, stale, mixed, or indirect
- do not overclaim from surface similarity
- cite only evidence ids actually used

This is academically defensible because the prompt exposes the system’s intended epistemic policy rather than hiding it.

### Expected Schema

- `label`
- `confidence`
- `rationale`
- `citation_ids`
- `evidence_strength`

### Likely Failure Modes

- false support from lexical overlap without real entailment
- false refutation from partial contradiction
- underuse of `not_enough_info`
- overuse of `not_enough_info` when evidence is actually decisive

## Stage 4: Correction Rewrite

### Prompt Goal

Produce a minimally edited correction that stays close to the original wording and uses evidence-backed citations.

### Design Rationale

This prompt explicitly constrains the rewrite to:

- make the smallest necessary edit
- preserve structure when possible
- avoid unsupported additions
- remain citation-aware
- stay conservative when the evidence is not decisive

That makes the rewrite stage easy to justify in a final presentation: it is not doing open-ended generation, but controlled post-verification editing.

### Expected Schema

- `text`
- `citation_ids`
- `citations`
- `edit_summary`

### Likely Failure Modes

- the rewrite changes too much of the sentence
- the rewrite smuggles in unsupported detail
- the citations do not correspond to the actual edit
- the model “fixes” a claim that should have remained `not_enough_info`

## Prompt Set Summary

The four prompts work because they divide the fact-checking task into small, controllable decisions:

1. Extract what should be checked.
2. Generate how to search for it.
3. Decide what the evidence actually supports.
4. Rewrite only when a correction is justified.

This decomposition is one of the main project arguments: prompt engineering is not just about writing a better single prompt, but about designing reliable interfaces between multiple prompts.

## Prompt Versioning Notes

Each stage prompt should be tracked with:

- stage name
- version tag
- intended behavioral change
- expected effect on benchmark examples
- expected effect on recent-news examples
- observed failure cases improved
- regressions introduced
