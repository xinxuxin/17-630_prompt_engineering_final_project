import type {
  ArchitectureStage,
  EvaluationCaseStudy,
  EvaluationTrack,
  ExampleCase,
  FactCheckResponse,
} from "@/lib/types";

export const architectureStages: ArchitectureStage[] = [
  {
    id: "claim_extraction",
    shortLabel: "01",
    title: "Claim Extraction",
    description:
      "Break free-form passages into atomic, checkable factual claims with schema-constrained output.",
    output: "Atomic claim JSON",
  },
  {
    id: "query_generation",
    shortLabel: "02",
    title: "Query Generation",
    description:
      "Rewrite each claim into retrieval-friendly search queries while preserving the factual core.",
    output: "Search query bundle",
  },
  {
    id: "evidence_retrieval",
    shortLabel: "03",
    title: "Retrieval + Rerank",
    description:
      "Pull top-k evidence chunks from the local corpus, then promote the most decision-useful snippets.",
    output: "Evidence bundle",
  },
  {
    id: "verdict_classification",
    shortLabel: "04",
    title: "Verification",
    description:
      "Assign Supported, Refuted, or NEI with explicit caution when evidence is weak or mixed.",
    output: "Verdict + rationale",
  },
  {
    id: "corrective_rewrite",
    shortLabel: "05",
    title: "Correction Rewrite",
    description:
      "When evidence is decisive, produce a minimal-edit corrected rewrite with citations.",
    output: "Rewrite + citations",
  },
];

export const exampleCases: ExampleCase[] = [
  {
    id: "benchmark_press_release",
    title: "Benchmark Press Release",
    dataset: "benchmark",
    blurb:
      "A controlled benchmark-style paragraph with mixed supported, refuted, and NEI outcomes.",
    inputText:
      "Riverdale University said its 2024 solar expansion reduced grid electricity purchases by 18 percent. Administrators also said the project cost $4 million. The same announcement claimed the project received no state funding and made Riverdale the first carbon-neutral campus in Pennsylvania.",
    highlight: "Best for a clean walkthrough of all three label types.",
  },
  {
    id: "recent_news_headline",
    title: "Recent Headline Bundle",
    dataset: "recent_news",
    blurb:
      "A post-cutoff style example where retrieval corrects an exaggerated headline and preserves a cautious NEI.",
    inputText:
      "A city transit briefing said the 2025 Blue Line extension opened two months early. The report also said weekday ridership doubled in its first month. Local coverage further suggested the project had already generated a budget surplus.",
    highlight: "Best for explaining why fresh retrieval matters more than stale pretraining.",
  },
  {
    id: "custom_claim_stack",
    title: "Mixed Claim Stack",
    dataset: "custom",
    blurb:
      "A custom-style input blending campus funding, transit statistics, and an ambiguous outcome claim.",
    inputText:
      "Analysts said Riverdale's solar expansion used no state funding. A transit bulletin also said weekday ridership on the Blue Line doubled in month one. Commentary further claimed the extension immediately produced a budget surplus.",
    highlight: "Best for live editing during the presentation.",
  },
];

export const evaluationTracks: EvaluationTrack[] = [
  {
    id: "benchmark",
    title: "Benchmark Track",
    description:
      "Stable labels for apples-to-apples comparison between a single prompt and the orchestrated system.",
    challenge:
      "Useful for controlled measurement, but less stressful on stale model knowledge.",
    baseline: {
      label: "Single Prompt",
      accuracy: 0.74,
      macroF1: 0.7,
      recallAtK: 0.79,
      predictedNeiRate: 0.11,
      claims: 42,
    },
    multistage: {
      label: "Multi-Stage",
      accuracy: 0.86,
      macroF1: 0.84,
      recallAtK: 0.9,
      predictedNeiRate: 0.17,
      claims: 42,
    },
    highlight:
      "Decomposition improves label discipline and retrieval alignment, especially on refuted claims.",
  },
  {
    id: "recent_news",
    title: "Curated Recent-News Track",
    description:
      "Provenance-rich recent claims with publication dates and URLs, designed to stress post-cutoff knowledge.",
    challenge:
      "The model cannot safely lean on parametric memory, so retrieval quality becomes the dominant factor.",
    baseline: {
      label: "Single Prompt",
      accuracy: 0.58,
      macroF1: 0.54,
      recallAtK: 0.67,
      predictedNeiRate: 0.08,
      claims: 26,
    },
    multistage: {
      label: "Multi-Stage",
      accuracy: 0.77,
      macroF1: 0.73,
      recallAtK: 0.88,
      predictedNeiRate: 0.19,
      claims: 26,
    },
    highlight:
      "The system becomes more conservative and more accurate once it is forced to ground recent claims in retrieved evidence.",
  },
];

