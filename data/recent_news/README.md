# Recent-News Claim Set

This folder is reserved for curated, time-sensitive claims where stale pretraining is a realistic risk.

This design exists to test post-cutoff knowledge explicitly.

The multi-stage system should do better on this track when retrieval is strong, because the answer should come from retrieved evidence instead of from stale parametric memory.

## Included Format

Each curated claim entry supports:

- `claim_id`
- `claim_text`
- `source_article_title`
- `publication_date`
- `source_url`
- `gold_label` when available
- `notes`
- optional gold evidence and gold source-document ids

## Included Samples

- [claims.jsonl](/Users/macbook/Desktop/17-630 prompt engineering final project/data/recent_news/claims.jsonl)
- [curated_examples](/Users/macbook/Desktop/17-630 prompt engineering final project/data/recent_news/curated_examples)

The included entries are mock recent-news examples with realistic metadata. They are safe demo placeholders, not a claim that these events actually happened.

## Replacement Workflow

For the final project, replace or extend the sample entries with real recent headline-event claims:

1. curate one atomic factual claim per entry
2. attach the article title, publication date, and canonical URL
3. add `gold_label` only after manual verification
4. add `gold_source_document_ids` when you want retrieval recall@k to be measured
5. keep notes on ambiguity, date sensitivity, and why the item stresses outdated pretraining
