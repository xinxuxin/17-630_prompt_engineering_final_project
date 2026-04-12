import { EvaluationShell } from "@/components/results/evaluation-shell";
import { SiteHeader } from "@/components/layout/site-header";

export default function ResultsPage({}: PageProps<"/results">) {
  return (
    <main className="min-h-screen pb-16">
      <div className="grid-fade">
        <SiteHeader compact />
      </div>
      <EvaluationShell />
    </main>
  );
}