export const evaluationCaseStudies: EvaluationCaseStudy[] = [
  {
    id: "case_recent_headline",
    track: "recent_news",
    title: "Headline exaggeration corrected by retrieval",
    claim: "Weekday ridership doubled during the Blue Line extension's first month.",
    outcome: "success",
    baselineOutcome: "Predicted supported from topical similarity to ridership growth coverage.",
    multistageOutcome:
      "Predicted refuted after reranking surfaced the dashboard figure showing a 24 percent increase.",
    whyItMatters:
      "This is a clean illustration of why a multi-stage system is more defensible on post-cutoff claims.",
  },
  {
    id: "case_first_in_state",
    track: "benchmark",
    title: "NEI preserved instead of forced support",
    claim: "Riverdale became the first carbon-neutral campus in Pennsylvania.",
    outcome: "success",
    baselineOutcome: "Overconfidently supported because retrieved documents discussed carbon neutrality.",
    multistageOutcome:
      "Returned not_enough_info because the evidence lacked the statewide first-place comparison.",
    whyItMatters:
      "The explicit NEI guardrail is visible and easy to defend during a presentation.",
  },
  {
    id: "case_retrieval_gap",
    track: "recent_news",
    title: "Open failure case for future retrieval improvements",
    claim: "The Blue Line extension generated a budget surplus in its first quarter.",
    outcome: "failure",
    baselineOutcome: "Returned not_enough_info because no direct financial evidence was found.",
    multistageOutcome:
      "Still unresolved; retrieval returned related transit updates but no decisive budget records.",
    whyItMatters:
      "Keeping this failure visible shows honest analysis rather than only showcasing wins.",
  },
];

