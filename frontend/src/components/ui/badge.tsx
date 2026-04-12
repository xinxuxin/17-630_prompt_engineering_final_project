import type { HTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-semibold tracking-[0.18em] uppercase",
  {
    variants: {
      variant: {
        default: "border-white/8 bg-secondary text-secondary-foreground",
        supported: "border-[#1b5b45] bg-[rgba(43,157,111,0.16)] text-[#9cf0cb]",
        refuted: "border-[#72322a] bg-[rgba(226,102,73,0.16)] text-[#ffc0b2]",
        nei: "border-[#3d495e] bg-[rgba(137,154,188,0.13)] text-[#cedaf3]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export function Badge({
  className,
  variant,
  ...props
}: HTMLAttributes<HTMLDivElement> & VariantProps<typeof badgeVariants>) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}
