import Link from "next/link";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type SiteHeaderProps = {
  compact?: boolean;
};

export function SiteHeader({ compact = false }: SiteHeaderProps) {
  return (
    <header className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-6 lg:px-10">
      <Link href="/" className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-[0_14px_30px_rgba(32,72,168,0.22)]">
          FC
        </div>
        <div className={cn("max-w-xs", compact && "max-w-sm")}>
          <p className="text-sm font-semibold tracking-[0.18em] text-primary/80 uppercase">
            Prompt-Agent System
          </p>
          <p className="text-sm text-muted-foreground">
            Multi-stage fact checking for demos, evaluation, and failure analysis
          </p>
        </div>
      </Link>

      <div className="hidden items-center gap-2 md:flex">
        <Button asChild variant="ghost">
          <Link href="/">Overview</Link>
        </Button>
        <Button asChild variant="secondary">
          <Link href="/demo">Open Demo</Link>
        </Button>
      </div>
    </header>
  );
}
