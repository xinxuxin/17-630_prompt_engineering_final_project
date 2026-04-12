PYTHON ?= python3.11
VENV_PIP = .venv/bin/pip
VENV_PYTHON = .venv/bin/python

.PHONY: setup setup-full backend frontend test lint index eval-benchmark eval-recent eval-baseline-benchmark eval-baseline-recent eval-baseline-toy eval-multistage-toy eval-compare-toy demo backend-check

setup:
	$(PYTHON) -m venv .venv
	$(VENV_PIP) install -U pip
	$(VENV_PIP) install -e './backend[dev]'
	cd frontend && npm install

setup-full:
	$(PYTHON) -m venv .venv
	$(VENV_PIP) install -U pip
	$(VENV_PIP) install -e './backend[dev,retrieval]'
	cd frontend && npm install

backend:
	cd backend && ../.venv/bin/python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

frontend:
	cd frontend && npm run dev

test:
	PYTHONPATH=backend $(VENV_PYTHON) -m pytest tests/backend -q

lint:
	cd frontend && npm run lint

backend-check:
	PYTHONPATH=backend $(VENV_PYTHON) -m compileall backend/app

index:
	PYTHONPATH=backend $(VENV_PYTHON) scripts/build_index.py

eval-benchmark:
	PYTHONPATH=backend $(VENV_PYTHON) scripts/run_evaluation.py --config eval/configs/benchmark.yaml

eval-recent:
	PYTHONPATH=backend $(VENV_PYTHON) scripts/run_evaluation.py --config eval/configs/recent_news.yaml

eval-baseline-benchmark:
	PYTHONPATH=backend $(VENV_PYTHON) eval/run_baseline.py --dataset data/benchmark/claims.jsonl --dataset-name benchmark --output-root eval/results --top-k 4

eval-baseline-recent:
	PYTHONPATH=backend $(VENV_PYTHON) eval/run_baseline.py --dataset data/recent_news/curated_examples --dataset-name recent_news --output-root eval/results --top-k 4

eval-baseline-toy:
	PYTHONPATH=backend $(VENV_PYTHON) eval/run_baseline.py --dataset eval/datasets/toy_eval.jsonl --dataset-name toy_eval --output-root eval/results --top-k 4

eval-multistage-toy:
	PYTHONPATH=backend $(VENV_PYTHON) eval/run_multistage.py --dataset eval/datasets/toy_eval.jsonl --dataset-name toy_eval --output-root eval/results --top-k 4 --max-claims 6 --include-rewrite

eval-compare-toy:
	@echo "Run baseline and multistage first, then call eval/compare_runs.py with the two run directories."

demo:
	docker compose up --build
