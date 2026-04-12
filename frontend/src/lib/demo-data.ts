import type { ExampleCase, FactCheckResponse } from "@/lib/types";

export const exampleCases: ExampleCase[] = [
  {
    id: "benchmark_press_release",
    title: "Benchmark Press Release",
    dataset: "benchmark",
    blurb:
      "Synthetic benchmark-style paragraph with mixed supported and refuted claims.",
    inputText:
      "Riverdale University said its 2024 solar expansion reduced grid electricity purchases by 18 percent. Administrators also said the project cost $4 million. The same announcement claimed the project received no state funding and made Riverdale the first carbon-neutral campus in Pennsylvania.",
  },
  {
    id: "recent_news_headline",
    title: "Recent Headline Bundle",
    dataset: "recent_news",
    blurb:
      "Recent-news style example where one claim is supported, one is refuted, and one safely falls back to NEI.",
    inputText:
      "A city transit briefing said the 2025 Blue Line extension opened two months early. The report also said weekday ridership doubled in its first month. Local coverage further suggested the project had already generated a budget surplus.",
  },
];

export const sampleResponses: Record<string, FactCheckResponse> = {
  benchmark_press_release: {
    run_id: "sample_benchmark_001",
    dataset_name: "benchmark",
    input_text: exampleCases[0].inputText,
    summary: {
      total_claims: 4,
      supported: 2,
      refuted: 1,
      not_enough_info: 1,
    },
    stage_trace: [
      {
        stage: "claim_extraction",
        status: "fallback",
        detail: "Local demo sample loaded without calling the backend.",
        duration_ms: 12,
        retries: 0,
      },
      {
        stage: "evidence_retrieval",
        status: "success",
        detail: "Sample retrieval trace for presentation mode.",
        duration_ms: 18,
        retries: 0,
      },
      {
        stage: "verdict_classification",
        status: "success",
        detail: "Sample classification trace for presentation mode.",
        duration_ms: 23,
        retries: 0,
      },
      {
        stage: "corrective_rewrite",
        status: "success",
        detail: "Sample rewrite trace for presentation mode.",
        duration_ms: 9,
        retries: 0,
      },
    ],
    claims: [
      {
        claim_id: "claim_001",
        claim_text:
          "Riverdale University said its 2024 solar expansion reduced grid electricity purchases by 18 percent.",
        label: "supported",
        confidence: 0.86,
        justification:
          "The retrieved campus sustainability report explicitly attributes an 18 percent reduction in purchased electricity to the 2024 solar expansion.",
        corrected_rewrite: null,
        evidence: [
          {
            evidence_id: "doc_riverdale_energy",
            title: "Riverdale Sustainability Report",
            snippet:
              "Riverdale's 2024 solar expansion reduced campus grid electricity purchases by 18 percent during the first full operating year.",
            url: "https://example.edu/riverdale/sustainability-report",
            published_at: "2024-11-05",
            score: 0.93,
            stance_hint: "supports",
          },
        ],
      },
      {
        claim_id: "claim_002",
        claim_text: "Administrators also said the project cost $4 million.",
        label: "supported",
        confidence: 0.79,
        justification:
          "The finance summary lists the solar expansion budget at $4.0 million, matching the claim.",
        corrected_rewrite: null,
        evidence: [
          {
            evidence_id: "doc_riverdale_budget",
            title: "Riverdale Capital Projects Summary",
            snippet:
              "The solar expansion budget totaled $4.0 million, with construction completed in late 2024.",
            url: "https://example.edu/riverdale/capital-projects",
            published_at: "2024-10-18",
            score: 0.88,
            stance_hint: "supports",
          },
        ],
      },
      {
        claim_id: "claim_003",
        claim_text: "The same announcement claimed the project received no state funding.",
        label: "refuted",
        confidence: 0.83,
        justification:
          "The strongest evidence says the project included a state clean-energy grant, directly contradicting the claim.",
        corrected_rewrite: {
          text:
            "The project was financed through university funds and a state clean-energy grant.",
          edit_summary:
            "Replaced the unsupported 'no state funding' phrase with the supported funding description.",
          citations: [
            {
              evidence_id: "doc_riverdale_grant",
              title: "Riverdale Grant Announcement",
              url: "https://example.edu/riverdale/grant-announcement",
            },
          ],
        },
        evidence: [
          {
            evidence_id: "doc_riverdale_grant",
            title: "Riverdale Grant Announcement",
            snippet:
              "Riverdale University received a $900,000 state clean-energy grant to support the solar expansion.",
            url: "https://example.edu/riverdale/grant-announcement",
            published_at: "2024-08-12",
            score: 0.91,
            stance_hint: "refutes",
          },
        ],
      },
      {
        claim_id: "claim_004",
        claim_text:
          "The same announcement claimed the project made Riverdale the first carbon-neutral campus in Pennsylvania.",
        label: "not_enough_info",
        confidence: 0.3,
        justification:
          "The retrieved materials discuss emissions reductions but do not establish a statewide 'first' comparison.",
        corrected_rewrite: null,
        evidence: [
          {
            evidence_id: "doc_riverdale_net_zero",
            title: "Riverdale Climate Action FAQ",
            snippet:
              "University officials said the solar project is part of a broader pathway toward campus carbon neutrality.",
            url: "https://example.edu/riverdale/climate-faq",
            published_at: "2024-12-01",
            score: 0.58,
            stance_hint: "context",
          },
        ],
      },
    ],
  },
  recent_news_headline: {
    run_id: "sample_recent_001",
    dataset_name: "recent_news",
    input_text: exampleCases[1].inputText,
    summary: {
      total_claims: 3,
      supported: 1,
      refuted: 1,
      not_enough_info: 1,
    },
    stage_trace: [
      {
        stage: "claim_extraction",
        status: "fallback",
        detail: "Local demo sample loaded without calling the backend.",
        duration_ms: 11,
        retries: 0,
      },
      {
        stage: "evidence_retrieval",
        status: "success",
        detail: "Sample retrieval trace for presentation mode.",
        duration_ms: 16,
        retries: 0,
      },
      {
        stage: "verdict_classification",
        status: "success",
        detail: "Sample classification trace for presentation mode.",
        duration_ms: 21,
        retries: 0,
      },
    ],
    claims: [
      {
        claim_id: "claim_001",
        claim_text:
          "A city transit briefing said the 2025 Blue Line extension opened two months early.",
        label: "supported",
        confidence: 0.77,
        justification:
          "The briefing notes confirm the extension opened ahead of the original schedule by roughly eight weeks.",
        corrected_rewrite: null,
        evidence: [
          {
            evidence_id: "doc_blue_line_schedule",
            title: "City Transit Construction Update",
            snippet:
              "The 2025 Blue Line extension entered service approximately two months ahead of the original construction schedule.",
            url: "https://city.example/transit/blue-line-update",
            published_at: "2025-09-21",
            score: 0.87,
            stance_hint: "supports",
          },
        ],
      },
      {
        claim_id: "claim_002",
        claim_text: "The report also said weekday ridership doubled in its first month.",
        label: "refuted",
        confidence: 0.81,
        justification:
          "The ridership dashboard shows a 24 percent increase, not a doubling, so the claim overstates the effect.",
        corrected_rewrite: {
          text:
            "The first-month weekday ridership rose by about 24 percent after the Blue Line extension opened.",
          edit_summary:
            "Adjusted the unsupported 'doubled' wording to the reported ridership increase.",
          citations: [
            {
              evidence_id: "doc_blue_line_ridership",
              title: "Transit Ridership Dashboard",
              url: "https://city.example/transit/ridership-dashboard",
            },
          ],
        },
        evidence: [
          {
            evidence_id: "doc_blue_line_ridership",
            title: "Transit Ridership Dashboard",
            snippet:
              "Average weekday ridership increased by roughly 24 percent during the first month of Blue Line extension service.",
            url: "https://city.example/transit/ridership-dashboard",
            published_at: "2025-10-10",
            score: 0.9,
            stance_hint: "refutes",
          },
        ],
      },
      {
        claim_id: "claim_003",
        claim_text:
          "Local coverage further suggested the project had already generated a budget surplus.",
        label: "not_enough_info",
        confidence: 0.28,
        justification:
          "The retrieved evidence discusses on-time delivery and ridership but does not verify an operating surplus.",
        corrected_rewrite: null,
        evidence: [
          {
            evidence_id: "doc_blue_line_finance",
            title: "Transit Finance Overview",
            snippet:
              "City officials said it is too early to determine the long-term budget effect of the Blue Line extension.",
            url: "https://city.example/transit/finance-overview",
            published_at: "2025-10-18",
            score: 0.59,
            stance_hint: "context",
          },
        ],
      },
    ],
  },
};
