"use client";

import { ShieldCheck, FileCheck, Clock, UploadCloud, Landmark, MapPin } from "lucide-react";
import WizardSteps from "@/src/app/components/shared/WizardSteps";
import Button from "@/src/app/components/ui/Button";
import Badge from "@/src/app/components/ui/Badge";
import { vendorSteps } from "@/src/lib/vendorOnboardingSteps";

function UploadBox({
  icon,
  helperText,
}: {
  icon: React.ReactNode;
  helperText: string;
}) {
  return (
    <button
      type="button"
      className="flex w-full flex-col items-center gap-2 rounded-md border-2 border-dashed border-gray-200 py-12 text-center hover:border-primary-600"
    >
      <span className="text-gray-400">{icon}</span>
      <span className="text-sm font-semibold text-gray-900">
        Click to upload or drag and drop
      </span>
      <span className="text-xs text-gray-500">{helperText}</span>
    </button>
  );
}

export default function VendorVerificationPage() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <WizardSteps steps={vendorSteps} currentStep={2} />

      <div className="mt-12 grid grid-cols-1 gap-8 lg:grid-cols-[320px_1fr]">
        <div className="flex flex-col gap-6">
          <div className="rounded-md border border-gray-200 bg-white p-6">
            <h2 className="text-xl font-bold text-gray-900">Document Verification</h2>
            <p className="mt-2 text-sm text-gray-500">
              To maintain a trusted marketplace, we require verification of
              your identity and business legitimacy.
            </p>

            <ul className="mt-5 flex flex-col gap-4">
              <li className="flex gap-3">
                <ShieldCheck className="h-5 w-5 shrink-0 text-primary-600" />
                <div>
                  <p className="text-sm font-semibold text-gray-900">End-to-End Encryption</p>
                  <p className="text-sm text-gray-500">
                    Your documents are encrypted and stored in SOC2 compliant servers.
                  </p>
                </div>
              </li>
              <li className="flex gap-3">
                <FileCheck className="h-5 w-5 shrink-0 text-primary-600" />
                <div>
                  <p className="text-sm font-semibold text-gray-900">Supported Formats</p>
                  <p className="text-sm text-gray-500">
                    PDF, JPEG, or PNG. Maximum file size is 10MB per document.
                  </p>
                </div>
              </li>
              <li className="flex gap-3">
                <Clock className="h-5 w-5 shrink-0 text-primary-600" />
                <div>
                  <p className="text-sm font-semibold text-gray-900">Fast Review</p>
                  <p className="text-sm text-gray-500">
                    Usually verified within 24-48 business hours.
                  </p>
                </div>
              </li>
            </ul>
          </div>

          <div className="rounded-md bg-primary-600 p-6 text-white">
            <p className="text-sm font-semibold">Need Help?</p>
            <p className="mt-1 text-sm text-white/80">
              If you&apos;re having trouble uploading your documents, our
              vendor support team is here to help.
            </p>
            <Button variant="secondary" size="sm" className="mt-4">
              Contact Support
            </Button>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <div className="rounded-md border border-gray-200 bg-white p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-base font-semibold text-gray-900">1. Identity Document</p>
                <p className="text-sm text-gray-500">
                  Passport, National ID Card, or Driver&apos;s License.
                </p>
              </div>
              <Badge variant="warning">Required</Badge>
            </div>
            <div className="mt-4">
              <UploadBox icon={<UploadCloud className="h-8 w-8" />} helperText="High resolution, clear text required" />
            </div>
          </div>

          <div className="rounded-md border border-gray-200 bg-white p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-base font-semibold text-gray-900">2. Business License</p>
                <p className="text-sm text-gray-500">
                  Proof of legal business registration or incorporation.
                </p>
              </div>
              <Badge variant="warning">Required</Badge>
            </div>
            <div className="mt-4">
              <UploadBox icon={<Landmark className="h-8 w-8" />} helperText="Must match the registered store name" />
            </div>
          </div>

          <div className="rounded-md border border-gray-200 bg-white p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-base font-semibold text-gray-900">3. Proof of Address</p>
                <p className="text-sm text-gray-500">
                  Utility bill or bank statement (not older than 3 months).
                </p>
              </div>
              <Badge variant="warning">Required</Badge>
            </div>
            <div className="mt-4">
              <UploadBox icon={<MapPin className="h-8 w-8" />} helperText="Full page required showing address" />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <Button variant="ghost" size="sm" href="/vendor-onboarding/store-setup">
              ← Back
            </Button>
            <div className="flex gap-3">
              <Button variant="secondary" size="sm">Save Progress</Button>
              <Button href="/vendor-onboarding/review">Save and Continue</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}