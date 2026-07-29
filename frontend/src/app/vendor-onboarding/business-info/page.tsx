"use client";

import { ShieldCheck } from "lucide-react";
import WizardSteps from "@/src/app/components/shared/WizardSteps";
import Input from "@/src/app/components/ui/Input";
import Select from "@/src/app/components/ui/Select";
import Button from "@/src/app/components/ui/Button";
import { vendorSteps } from "@/src/lib/vendorOnboardingSteps";

export default function VendorBusinessInfoPage() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <WizardSteps steps={vendorSteps} currentStep={0} />

      <div className="mt-12 grid grid-cols-1 gap-10 lg:grid-cols-[1fr_1.4fr]">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome to the Marketplace
          </h1>
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
            <Input placeholder="Company Name" />
            <Input placeholder="Registration Number" />
            <Input placeholder="Tax ID / VAT Number" />
            <Select
              placeholder="Legal Entity Type"
              options={[
                { label: "Sole Proprietor", value: "sole" },
                { label: "Partnership", value: "partnership" },
                { label: "Private Company", value: "private" },
                { label: "Public Company", value: "public" },
              ]}
            />
          </div>

          <div className="my-6 border-t border-gray-200" />

          <p className="text-sm font-semibold text-gray-900">
            Primary Contact Details
          </p>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input placeholder="Full Name" />
            <Input placeholder="Business Email" type="email" />
            <Input placeholder="Phone Number (with Country Code)" className="sm:col-span-2" />
          </div>

          <div className="mt-8 flex items-center justify-between">
            <Button variant="ghost" size="sm">Save Draft</Button>
            <Button href="/vendor-onboarding/store-setup" icon={undefined}>
              Save and Continue →
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}