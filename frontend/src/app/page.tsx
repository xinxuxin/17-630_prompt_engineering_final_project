import { EvaluationSection } from "@/components/landing/evaluation-section";
import { HeroSection } from "@/components/landing/hero-section";
import { PipelineSection } from "@/components/landing/pipeline-section";
import { SiteHeader } from "@/components/layout/site-header";

export default function Home({}: PageProps<"/">) {
  return (
    <main className="min-h-screen pb-12">
      <div className="grid-fade">
        <SiteHeader />
        <HeroSection />
      </div>
      <PipelineSection />
      <EvaluationSection />
    </main>
  );
}
