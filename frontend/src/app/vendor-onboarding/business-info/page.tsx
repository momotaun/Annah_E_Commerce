"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import WizardSteps from "@/src/app/components/shared/WizardSteps";
import Input from "@/src/app/components/ui/Input";
import Select from "@/src/app/components/ui/Select";
import Button from "@/src/app/components/ui/Button";
import { vendorSteps } from "@/src/lib/vendorOnboardingSteps";
import { useRequireAuth } from "@/src/hooks/useRequireAuth";
import { registerVendor } from "@/src/lib/api/vendors";
import { ApiError } from "@/src/lib/api-client";

export default function VendorBusinessInfoPage() {
  const { isLoading: authLoading, user } = useRequireAuth();
  const router = useRouter();

  const [companyName, setCompanyName] = useState("");
  const [businessEmail, setBusinessEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleContinue() {
    setError(null);
    if (!companyName || !businessEmail) {
      setError("Company Name and Business Email are required to continue.");
      return;
    }
    setIsSubmitting(true);
    try {
      await registerVendor({ businessName: companyName, contactEmail: businessEmail });
      router.push("/vendor-onboarding/store-setup");
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        setError("You've already submitted a vendor registration.");
      } else {
        setError("Something went wrong submitting your registration. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  if (authLoading || !user) return null;

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <WizardSteps steps={vendorSteps} currentStep={0} />

      <div className="mt-12 grid grid-cols-1 gap-10 lg:grid-cols-[1fr_1.4fr]">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Welcome to the Marketplace</h1>
          <p className="mt-3 text-sm text-gray-500">
            Let&apos;s start with your business basics. This information
            helps us verify your identity and ensures a secure environment
            for all trade.
          </p>

          <div className="mt-6 flex gap-3 rounded-md bg-gray-50 p-4">
            <ShieldCheck className="h-5 w-5 shrink-0 text-primary-600" />
            <div>
              <p className="text-sm font-semibold text-gray-900">Data Security</p>
              <p className="mt-1 text-sm text-gray-500">
                Your information is encrypted and stored according to global
                compliance standards.
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-md border border-gray-200 bg-white p-8">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              placeholder="Company Name"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
            />
            {/* Registration Number, Tax ID/VAT, Legal Entity Type have no
                field anywhere on our Vendor model (SDD Section 5.2) —
                shown for layout parity only, not persisted. */}
            <Input placeholder="Registration Number (not yet stored)" disabled />
            <Input placeholder="Tax ID / VAT Number (not yet stored)" disabled />
            <Select
              placeholder="Legal Entity Type (not yet stored)"
              disabled
              options={[]}
            />
          </div>

          <div className="my-6 border-t border-gray-200" />

          <p className="text-sm font-semibold text-gray-900">Primary Contact Details</p>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input placeholder="Full Name (not yet stored)" disabled />
            <Input
              placeholder="Business Email"
              type="email"
              value={businessEmail}
              onChange={(e) => setBusinessEmail(e.target.value)}
            />
            <Input placeholder="Phone Number (not yet stored)" disabled className="sm:col-span-2" />
          </div>

          {error && <p className="mt-4 text-sm text-danger-500">{error}</p>}

          <div className="mt-8 flex items-center justify-between">
            <Button variant="ghost" size="sm" disabled>Save Draft</Button>
            <Button isLoading={isSubmitting} onClick={handleContinue}>
              Save and Continue →
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}