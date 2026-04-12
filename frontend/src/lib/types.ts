export type VerdictLabel = "supported" | "refuted" | "not_enough_info";

export type EvidenceItem = {
  evidence_id: string;
  chunk_id?: string | null;
  source_document_id?: string | null;
  title: string;
  snippet: string;
  url?: string | null;
  published_at?: string | null;
  source_path?: string | null;
  source_type?: string | null;
  score: number;
  retrieval_score?: number;
  rerank_score?: number | null;
  stance_hint?: string | null;
};

export type Citation = {
  evidence_id: string;
  title: string;
  url?: string | null;
};

export type CorrectedRewrite = {
  text: string;
  citations: Citation[];
  citation_ids?: string[];
  edit_summary: string;
};

export type StageTrace = {
  stage: string;
  status: "success" | "fallback";
  detail: string;
  duration_ms: number;
  retries: number;
  claim_id?: string | null;
};

export type ClaimAssessment = {
  claim_id: string;
  claim_text: string;
  query_text?: string;
  alternative_queries?: string[];
  label: VerdictLabel;
  confidence: number;
  rationale: string;
  justification: string;
  evidence: EvidenceItem[];
  corrected_rewrite?: CorrectedRewrite | null;
  stage_trace?: StageTrace[];
};

export type PipelineMetadata = {
  run_id: string;
  dataset_name: string;
  provider_name: string;
  provider_configured: boolean;
  generated_at: string;
  max_stage_retries: number;
  max_pipeline_loops: number;
  loops_used: number;
  total_stage_fallbacks: number;
};

export type FactCheckResponse = {
  run_id: string;
  dataset_name: string;
  input_text: string;
  claims: ClaimAssessment[];
  stage_trace: StageTrace[];
  summary: {
    total_claims: number;
    supported: number;
    refuted: number;
    not_enough_info: number;
  };
  pipeline_metadata?: PipelineMetadata;
};

export type ExampleCase = {
  id: string;
  title: string;
  dataset: "benchmark" | "recent_news" | "custom";
  blurb: string;
  inputText: string;
  highlight: string;
};

export type EvaluationRunStats = {
  label: string;
  accuracy: number;
  macroF1: number;
  recallAtK: number;
  predictedNeiRate: number;
  claims: number;
};

export type EvaluationTrack = {
  id: string;
  title: string;
  description: string;
  challenge: string;
  baseline: EvaluationRunStats;
  multistage: EvaluationRunStats;
  highlight: string;
};

export type EvaluationCaseStudy = {
  id: string;
  track: EvaluationTrack["id"];
  title: string;
  claim: string;
  outcome: "success" | "failure";
  baselineOutcome: string;
  multistageOutcome: string;
  whyItMatters: string;
};

export type ArchitectureStage = {
  id: string;
  shortLabel: string;
  title: string;
  description: string;
  output: string;
};
