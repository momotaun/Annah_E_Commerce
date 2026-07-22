import { forwardRef } from "react";
import { Check } from "lucide-react";
import { cn } from "@/src/lib/utils";

export interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, disabled, id, ...props }, ref) => {
    return (
      <label
        htmlFor={id}
        className={cn(
          "inline-flex items-center gap-2 select-none",
          disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"
        )}
      >
        <span className="relative flex h-4 w-4 items-center justify-center">
          <input
            ref={ref}
            type="checkbox"
            id={id}
            disabled={disabled}
            className={cn(
              "peer h-4 w-4 shrink-0 appearance-none rounded border border-gray-200 bg-white",
              "checked:bg-primary-600 checked:border-primary-600",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-1",
              "disabled:cursor-not-allowed",
              className
            )}
            {...props}
          />
          <Check className="pointer-events-none absolute h-3 w-3 text-white opacity-0 peer-checked:opacity-100" />
        </span>

        {label && (
          <span className="text-sm text-gray-900">{label}</span>
        )}
      </label>
    );
  }
);

Checkbox.displayName = "Checkbox";

export default Checkbox;