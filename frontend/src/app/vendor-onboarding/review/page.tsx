"use client";

import { useState } from "react";
import Image from "next/image";
import { Building2, Pencil, ShieldCheck, MessageCircle, X } from "lucide-react";
import WizardSteps from "@/src/app/components/shared/WizardSteps";
import Badge from "@/src/app/components/ui/Badge";
import Checkbox from "@/src/app/components/ui/Checkbox";
import Button from "@/src/app/components/ui/Button";
import { vendorSteps } from "@/src/lib/vendorOnboardingSteps";

export default function VendorReviewPage() {
  const [certifyChecked, setCertifyChecked] = useState(true);
  const [agreementChecked, setAgreementChecked] = useState(false);

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <div className="mb-8 flex items-center justify-end">
        <button className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900">
          Exit Onboarding
          <X className="h-4 w-4" />
        </button>
      </div>

      <WizardSteps steps={vendorSteps} currentStep={3} />

      <div className="mt-12 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_360px]">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Final Review</h1>
          <p className="mt-1 text-sm text-gray-500">
            Please verify your information before submitting your
            application. Most details can be updated later from your
            dashboard.
          </p>

          <div className="mt-6 rounded-md border border-gray-200 bg-white p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-primary-600" />
                <h2 className="text-base font-semibold text-gray-900">Business Details</h2>
              </div>
              <button className="flex items-center gap-1 text-sm font-medium text-primary-600 hover:underline">
                <Pencil className="h-3.5 w-3.5" />
                Edit
              </button>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div>
                <p className="text-xs font-medium uppercase text-gray-500">Legal Entity Name</p>
                <p className="mt-1 text-sm font-semibold text-gray-900">Starlight Logistics &amp; Goods Ltd.</p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase text-gray-500">Tax Identification Number</p>
                <p className="mt-1 text-sm font-semibold text-gray-900">XX-98347521-0</p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase text-gray-500">Business Address</p>
                <p className="mt-1 text-sm font-semibold text-gray-900">
                  452 Industrial Blvd, Suite 10, Austin, TX 78701, USA
                </p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase text-gray-500">Contact Person</p>
                <p className="mt-1 text-sm font-semibold text-gray-900">Jonathan Sterling (CEO)</p>
              </div>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div className="rounded-md border border-gray-200 bg-white p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-semibold text-gray-900">Store Branding</h2>
                <button className="text-gray-400 hover:text-primary-600">
                  <Pencil className="h-3.5 w-3.5" />
                </button>
              </div>
              <div className="mt-4 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-md bg-gray-100 text-xs font-bold text-primary-600">
                  SE
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">Starlight Essentials</p>
                  <p className="text-xs text-gray-500">Store Handle: @starlight_essentials</p>
                </div>
              </div>
              <p className="mt-4 text-xs font-medium uppercase text-gray-500">Banner Preview</p>
              <div className="relative mt-2 aspect-video overflow-hidden rounded-md bg-gray-100">
                <Image src="/images/vendor-banner-preview.jpg" alt="" fill className="object-cover" />
              </div>
            </div>

            <div className="rounded-md border border-gray-200 bg-white p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-semibold text-gray-900">Inventory Focus</h2>
                <button className="text-gray-400 hover:text-primary-600">
                  <Pencil className="h-3.5 w-3.5" />
                </button>
              </div>
              <p className="mt-4 text-xs font-medium uppercase text-gray-500">Primary Category</p>
              <Badge variant="primary" className="mt-1.5">Home &amp; Living</Badge>

              <p className="mt-4 text-xs font-medium uppercase text-gray-500">Estimated SKU Count</p>
              <p className="mt-1 text-sm font-semibold text-gray-900">150 - 500 items</p>

              <div className="mt-4 flex gap-2 rounded-md bg-warning-500/10 p-3 text-xs text-gray-700">
                <ShieldCheck className="h-4 w-4 shrink-0 text-warning-500" />
                Verification check passed for business registration ID.
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <div className="rounded-md bg-gray-50 p-6">
            <h2 className="text-base font-semibold text-gray-900">Confirm Submission</h2>

            <div className="mt-4 flex flex-col gap-4">
              <div className="flex gap-2">
                <Checkbox
                  checked={agreementChecked}
                  onChange={(e) => setAgreementChecked(e.target.checked)}
                />
                <p className="text-sm text-gray-700">
                  I agree to the{" "}
                  <a href="#" className="text-primary-600 hover:underline">Vendor Services Agreement</a>{" "}
                  and the{" "}
                  <a href="#" className="text-primary-600 hover:underline">Apex Marketplace Terms &amp; Conditions</a>.
                </p>
              </div>
              <div className="flex gap-2">
                <Checkbox
                  checked={certifyChecked}
                  onChange={(e) => setCertifyChecked(e.target.checked)}
                />
                <p className="text-sm text-gray-700">
                  I certify that the information provided is accurate and
                  representative of my legal business status.
                </p>
              </div>
            </div>

            <Button
              fullWidth
              className="mt-5"
              disabled={!agreementChecked || !certifyChecked}
            >
              Submit Application →
            </Button>

            <p className="mt-3 text-center text-xs text-gray-500">
              By clicking submit, your application will enter a 24-48 hour
              review process. You will be notified via email.
            </p>
          </div>

          <div className="rounded-md border border-gray-200 bg-white p-6">
            <p className="text-sm font-semibold text-gray-900">Need help?</p>
            <p className="mt-1 text-sm text-gray-500">
              Our vendor onboarding specialists are available 24/7 to assist
              with your application.
            </p>
            <button className="mt-3 flex items-center gap-1.5 text-sm font-medium text-primary-600 hover:underline">
              <MessageCircle className="h-4 w-4" />
              Start Live Chat
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}