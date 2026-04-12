PYTHON ?= python3.11
VENV_PIP = .venv/bin/pip
VENV_PYTHON = .venv/bin/python

.PHONY: setup setup-full backend frontend test lint index eval-benchmark eval-recent demo backend-check

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
	PYTHONPATH=backend $(VENV_PYTHON) scripts/index_corpus.py

eval-benchmark:
	PYTHONPATH=backend $(VENV_PYTHON) scripts/run_evaluation.py --config eval/configs/benchmark.yaml

eval-recent:
	PYTHONPATH=backend $(VENV_PYTHON) scripts/run_evaluation.py --config eval/configs/recent_news.yaml

demo:
	docker compose up --build
