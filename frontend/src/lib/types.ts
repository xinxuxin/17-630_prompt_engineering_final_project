export type VerdictLabel = "supported" | "refuted" | "not_enough_info";

export type EvidenceItem = {
  evidence_id: string;
  title: string;
  snippet: string;
  url?: string | null;
  published_at?: string | null;
  score: number;
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
  edit_summary: string;
};

export type ClaimAssessment = {
  claim_id: string;
  claim_text: string;
  label: VerdictLabel;
  confidence: number;
  justification: string;
  evidence: EvidenceItem[];
  corrected_rewrite?: CorrectedRewrite | null;
};

export type StageTrace = {
  stage: string;
  status: "success" | "fallback";
  detail: string;
  duration_ms: number;
  retries: number;
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
};

export type ExampleCase = {
  id: string;
  title: string;
  dataset: "benchmark" | "recent_news";
  blurb: string;
  inputText: string;
};
