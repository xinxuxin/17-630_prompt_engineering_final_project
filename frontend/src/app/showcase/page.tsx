import { SiteHeader } from "@/components/layout/site-header";
import { PresentationCaseShell } from "@/components/showcase/presentation-case-shell";

export default function ShowcasePage({}: PageProps<"/showcase">) {
  return (
    <main className="min-h-screen pb-16">
      <div className="grid-fade">
        <SiteHeader compact />
      </div>
      <PresentationCaseShell />
    </main>
  );
}
