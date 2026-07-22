import { forwardRef } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/src/lib/utils";

export interface SelectOption {
  label: string;
  value: string;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  options: SelectOption[];
  error?: string;
  placeholder?: string;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, options, error, disabled, placeholder, ...props }, ref) => {
    return (
      <div className="w-full">
        <div className="relative">
          <select
            ref={ref}
            disabled={disabled}
            className={cn(
              "w-full h-10 appearance-none rounded-md border bg-white px-3 pr-10 text-base text-gray-900",
              "focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-primary-600",
              "disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed",
              error ? "border-danger-500" : "border-gray-200",
              className
            )}
            {...props}
          >
            {placeholder && (
              <option value="" disabled hidden>
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
        </div>

        {error && (
          <p className="mt-1 text-sm text-danger-500">{error}</p>
        )}
      </div>
    );
  }
);

Select.displayName = "Select";

export default Select;