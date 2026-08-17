"use client";

import { CheckCircle2 } from "lucide-react";
import Button from "@/src/app/components/ui/Button";
import WizardSteps from "@/src/app/components/shared/WizardSteps";
import { vendorSteps } from "@/src/lib/vendorOnboardingSteps";

export default function VendorReviewPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <WizardSteps steps={vendorSteps} currentStep={3} />

      <div className="mt-12 flex flex-col items-center rounded-md border border-gray-200 bg-white p-10 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-primary-50 text-primary-600">
          <CheckCircle2 className="h-7 w-7" />
        </span>
        <h1 className="mt-6 text-2xl font-bold text-gray-900">
          Your application has been submitted
        </h1>
        <p className="mt-3 max-w-md text-sm text-gray-500">
          Your business registration is under review. You&apos;ll be notified
          once an administrator approves your account — approved vendors
          gain access to their product and order dashboard.
        </p>
        <Button href="/profile" className="mt-8">Back to Profile</Button>
      </div>
    </div>
  );
}