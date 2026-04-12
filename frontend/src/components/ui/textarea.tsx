import * as React from "react";

import { cn } from "@/lib/utils";

export function Textarea({
  className,
  ...props
}: React.ComponentProps<"textarea">) {
  return (
    <textarea
      className={cn(
        "min-h-40 w-full rounded-[24px] border border-white/8 bg-input px-4 py-4 text-sm leading-7 text-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] outline-none ring-0 placeholder:text-muted-foreground focus-visible:ring-4 focus-visible:ring-ring/60",
        className,
      )}
      {...props}
    />
  );
}
