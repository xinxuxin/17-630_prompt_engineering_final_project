import { Suspense } from "react";

import { DemoShell } from "@/components/demo/demo-shell";
import { SiteHeader } from "@/components/layout/site-header";

export default function DemoPage({}: PageProps<"/demo">) {
  return (
    <main className="min-h-screen pb-16">
      <div className="grid-fade">
        <SiteHeader compact />
      </div>
      <Suspense fallback={null}>
        <DemoShell />
      </Suspense>
    </main>
  );
}
