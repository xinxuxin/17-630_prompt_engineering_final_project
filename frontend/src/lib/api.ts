import { sampleResponses } from "@/lib/demo-data";
import type {
  ClaimAssessment,
  CorrectedRewrite,
  FactCheckResponse,
  PipelineMetadata,
  StageTrace,
} from "@/lib/types";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";

export async function runFactCheckRequest(
  inputText: string,
  datasetName: string,
): Promise<FactCheckResponse> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 12000);

  const response = await fetch(`${API_BASE_URL}/api/v1/analyze`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    signal: controller.signal,
    body: JSON.stringify({
      input_text: inputText,
      dataset_name: datasetName,
      include_rewrite: true,
      max_claims: 6,
      top_k_evidence: 4,
    }),
  });
  clearTimeout(timeoutId);

  if (!response.ok) {
    throw new Error("Fact-check request failed.");
  }

  return normalizeFactCheckResponse(await response.json());
}

export function getLocalSample(exampleId: string): FactCheckResponse | null {
  return sampleResponses[exampleId] ?? null;
}

function normalizeFactCheckResponse(payload: unknown): FactCheckResponse {
  const data = payload as Record<string, unknown>;
  const claims = Array.isArray(data.claims) ? data.claims : [];
  const stageTrace = Array.isArray(data.stage_trace) ? data.stage_trace : [];

  return {
    run_id: String(data.run_id ?? "frontend_normalized_run"),
    dataset_name: String(data.dataset_name ?? "custom"),
    input_text: String(data.input_text ?? ""),
    claims: claims.map((claim, index) => normalizeClaim(claim, index)),
    stage_trace: stageTrace.map(normalizeStageTrace),
    summary: normalizeSummary(data.summary),
    pipeline_metadata: normalizePipelineMetadata(data.pipeline_metadata),
  };
}

function normalizeClaim(claim: unknown, index: number): ClaimAssessment {
  const item = claim as Record<string, unknown>;
  return {
    claim_id: String(item.claim_id ?? `claim_${index + 1}`),
    claim_text: String(item.claim_text ?? ""),
    query_text: typeof item.query_text === "string" ? item.query_text : undefined,
    alternative_queries: Array.isArray(item.alternative_queries)
      ? item.alternative_queries.map(String)
      : [],
    label: (item.label as FactCheckResponse["claims"][number]["label"]) ?? "not_enough_info",
    confidence: Number(item.confidence ?? 0),
    rationale: String(item.rationale ?? item.justification ?? ""),
    justification: String(item.justification ?? item.rationale ?? ""),
    evidence: Array.isArray(item.evidence)
      ? item.evidence.map((evidence) => ({
          evidence_id: String((evidence as Record<string, unknown>).evidence_id ?? ""),
          chunk_id: asOptionalString((evidence as Record<string, unknown>).chunk_id),
          source_document_id: asOptionalString((evidence as Record<string, unknown>).source_document_id),
          title: String((evidence as Record<string, unknown>).title ?? "Evidence"),
          snippet: String((evidence as Record<string, unknown>).snippet ?? ""),
          url: asOptionalString((evidence as Record<string, unknown>).url),
          published_at: asOptionalString((evidence as Record<string, unknown>).published_at),
          source_path: asOptionalString((evidence as Record<string, unknown>).source_path),
          source_type: asOptionalString((evidence as Record<string, unknown>).source_type),
          score: Number((evidence as Record<string, unknown>).score ?? 0),
          retrieval_score: Number((evidence as Record<string, unknown>).retrieval_score ?? 0),
          rerank_score: asOptionalNumber((evidence as Record<string, unknown>).rerank_score),
          stance_hint: asOptionalString((evidence as Record<string, unknown>).stance_hint),
        }))
      : [],
    corrected_rewrite: normalizeRewrite(item.corrected_rewrite),
    stage_trace: Array.isArray(item.stage_trace) ? item.stage_trace.map(normalizeStageTrace) : [],
  };
}

function normalizeStageTrace(stage: unknown): StageTrace {
  const item = stage as Record<string, unknown>;
  return {
    stage: String(item.stage ?? "stage"),
    status: item.status === "fallback" ? "fallback" : "success",
    detail: String(item.detail ?? ""),
    duration_ms: Number(item.duration_ms ?? 0),
    retries: Number(item.retries ?? 0),
    claim_id: asOptionalString(item.claim_id),
  };
}

function normalizeSummary(summary: unknown) {
  const item = (summary ?? {}) as Record<string, unknown>;
  return {
    total_claims: Number(item.total_claims ?? 0),
    supported: Number(item.supported ?? 0),
    refuted: Number(item.refuted ?? 0),
    not_enough_info: Number(item.not_enough_info ?? 0),
  };
}

function normalizePipelineMetadata(metadata: unknown): PipelineMetadata | undefined {
  if (!metadata || typeof metadata !== "object") {
    return undefined;
  }

  const item = metadata as Record<string, unknown>;
  return {
    run_id: String(item.run_id ?? ""),
    dataset_name: String(item.dataset_name ?? "custom"),
    provider_name: String(item.provider_name ?? "mock"),
    provider_configured: Boolean(item.provider_configured),
    generated_at: String(item.generated_at ?? new Date().toISOString()),
    max_stage_retries: Number(item.max_stage_retries ?? 0),
    max_pipeline_loops: Number(item.max_pipeline_loops ?? 1),
    loops_used: Number(item.loops_used ?? 1),
    total_stage_fallbacks: Number(item.total_stage_fallbacks ?? 0),
  };
}

function normalizeRewrite(rewrite: unknown): CorrectedRewrite | null {
  if (!rewrite || typeof rewrite !== "object") {
    return null;
  }

  const item = rewrite as Record<string, unknown>;
  return {
    text: String(item.text ?? ""),
    edit_summary: String(item.edit_summary ?? ""),
    citation_ids: Array.isArray(item.citation_ids) ? item.citation_ids.map(String) : [],
    citations: Array.isArray(item.citations)
      ? item.citations.map((citation) => ({
          evidence_id: String((citation as Record<string, unknown>).evidence_id ?? ""),
          title: String((citation as Record<string, unknown>).title ?? ""),
          url: asOptionalString((citation as Record<string, unknown>).url),
        }))
      : [],
  };
}

function asOptionalString(value: unknown) {
  return typeof value === "string" ? value : null;
}

function asOptionalNumber(value: unknown) {
  return typeof value === "number" ? value : null;
}
