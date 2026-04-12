# Evaluation

## Evaluation Goals

The evaluation harness is designed to support direct comparison between:

1. a single-prompt baseline
2. the full multi-stage prompt-agent system

This makes it easier to argue in the final report that performance differences come from system design, not just isolated prompt wording.

## Evaluation Modes

### 1. Single-Prompt Baseline

The baseline uses one prompt per claim to assign a label and rationale in a single shot.

Its purpose is to answer:

- how well does a one-shot fact-checking setup work?
- how often does it overclaim or misuse `not_enough_info`?
- how much does the multi-stage design improve control and reliability?

### 2. Multi-Stage Pipeline

The multi-stage system uses the full orchestrated workflow:

- claim extraction
- query generation
- evidence retrieval
- reranking
- verification
- optional correction rewrite

Its purpose is to measure the benefits of decomposition and explicit stage interfaces.

## Included Datasets

### Toy Dataset

The repository includes a small sanity-check dataset here:

- [toy_eval.jsonl](/Users/macbook/Desktop/17-630 prompt engineering final project/eval/datasets/toy_eval.jsonl)

This toy set is intentionally small and presentation-friendly. It is useful for:

- verifying that the evaluation code runs end to end
- generating clean screenshots and tables
- quickly comparing baseline and multi-stage outputs

### Benchmark Track

Stable examples with known labels for reproducible comparisons.

### Recent-News Track

Time-sensitive examples where stale pretraining is more likely and retrieval quality matters more.

This track is included explicitly to address the outdated-pretraining problem. A model may sound confident about a recent headline even when its parametric knowledge is stale, so the evaluation harness treats recent claims as provenance-aware records rather than generic paragraphs.

Each curated recent claim includes:

- claim text
- source article title
- publication date
- source URL
- optional gold label
- notes

The included sample directory is:

- [data/recent_news/curated_examples](/Users/macbook/Desktop/17-630 prompt engineering final project/data/recent_news/curated_examples)

The harness can load either a single curated-claims file or a directory of JSONL files, which makes it easy to swap in real post-cutoff headline-event claims later.

## Metrics

The harness computes the following core metrics:

### Label Accuracy

The fraction of claims where the predicted label exactly matches the gold label.

### Macro F1

The mean F1 across:

- `supported`
- `refuted`
- `not_enough_info`

This is useful because class balance is often uneven and `NEI` behavior matters.

### Retrieval Recall@K

When the dataset includes gold evidence ids or gold source document ids, the harness measures whether the relevant evidence appeared in the retrieved top-k set.

This metric is only reported when the dataset provides gold retrieval references.

### NEI Usage Statistics

The harness reports:

- predicted `NEI` count
- predicted `NEI` rate
- gold `NEI` count
- gold `NEI` rate

This is important because prompt-engineered fact checking should be conservative when evidence is weak.

## Run Artifacts

Each run writes a timestamped folder under `eval/results/`.

The folder contains:

- `config.json`
- `predictions.json`
- `claim_predictions.csv`
- `summary.json`

For curated recent-news runs, the artifacts also preserve:

- source article title
- publication date
- source URL
- annotation notes

This keeps runs easy to inspect and easy to reuse in slides or a final report.

## Comparison Workflow

Run the baseline and multi-stage systems separately, then compare them.

### Toy Baseline

```bash
make eval-baseline-toy
```

### Toy Multi-Stage

```bash
make eval-multistage-toy
```

### Benchmark Multi-Stage

```bash
make eval-benchmark
```

### Recent-News Multi-Stage

```bash
make eval-recent
```

### Benchmark Baseline

```bash
make eval-baseline-benchmark
```

### Recent-News Baseline

```bash
make eval-baseline-recent
```

### Compare Two Runs

```bash
PYTHONPATH=backend .venv/bin/python eval/compare_runs.py \
  --baseline-run eval/results/<baseline_run_dir> \
  --multistage-run eval/results/<multistage_run_dir>
```

### Build Presentation Tables

```bash
PYTHONPATH=backend .venv/bin/python eval/report_tables.py \
  --runs eval/results/<baseline_run_dir> eval/results/<multistage_run_dir>
```

## Retrieval Notes

Retrieval quality strongly affects everything downstream.

Weak retrieval can cause:

- false `not_enough_info` labels even when evidence exists
- false support from topical but non-decisive chunks
- poor correction rewrites because the wrong passage was selected
- especially misleading behavior on recent claims where pretrained knowledge may be outdated

That is why the repository evaluates retrieval separately when gold evidence references are available.

## Positive Evidence To Surface

- cases where multi-stage verification improves accuracy over the baseline
- cases where reranking improves evidence quality
- conservative `NEI` behavior on underdetermined claims
- clean report tables showing better macro F1 or retrieval recall

## Negative Evidence To Keep

- retrieval misses
- baseline overconfidence
- multi-stage failure cases caused by claim extraction mistakes
- examples where evidence is present but still not decisive

These negative examples are useful in a final presentation because they show real failure analysis rather than only cherry-picked wins.
