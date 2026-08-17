"use client";

import { useRouter } from "next/navigation";
import WizardSteps from "@/src/app/components/shared/WizardSteps";
import Button from "@/src/app/components/ui/Button";
import { vendorSteps } from "@/src/lib/vendorOnboardingSteps";

export default function VendorStoreSetupPage() {
  const router = useRouter();

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <WizardSteps steps={vendorSteps} currentStep={1} />

      <div className="mt-12 rounded-md border border-gray-200 bg-white p-8 text-center">
        <h1 className="text-2xl font-bold text-gray-900">Store customization is coming soon</h1>
        <p className="mt-3 text-sm text-gray-500">
          Store name, description, category, and currency settings aren&apos;t
          available to configure yet — your marketplace listing will use
          your business name until this is built out. You can continue your
          application in the meantime.
        </p>
        <div className="mt-8 flex items-center justify-between">
          <Button variant="ghost" size="sm" href="/vendor-onboarding/business-info">
            ← Back
          </Button>
          <Button onClick={() => router.push("/vendor-onboarding/verification")}>
            Continue →
          </Button>
        </div>
      </div>
    </div>
  );
}