const sharedPipelineMetadata = {
  provider_name: "mock",
  provider_configured: false,
  generated_at: "2026-04-12T10:30:00Z",
  max_stage_retries: 2,
  max_pipeline_loops: 2,
  loops_used: 1,
  total_stage_fallbacks: 1,
};

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
    pipeline_metadata: {
      run_id: "sample_benchmark_001",
      dataset_name: "benchmark",
      ...sharedPipelineMetadata,
    },
    stage_trace: [
      {
        stage: "claim_extraction",
        status: "success",
        detail: "Split the paragraph into four atomic claims with one conservative fallback.",
        duration_ms: 104,
        retries: 1,
      },
      {
        stage: "query_generation",
        status: "success",
        detail: "Generated focused retrieval queries for each claim.",
        duration_ms: 51,
        retries: 0,
      },
      {
        stage: "evidence_retrieval",
        status: "success",
        detail: "Dense retrieval returned matching budget, grant, and sustainability evidence.",
        duration_ms: 138,
        retries: 0,
      },
      {
        stage: "verdict_classification",
        status: "success",
        detail: "Applied conservative NEI behavior where the 'first in Pennsylvania' evidence was incomplete.",
        duration_ms: 122,
        retries: 0,
      },
      {
        stage: "corrective_rewrite",
        status: "success",
        detail: "Produced one minimal funding correction with citations.",
        duration_ms: 69,
        retries: 0,
      },
    ],
    claims: [
      {
        claim_id: "claim_001",
        claim_text:
          "Riverdale University said its 2024 solar expansion reduced grid electricity purchases by 18 percent.",
        query_text: "Riverdale solar expansion reduced grid electricity purchases 18 percent",
        alternative_queries: ["Riverdale sustainability report solar expansion 18 percent"],
        label: "supported",
        confidence: 0.86,
        rationale:
          "The evidence explicitly states the 18 percent reduction and directly matches the claim.",
        justification:
          "The retrieved campus sustainability report explicitly attributes an 18 percent reduction in purchased electricity to the 2024 solar expansion.",
        corrected_rewrite: null,
        evidence: [
          {
            evidence_id: "doc_riverdale_energy::chunk_000",
            source_document_id: "doc_riverdale_energy",
            title: "Riverdale Sustainability Report",
            snippet:
              "Riverdale's 2024 solar expansion reduced campus grid electricity purchases by 18 percent during the first full operating year.",
            url: "https://example.edu/riverdale/sustainability-report",
            published_at: "2024-11-05",
            score: 0.93,
            retrieval_score: 0.93,
            rerank_score: 0.93,
            stance_hint: "supports",
          },
        ],
      },
      {
        claim_id: "claim_002",
        claim_text: "Administrators also said the project cost $4 million.",
        query_text: "Riverdale solar expansion project cost 4 million",
        alternative_queries: ["Riverdale capital projects summary $4.0 million solar expansion"],
        label: "supported",
        confidence: 0.79,
        rationale: "The finance summary reports the same budget figure as the claim.",
        justification:
          "The finance summary lists the solar expansion budget at $4.0 million, matching the claim.",
        corrected_rewrite: null,
        evidence: [
          {
            evidence_id: "doc_riverdale_budget::chunk_000",
            source_document_id: "doc_riverdale_budget",
            title: "Riverdale Capital Projects Summary",
            snippet:
              "The solar expansion budget totaled $4.0 million, with construction completed in late 2024.",
            url: "https://example.edu/riverdale/capital-projects",
            published_at: "2024-10-18",
            score: 0.88,
            retrieval_score: 0.88,
            rerank_score: 0.88,
            stance_hint: "supports",
          },
        ],
      },
      {
        claim_id: "claim_003",
        claim_text: "The same announcement claimed the project received no state funding.",
        query_text: "Riverdale solar expansion no state funding grant",
        alternative_queries: ["Riverdale grant announcement state clean-energy grant"],
        label: "refuted",
        confidence: 0.83,
        rationale:
          "The strongest evidence says the project received a state grant, which directly contradicts the claim.",
        justification:
          "The strongest evidence says the project included a state clean-energy grant, directly contradicting the claim.",
        corrected_rewrite: {
          text:
            "The project was financed through university funds and a state clean-energy grant.",
          edit_summary:
            "Replaced the unsupported 'no state funding' phrase with the supported funding description.",
          citations: [
            {
              evidence_id: "doc_riverdale_grant::chunk_000",
              title: "Riverdale Grant Announcement",
              url: "https://example.edu/riverdale/grant-announcement",
            },
          ],
        },
        evidence: [
          {
            evidence_id: "doc_riverdale_grant::chunk_000",
            source_document_id: "doc_riverdale_grant",
            title: "Riverdale Grant Announcement",
            snippet:
              "Riverdale University received a $900,000 state clean-energy grant to support the solar expansion.",
            url: "https://example.edu/riverdale/grant-announcement",
            published_at: "2024-08-12",
            score: 0.91,
            retrieval_score: 0.91,
            rerank_score: 0.91,
            stance_hint: "refutes",
          },
        ],
      },
      {
        claim_id: "claim_004",
        claim_text:
          "The same announcement claimed the project made Riverdale the first carbon-neutral campus in Pennsylvania.",
        query_text: "Riverdale first carbon-neutral campus Pennsylvania",
        alternative_queries: ["Riverdale climate action FAQ carbon neutrality Pennsylvania first"],
        label: "not_enough_info",
        confidence: 0.3,
        rationale:
          "The evidence mentions a pathway toward carbon neutrality but does not establish a statewide first-place ranking.",
        justification:
          "The retrieved materials discuss emissions reductions but do not establish a statewide 'first' comparison.",
        corrected_rewrite: null,
        evidence: [
          {
            evidence_id: "doc_riverdale_net_zero::chunk_000",
            source_document_id: "doc_riverdale_net_zero",
            title: "Riverdale Climate Action FAQ",
            snippet:
              "University officials said the solar project is part of a broader pathway toward campus carbon neutrality.",
            url: "https://example.edu/riverdale/climate-faq",
            published_at: "2024-12-01",
            score: 0.58,
            retrieval_score: 0.58,
            rerank_score: 0.58,
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
    pipeline_metadata: {
      run_id: "sample_recent_001",
      dataset_name: "recent_news",
      ...sharedPipelineMetadata,
      total_stage_fallbacks: 0,
    },
    stage_trace: [
      {
        stage: "claim_extraction",
        status: "success",
        detail: "Separated the paragraph into three recent-event claims.",
        duration_ms: 91,
        retries: 0,
      },
      {
        stage: "query_generation",
        status: "success",
        detail: "Focused the retrieval queries on opening date, ridership change, and budget impact.",
        duration_ms: 43,
        retries: 0,
      },
      {
        stage: "evidence_retrieval",
        status: "success",
        detail: "Retrieved transit construction and dashboard evidence with publication dates.",
        duration_ms: 128,
        retries: 0,
      },
      {
        stage: "verdict_classification",
        status: "success",
        detail: "Refuted the exaggerated ridership claim and preserved NEI on the unsupported budget-surplus claim.",
        duration_ms: 111,
        retries: 0,
      },
      {
        stage: "corrective_rewrite",
        status: "success",
        detail: "Generated a single citation-backed correction for the ridership claim.",
        duration_ms: 62,
        retries: 0,
      },
    ],
    claims: [
      {
        claim_id: "claim_001",
        claim_text:
          "A city transit briefing said the 2025 Blue Line extension opened two months early.",
        query_text: "Blue Line extension opened two months early briefing",
        alternative_queries: ["City Transit construction update ahead of schedule Blue Line"],
        label: "supported",
        confidence: 0.77,
        rationale:
          "The retrieved construction update directly confirms the ahead-of-schedule opening.",
        justification:
          "The briefing notes confirm the extension opened ahead of the original schedule by roughly eight weeks.",
        corrected_rewrite: null,
        evidence: [
          {
            evidence_id: "doc_blue_line_schedule::chunk_000",
            source_document_id: "doc_blue_line_schedule",
            title: "City Transit Construction Update",
            snippet:
              "The 2025 Blue Line extension entered service approximately two months ahead of the original construction schedule.",
            url: "https://city.example/transit/blue-line-update",
            published_at: "2025-09-21",
            score: 0.87,
            retrieval_score: 0.87,
            rerank_score: 0.87,
            stance_hint: "supports",
          },
        ],
      },
      {
        claim_id: "claim_002",
        claim_text: "The report also said weekday ridership doubled in its first month.",
        query_text: "Blue Line first month weekday ridership doubled",
        alternative_queries: ["Transit ridership dashboard Blue Line first month 24 percent"],
        label: "refuted",
        confidence: 0.81,
        rationale:
          "The dashboard reports a 24 percent increase, so the claim overstates the result.",
        justification:
          "The ridership dashboard shows a 24 percent increase, not a doubling, so the claim overstates the effect.",
        corrected_rewrite: {
          text:
            "The first-month weekday ridership rose by about 24 percent after the Blue Line extension opened.",
          edit_summary:
            "Adjusted the unsupported 'doubled' wording to the reported ridership increase.",
          citations: [
            {
              evidence_id: "doc_blue_line_ridership::chunk_000",
              title: "Transit Ridership Dashboard",
              url: "https://city.example/transit/ridership-dashboard",
            },
          ],
        },
        evidence: [
          {
            evidence_id: "doc_blue_line_ridership::chunk_000",
            source_document_id: "doc_blue_line_ridership",
            title: "Transit Ridership Dashboard",
            snippet:
              "Average weekday ridership increased by roughly 24 percent during the first month of Blue Line extension service.",
            url: "https://city.example/transit/ridership-dashboard",
            published_at: "2025-10-10",
            score: 0.9,
            retrieval_score: 0.9,
            rerank_score: 0.9,
            stance_hint: "refutes",
          },
        ],
      },
      {
        claim_id: "claim_003",
        claim_text:
          "Local coverage further suggested the project had already generated a budget surplus.",
        query_text: "Blue Line budget surplus first quarter service",
        alternative_queries: ["Blue Line extension financial update budget surplus"],
        label: "not_enough_info",
        confidence: 0.28,
        rationale:
          "Retrieved evidence covers construction timing and ridership, not a verified budget-surplus outcome.",
        justification:
          "The retrieved materials do not provide enough evidence to verify the budget surplus claim.",
        corrected_rewrite: null,
        evidence: [
          {
            evidence_id: "doc_blue_line_schedule::chunk_000",
            source_document_id: "doc_blue_line_schedule",
            title: "City Transit Construction Update",
            snippet:
              "Transit officials described the opening as an ahead-of-schedule milestone for the project.",
            url: "https://city.example/transit/blue-line-update",
            published_at: "2025-09-21",
            score: 0.45,
            retrieval_score: 0.45,
            rerank_score: 0.45,
            stance_hint: "context",
          },
        ],
      },
    ],
  },
  custom_claim_stack: {
    run_id: "sample_custom_001",
    dataset_name: "custom",
    input_text: exampleCases[2].inputText,
    summary: {
      total_claims: 3,
      supported: 0,
      refuted: 2,
      not_enough_info: 1,
    },
    pipeline_metadata: {
      run_id: "sample_custom_001",
      dataset_name: "custom",
      ...sharedPipelineMetadata,
      loops_used: 1,
      total_stage_fallbacks: 1,
    },
    stage_trace: [
      {
        stage: "claim_extraction",
        status: "fallback",
        detail: "Recovered from one malformed extraction response and repaired the claim list.",
        duration_ms: 123,
        retries: 1,
      },
      {
        stage: "query_generation",
        status: "success",
        detail: "Generated claim-specific retrieval queries with alternative phrasings.",
        duration_ms: 52,
        retries: 0,
      },
      {
        stage: "evidence_retrieval",
        status: "success",
        detail: "Found strong evidence for funding and ridership, but not for the surplus claim.",
        duration_ms: 141,
        retries: 0,
      },
      {
        stage: "verdict_classification",
        status: "success",
        detail: "Refuted two claims and preserved NEI on the unsupported surplus claim.",
        duration_ms: 117,
        retries: 0,
      },
    ],
    claims: [
      {
        claim_id: "claim_001",
        claim_text: "Analysts said Riverdale's solar expansion used no state funding.",
        query_text: "Riverdale solar expansion no state funding",
        alternative_queries: ["Riverdale grant announcement state grant solar expansion"],
        label: "refuted",
        confidence: 0.89,
        rationale: "A state clean-energy grant directly contradicts the claim.",
        justification:
          "The evidence shows Riverdale received state grant support for the solar expansion.",
        corrected_rewrite: {
          text:
            "Riverdale's solar expansion combined university funding with a state clean-energy grant.",
          edit_summary:
            "Replaced the unsupported funding denial with the supported blended funding description.",
          citations: [
            {
              evidence_id: "doc_riverdale_grant::chunk_000",
              title: "Riverdale Grant Announcement",
              url: "https://example.edu/riverdale/grant-announcement",
            },
          ],
        },
        evidence: [
          {
            evidence_id: "doc_riverdale_grant::chunk_000",
            source_document_id: "doc_riverdale_grant",
            title: "Riverdale Grant Announcement",
            snippet:
              "Riverdale University received a $900,000 state clean-energy grant to support the solar expansion.",
            url: "https://example.edu/riverdale/grant-announcement",
            published_at: "2024-08-12",
            score: 0.94,
            retrieval_score: 0.94,
            rerank_score: 0.94,
            stance_hint: "refutes",
          },
        ],
      },
      {
        claim_id: "claim_002",
        claim_text: "A transit bulletin also said weekday ridership on the Blue Line doubled in month one.",
        query_text: "Blue Line ridership doubled month one",
        alternative_queries: ["Blue Line first month ridership 24 percent dashboard"],
        label: "refuted",
        confidence: 0.82,
        rationale:
          "The official dashboard reports a smaller increase, so the doubling language is unsupported.",
        justification:
          "The official dashboard reports a 24 percent increase, not a doubling, during the first month.",
        corrected_rewrite: null,
        evidence: [
          {
            evidence_id: "doc_blue_line_ridership::chunk_000",
            source_document_id: "doc_blue_line_ridership",
            title: "Transit Ridership Dashboard",
            snippet:
              "Average weekday ridership increased by roughly 24 percent during the first month of Blue Line extension service.",
            url: "https://city.example/transit/ridership-dashboard",
            published_at: "2025-10-10",
            score: 0.89,
            retrieval_score: 0.89,
            rerank_score: 0.89,
            stance_hint: "refutes",
          },
        ],
      },
      {
        claim_id: "claim_003",
        claim_text: "Commentary further claimed the extension immediately produced a budget surplus.",
        query_text: "Blue Line extension budget surplus immediate",
        alternative_queries: ["Blue Line finances budget surplus quarter one"],
        label: "not_enough_info",
        confidence: 0.34,
        rationale: "No decisive financial record was retrieved for the surplus claim.",
        justification:
          "The retrieved evidence is related to the project but does not verify the budget-surplus outcome.",
        corrected_rewrite: null,
        evidence: [
          {
            evidence_id: "doc_blue_line_schedule::chunk_000",
            source_document_id: "doc_blue_line_schedule",
            title: "City Transit Construction Update",
            snippet:
              "Transit officials described the opening as an ahead-of-schedule milestone for the project.",
            url: "https://city.example/transit/blue-line-update",
            published_at: "2025-09-21",
            score: 0.39,
            retrieval_score: 0.39,
            rerank_score: 0.39,
            stance_hint: "context",
          },
        ],
      },
    ],
  },
};
