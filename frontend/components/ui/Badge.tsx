import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils/cn";

const badgeVariants = cva(
  "inline-flex items-center rounded-sm px-1.5 py-0.5 text-xs font-mono font-medium transition-colors",
  {
    variants: {
      variant: {
        default:
          "bg-slate-800 text-white border border-slate-700",
        secondary:
          "bg-slate-900 text-slate-400 border border-slate-800",
        destructive:
          "bg-slate-900 text-rose-400 border border-rose-900/50",
        warning:
          "bg-slate-900 text-amber-300 border border-amber-900/50",
        gold:
          "bg-slate-800 text-white border border-slate-600 font-medium",
        outline: "text-slate-400 border border-border",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
