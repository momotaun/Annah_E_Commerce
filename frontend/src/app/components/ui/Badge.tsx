import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/src/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full font-semibold px-2.5 py-0.5 text-xs whitespace-nowrap",
  {
    variants: {
      variant: {
        default: "bg-gray-100 text-gray-900",
        primary: "bg-primary-600 text-white",
        success: "bg-success-500/10 text-success-500",
        warning: "bg-warning-500/10 text-warning-500",
        danger: "bg-danger-50 text-danger-500",
        outline: "bg-transparent text-gray-500 border border-gray-200",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  icon?: React.ReactNode;
}

function Badge({ className, variant, icon, children, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props}>
      {icon}
      {children}
    </span>
  );
}

export default Badge;