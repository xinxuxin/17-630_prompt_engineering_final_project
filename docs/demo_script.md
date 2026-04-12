# Demo Script

## Goal

Support a 10-minute final presentation with a clear story:

1. why one-shot fact checking is brittle
2. how staged prompting improves control
3. how retrieval and strict schemas improve reliability
4. where the system still fails

## Suggested 10-Minute Flow

### 1. Problem Setup

- show a paragraph containing several factual claims
- explain why a single prompt often mixes extraction, retrieval, and judgment

### 2. System Walkthrough

- show the landing page
- explain the four pipeline stages
- point to the schema-constrained interfaces between stages

### 3. Live Demo

- load a benchmark-style example
- run the pipeline
- inspect claim-by-claim evidence, labels, and rewrite output

### 4. Recent-News Stress Test

- load a recent-news-style example
- highlight where retrieval freshness matters
- point out when the system safely returns `NEI`

### 5. Results and Limits

- show one strong case
- show one failure case
- explain what failed: prompt, retrieval, schema, or corpus freshness

### 6. Close

- summarize why prompt engineering in the small and in the large both matter
- mention future work: stronger retrieval, live provider integration, better calibration

## Materials This Repo Already Supports

- polished demo UI
- architecture diagrams
- prompt design notes
- benchmark and recent-news evaluation folders
- sample outputs for slides/report figures
