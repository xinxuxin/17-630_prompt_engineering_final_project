import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-medium transition-all duration-300 disabled:pointer-events-none disabled:opacity-50 outline-none focus-visible:ring-4 focus-visible:ring-ring/60",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-[0_18px_40px_rgba(59,130,246,0.24)] hover:-translate-y-0.5 hover:shadow-[0_24px_48px_rgba(59,130,246,0.28)]",
        secondary: "bg-secondary text-secondary-foreground ring-1 ring-border/70 hover:bg-secondary/80",
        ghost: "text-muted-foreground hover:bg-white/6 hover:text-foreground",
      },
      size: {
        default: "h-11 px-5",
        sm: "h-9 px-4 text-xs",
        lg: "h-12 px-6 text-sm",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
