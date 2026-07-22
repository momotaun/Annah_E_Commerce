import { Loader2 } from "lucide-react";
import { cn } from "@/src/lib/utils";

export interface SpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  label?: string;
}

const sizeMap = {
  sm: "h-4 w-4",
  md: "h-6 w-6",
  lg: "h-8 w-8",
};

function Spinner({ size = "md", className, label }: SpinnerProps) {
  return (
    <span className="inline-flex items-center gap-2">
      <Loader2
        className={cn("animate-spin text-primary-600", sizeMap[size], className)}
        aria-hidden={label ? "true" : undefined}
      />
      {label && (
        <span className="text-sm text-gray-500">{label}</span>
      )}
      {!label && <span className="sr-only">Loading</span>}
    </span>
  );
}

export default Spinner;