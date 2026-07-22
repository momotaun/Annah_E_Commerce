'use client'
import { forwardRef } from "react";
import { cn } from "@/src/lib/utils";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, disabled, rows = 5, ...props }, ref) => {
    return (
      <div className="w-full">
        <textarea
          ref={ref}
          disabled={disabled}
          rows={rows}
          className={cn(
            "w-full rounded-md border bg-white px-3 py-2 text-base text-gray-900 placeholder:text-gray-500 resize-y",
            "focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-primary-600",
            "disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed",
            error ? "border-danger-500" : "border-gray-200",
            className
          )}
          {...props}
        />

        {error && (
          <p className="mt-1 text-sm text-danger-500">{error}</p>
        )}
      </div>
    );
  }
);

Textarea.displayName = "Textarea";

export default Textarea;