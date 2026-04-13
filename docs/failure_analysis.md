# Failure Analysis

## Purpose

This document helps the team discuss system limitations honestly and concretely.

It is designed for both:

- the final presentation
- the 2-page report

The main idea is to classify failures by where they enter the pipeline, not just by whether the final label was wrong.

## Failure Mode 1: Claim Extraction Errors

### What happens

The extractor may:

- keep a compound statement as one claim
- split a sentence incorrectly
- paraphrase too aggressively
- extract a statement that is not independently checkable

### Why it matters

Everything downstream depends on the extracted claim text.

If extraction is off, then:

- retrieval may target the wrong thing
- verification may appear wrong even when the evidence is reasonable

### Example

A sentence combining a funding claim and a “first in the state” claim could be extracted too coarsely, making it harder to verify either sub-claim cleanly.

## Failure Mode 2: Query Generation Drift

### What happens

The query generator may:

- drop an important entity, date, or quantity
- make the query too broad
- make the query too narrow

### Why it matters

Even with a strong corpus, poor query generation reduces retrieval quality.

### Example

If the claim is about “first-month ridership doubling,” but the query loses the time period, the retriever may return generic transit ridership documents instead of the key first-month dashboard entry.

## Failure Mode 3: Retrieval Miss

### What happens

The retriever fails to surface the relevant evidence in top-k.

### Why it matters

This can create:

- false `not_enough_info`
- weak or noisy evidence bundles
- misleading downstream rationales

### Example

The Blue Line budget-surplus claim remains unresolved because the current corpus does not contain decisive financial evidence, or the relevant record is not retrieved.

### How to discuss it

Do not frame this as “the model failed to reason.”

A better phrasing is:

- the evidence available to the verifier was incomplete or non-decisive

## Failure Mode 4: Topical But Non-Decisive Evidence

### What happens

The retriever finds documents about the same topic, but not documents that actually settle the claim.

### Why it matters

This is one of the biggest risks in fact checking systems because topical overlap can look convincing in a demo.

### Example

The Riverdale climate FAQ discusses carbon neutrality in general, but it does not support the stronger claim that Riverdale was the first carbon-neutral campus in Pennsylvania.

### How to discuss it

This is exactly why conservative `not_enough_info` behavior is part of the design.

## Failure Mode 5: Verification Overconfidence

### What happens

The verifier may:

- support a claim based on weak lexical overlap
- refute a claim from only partial contradiction
- underuse `not_enough_info`

### Why it matters

This is the kind of behavior that makes fact-checking demos look better than they really are.

### Example

A one-shot baseline may support a recent headline because the evidence is thematically related, even though the exact quantity or event detail is wrong.

## Failure Mode 6: Verification Over-Conservatism

### What happens

The verifier may rely on `not_enough_info` too often, even when evidence is decisive.

### Why it matters

A highly conservative system can appear safe but still underperform.

### How to discuss it

This should be presented as a calibration issue rather than a purely binary bug.

## Failure Mode 7: Correction Rewrite Problems

### What happens

The correction rewriter may:

- change too much of the original sentence
- add unsupported detail
- use citations that are too loosely connected to the edit

### Why it matters

The rewrite stage is only justified when it remains tightly grounded.

### Example

If the original claim says ridership “doubled,” the safe correction is to replace that phrase with the supported 24 percent increase, not to rewrite the whole passage in a more speculative way.

## Failure Mode 8: Post-Cutoff Freshness Gaps

### What happens

Recent claims may be difficult because:

- the model’s pretraining is stale
- the local corpus is incomplete
- publication date matters for interpretation

### Why it matters

This is one of the central motivations of the project.

### Example

A recent-news headline may sound plausible, but without dated source evidence the system should not act as if the model already “knows” it is true.

## Failure Mode 9: Evaluation Blind Spots

### What happens

The evaluation may understate or overstate quality if:

- the dataset is too small
- recent claims do not yet have gold labels
- retrieval gold references are incomplete

### Why it matters

Metrics should be interpreted with care, especially on newly curated recent-news examples.

## How To Present Failure Analysis

### Good framing

- We categorized failures by pipeline stage.
- We kept both positive and negative evidence.
- We treat unresolved claims and retrieval gaps as important findings, not just inconveniences.

### Avoid

- claiming the system is generally robust because a few examples look good
- hiding failures that are clearly visible in the current corpus or evaluation setup

## Short Summary For Slides

Use a summary like:

1. Some failures start at extraction.
2. Some failures come from retrieval misses or non-decisive evidence.
3. Some failures are calibration issues in verification.
4. Recent-news examples make freshness and corpus coverage especially important.
