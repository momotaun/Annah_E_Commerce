'use client'
import { forwardRef, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/src/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", icon, error, disabled, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === "password";
    const resolvedType = isPassword && showPassword ? "text" : type;

    return (
      <div className="w-full">
        <div className="relative">
          {icon && (
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
              {icon}
            </span>
          )}

          <input
            ref={ref}
            type={resolvedType}
            disabled={disabled}
            className={cn(
              "w-full h-10 rounded-md border bg-white px-3 text-base text-gray-900 placeholder:text-gray-500",
              "focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-primary-600",
              "disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed",
              icon && "pl-10",
              isPassword && "pr-10",
              error ? "border-danger-500" : "border-gray-200",
              className
            )}
            {...props}
          />

          {isPassword && (
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-900"
              tabIndex={-1}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          )}
        </div>

        {error && (
          <p className="mt-1 text-sm text-danger-500">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export default Input;