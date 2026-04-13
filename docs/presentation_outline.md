# Presentation Outline

## Goal

This outline is designed for a short course presentation and maps directly onto the required structure:

1. Problem Statement
2. Approach
3. Results and Recommendations
4. Next Steps

It is intentionally aligned with the current repository and frontend.

## Suggested Slide Count

Use 6 to 8 slides total.

Recommended structure:

1. Title + problem
2. Why single-prompt fact checking is brittle
3. Multi-stage architecture
4. Demo snapshot
5. Evaluation results
6. Failure analysis
7. Recommendations
8. Next steps

## 1. Problem Statement

### Main point

Fact checking is not just a classification problem.

Real inputs contain:

- multiple claims in one paragraph
- recent or post-cutoff events
- noisy or partial evidence
- situations where the right answer is `not_enough_info`

### What to say

- A one-shot prompt often collapses extraction, retrieval, and judgment into one opaque step.
- That makes it harder to debug, harder to evaluate, and easier to become overconfident.
- Recent-news claims are especially risky because pretrained knowledge may be stale.

### Recommended visual

- landing page hero
- one example claim from the recent-news track

## 2. Approach

### Main point

The repository implements a multi-stage prompt-agent workflow with typed interfaces.

### Architecture points to cover

1. Claim extraction
2. Query generation
3. Evidence retrieval and reranking
4. Verification
5. Optional correction rewriting

### Prompt-engineering angle

Explain both:

- prompt engineering in the small
- prompt engineering in the large

### Prompt engineering in the small

- prompt wording per stage
- strict JSON outputs
- schema validation
- retries on malformed outputs
- explicit NEI behavior

### Prompt engineering in the large

- orchestration across stages
- data flow
- retrieval grounding
- environment and provider effects
- evaluation and failure analysis

### Recommended visual

- landing page architecture preview
- architecture section

## 3. Results and Recommendations

### Main point

The multi-stage system is more defensible than the single-prompt baseline because it exposes retrieval, evidence use, and conservative decision behavior.

### Results to discuss

- benchmark track versus recent-news track
- baseline versus multi-stage
- one strong success case
- one honest failure case

### Specific results framing

- Benchmark track shows controlled performance improvement.
- Recent-news track shows why retrieval matters when pretraining may be outdated.
- Conservative `NEI` behavior is a feature, not a weakness, when evidence is weak.

### Recommendations

Say that the team recommends:

1. using staged prompting over a single opaque prompt
2. evaluating recent claims separately from benchmark claims
3. preserving negative evidence and failure cases in the final discussion

### Recommended visual

- `/results` page
- one benchmark example
- one recent-news example

## 4. Next Steps

### Main point

The current system is a credible course project foundation, but it can be extended.

### Practical next steps

1. connect a live OpenAI-compatible provider
2. expand and refresh the retrieval corpus
3. improve reranking quality
4. add more recent-news claims with manual annotation
5. calibrate prompt versions and confidence behavior

### Responsible close

Avoid saying:

- the system solves fact checking in general

Prefer saying:

- the system demonstrates a strong prompt-engineering workflow for grounded, inspectable fact checking

## Short Presenter Notes

### If time is running short

Compress:

1. problem
2. architecture
3. one benchmark example
4. one recent-news example
5. one failure case

### If the team is asked what is novel

Answer:

- The novelty is not a new model.
- The contribution is a clearly structured multi-stage prompt system with typed interfaces, retrieval grounding, recent-news evaluation, and explicit failure analysis.
