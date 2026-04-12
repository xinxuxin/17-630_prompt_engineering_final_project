import { sampleResponses } from "@/lib/demo-data";
import type { FactCheckResponse } from "@/lib/types";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";

export async function runFactCheckRequest(
  inputText: string,
  datasetName: string,
): Promise<FactCheckResponse> {
  const response = await fetch(`${API_BASE_URL}/api/v1/fact-check`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      input_text: inputText,
      dataset_name: datasetName,
      include_rewrite: true,
      max_claims: 6,
      top_k_evidence: 4,
    }),
  });

  if (!response.ok) {
    throw new Error("Fact-check request failed.");
  }

  return (await response.json()) as FactCheckResponse;
}

export function getLocalSample(exampleId: string): FactCheckResponse | null {
  return sampleResponses[exampleId] ?? null;
}
