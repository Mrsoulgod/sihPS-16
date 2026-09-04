import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "success" | "warning" | "destructive" | "outline";
}

function Badge({
  className,
  variant = "default",
  ...props
}: BadgeProps) {
  const variantStyles = {
    default: "border-transparent bg-gov-secondary text-white",
    success: "border-transparent bg-gov-primaryLight text-gov-primaryDark font-medium",
    warning: "border-transparent bg-amber-100 text-amber-800 font-medium",
    destructive: "border-transparent bg-red-100 text-red-800 font-medium",
    outline: "border-gov-border text-gov-secondary",
  };

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors",
        variantStyles[variant],
        className
      )}
      {...props}
    />
  );
}

export { Badge };
