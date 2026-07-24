import { Check } from "lucide-react";
import { cn } from "@/src/lib/utils";

export interface WizardStep {
  label: string;
}

export interface WizardStepsProps {
  steps: WizardStep[];
  currentStep: number; // 0-indexed
}

function WizardSteps({ steps, currentStep }: WizardStepsProps) {
  return (
    <div className="flex items-start">
      {steps.map((step, i) => {
        const isComplete = i < currentStep;
        const isActive = i === currentStep;
        const isLast = i === steps.length - 1;

        return (
          <div key={step.label} className={cn("flex items-center", !isLast && "flex-1")}>
            <div className="flex flex-col items-center gap-2">
              <div
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold",
                  isComplete && "bg-primary-600 text-white",
                  isActive && "border-2 border-primary-600 text-primary-600",
                  !isComplete && !isActive && "bg-gray-100 text-gray-500"
                )}
              >
                {isComplete ? <Check className="h-4 w-4" /> : i + 1}
              </div>
              <span
                className={cn(
                  "text-sm font-medium",
                  isActive || isComplete ? "text-primary-600" : "text-gray-500"
                )}
              >
                {step.label}
              </span>
            </div>

            {!isLast && (
              <div
                className={cn(
                  "mx-3 mt-[-20px] h-0.5 flex-1",
                  i < currentStep ? "bg-primary-600" : "bg-gray-200"
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

export default WizardSteps;