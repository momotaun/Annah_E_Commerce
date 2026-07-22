import { cn } from "@/src/lib/utils";

export interface FormFieldProps {
  label: string;
  htmlFor?: string;
  required?: boolean;
  className?: string;
  children: React.ReactNode;
}

function FormField({ label, htmlFor, required, className, children }: FormFieldProps) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label
        htmlFor={htmlFor}
        className="text-sm font-semibold text-gray-900"
      >
        {label}
        {required && <span className="text-danger-500 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}

export default FormField;