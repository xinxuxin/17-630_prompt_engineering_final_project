import { BarChart3, BookOpenText, FlaskConical, Newspaper } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const cards = [
  {
    icon: FlaskConical,
    title: "Prompt Engineering In The Small",
    description:
      "Prompt files, schema contracts, retries, and validation hooks are first-class parts of the repository.",
  },
  {
    icon: Newspaper,
    title: "Recent-News Evaluation Support",
    description:
      "The repo cleanly separates benchmark-style testing from recent headline collections where stale pretraining becomes a real issue.",
  },
  {
    icon: BarChart3,
    title: "Positive And Negative Evidence",
    description:
      "Evaluation materials are structured to preserve both strong cases and important failure cases for the report.",
  },
  {
    icon: BookOpenText,
    title: "Presentation And Report Ready",
    description:
      "Architecture docs, prompt design notes, a demo script, and sample outputs support the final submission package.",
  },
];

export function EvaluationSection() {
  return (
    <section className="mx-auto w-full max-w-7xl px-6 pb-24 lg:px-10">
      <div className="mb-10 flex max-w-3xl flex-col gap-4">
        <p className="text-sm font-semibold tracking-[0.2em] text-primary uppercase">
          Evaluation + Deliverables
        </p>
        <h2 className="text-3xl font-semibold tracking-tight">
          Built for a demo, a report, and an honest analysis of failure.
        </h2>
        <p className="text-base leading-7 text-muted-foreground">
          The repository structure is intentionally aligned with course deliverables:
          evaluation configs, recent-news support, prompt notes, sample outputs, and
          experiment logs are all part of the first commit.
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <Card key={card.title}>
            <CardHeader>
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-accent text-accent-foreground">
                <card.icon className="h-5 w-5" />
              </div>
              <CardTitle>{card.title}</CardTitle>
              <CardDescription>{card.description}</CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Repository materials are ready to be expanded into slides, a short report, and a clean submission URL.
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
