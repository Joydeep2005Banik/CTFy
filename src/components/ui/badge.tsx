import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-white text-black hover:bg-zinc-200",
        secondary:
          "border-zinc-800 bg-zinc-900 text-zinc-300 hover:bg-zinc-800",
        destructive:
          "border-transparent bg-red-900/60 text-red-300 border-red-800",
        outline: "border-zinc-700 text-zinc-300",
        success:
          "border-emerald-800/80 bg-emerald-950/60 text-emerald-400 font-mono",
        cyber:
          "border-zinc-700 bg-zinc-900/80 text-zinc-200 font-mono shadow-sm",
        points:
          "border-amber-800/60 bg-amber-950/40 text-amber-300 font-mono font-bold",
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
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
