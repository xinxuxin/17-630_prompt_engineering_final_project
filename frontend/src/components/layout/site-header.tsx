import Link from "next/link";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type SiteHeaderProps = {
  compact?: boolean;
};

export function SiteHeader({ compact = false }: SiteHeaderProps) {
  return (
    <header className="sticky top-0 z-30 px-4 pt-4 sm:px-6 lg:px-10">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between rounded-full border border-white/8 bg-[rgba(6,18,34,0.72)] px-5 py-3 backdrop-blur-xl">
      <Link href="/" className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-[0_18px_36px_rgba(93,165,255,0.24)]">
          FC
        </div>
        <div className={cn("max-w-xs", compact && "max-w-sm")}>
          <p className="text-sm font-semibold tracking-[0.18em] text-primary uppercase">
            Prompt-Agent System
          </p>
          <p className="text-sm text-muted-foreground">
            Evidence-grounded fact checking for demos, evaluation, and failure analysis
          </p>
        </div>
      </Link>

      <div className="hidden items-center gap-2 md:flex">
        <Button asChild variant="ghost">
          <Link href="/">Overview</Link>
        </Button>
        <Button asChild variant="ghost">
          <Link href="/results">Results</Link>
        </Button>
        <Button asChild variant="secondary">
          <Link href="/demo">Open Demo</Link>
        </Button>
      </div>
      </div>
    </header>
  );
}
