"use client";

import { useRouter } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import WizardSteps from "@/src/app/components/shared/WizardSteps";
import Button from "@/src/app/components/ui/Button";
import { vendorSteps } from "@/src/lib/vendorOnboardingSteps";

export default function VendorVerificationPage() {
  const router = useRouter();

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <WizardSteps steps={vendorSteps} currentStep={2} />

      <div className="mt-12 rounded-md border border-gray-200 bg-white p-8 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-gray-400">
          <ShieldCheck className="h-6 w-6" />
        </div>

        <h1 className="mt-4 text-2xl font-bold text-gray-900">
          Document verification is coming soon
        </h1>
        <p className="mt-3 text-sm text-gray-500">
          Uploading identity documents, business licenses, and proof of
          address isn&apos;t available yet — your application will be
          reviewed manually by an administrator based on the business
          details you&apos;ve already submitted. You can continue your
          application in the meantime.
        </p>

        <div className="mt-8 flex items-center justify-between">
          <Button variant="ghost" size="sm" href="/vendor-onboarding/store-setup">
            ← Back
          </Button>
          <Button onClick={() => router.push("/vendor-onboarding/review")}>
            Continue →
          </Button>
        </div>
      </div>
    </div>
  );
}