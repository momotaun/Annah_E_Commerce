"use client";

import Image from "next/image";
import WizardSteps from "@/src/app/components/shared/WizardSteps";
import Input from "@/src/app/components/ui/Input";
import Textarea from "@/src/app/components/ui/Textarea";
import Select from "@/src/app/components/ui/Select";
import Button from "@/src/app/components/ui/Button";
import { vendorSteps } from "@/src/lib/vendorOnboardingSteps";

export default function VendorStoreSetupPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <WizardSteps steps={vendorSteps} currentStep={1} />

      <div className="mt-12 rounded-md border border-gray-200 bg-white p-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Create your digital storefront
        </h1>
        <p className="mt-2 text-sm text-gray-500">
          Tell us about your brand and what you plan to sell on Apex
          Marketplace.
        </p>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="text-sm font-semibold text-gray-900">Store Name</label>
            <Input placeholder="e.g. Modern Pulse Tech" className="mt-1.5" />
          </div>
          <div>
            <label className="text-sm font-semibold text-gray-900">Store URL Preview</label>
            <div className="mt-1.5 flex h-10 items-center rounded-md border border-gray-200 bg-gray-50 px-3 text-sm text-gray-500">
              apex.shop/<span className="font-medium text-primary-600">your-store-name</span>
            </div>
          </div>
        </div>

        <div className="mt-4">
          <label className="text-sm font-semibold text-gray-900">Store Description</label>
          <Textarea placeholder="Share your brand story and product specialty..." className="mt-1.5" />
          <p className="mt-1 text-right text-xs text-gray-500">
            Recommended: 150-300 characters
          </p>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="text-sm font-semibold text-gray-900">Primary Category</label>
            <Select
              placeholder="Select a category"
              options={[
                { label: "Electronics", value: "electronics" },
                { label: "Home & Living", value: "home-living" },
                { label: "Fashion", value: "fashion" },
                { label: "Outdoor", value: "outdoor" },
              ]}
              className="mt-1.5"
            />
          </div>
          <div>
            <label className="text-sm font-semibold text-gray-900">Settlement Currency</label>
            <Select
              defaultValue="usd"
              options={[
                { label: "USD - US Dollar ($)", value: "usd" },
                { label: "ZAR - South African Rand (R)", value: "zar" },
              ]}
              className="mt-1.5"
            />
          </div>
        </div>

        <div className="mt-6 overflow-hidden rounded-md bg-gray-50">
          <div className="grid grid-cols-1 gap-6 p-6 sm:grid-cols-2">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Store Preview</h3>
              <p className="mt-1 text-sm text-gray-500">
                This is how your brand will appear in our catalogue. You can
                customize images later.
              </p>
              <span className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-primary-600">
                <span className="h-1.5 w-1.5 rounded-full bg-primary-600" />
                STAGE 2 LIVE PREVIEW
              </span>
            </div>
            <div className="relative overflow-hidden rounded-md">
              <div className="relative aspect-video bg-gray-200">
                <Image src="/images/vendor-store-preview.jpg" alt="" fill className="object-cover" />
              </div>
              <div className="absolute bottom-3 left-3 flex items-center gap-2 rounded-md bg-white px-3 py-2 shadow-sm">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary-600 text-xs font-bold text-white">
                  M
                </span>
                <div>
                  <p className="text-sm font-semibold text-gray-900">Your Store Name</p>
                  <p className="text-xs text-gray-500">Premium Electronics</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 flex items-center justify-between">
          <Button variant="ghost" size="sm" href="/vendor-onboarding/business-info">
            ← Back to Stage 1
          </Button>
          <div className="flex gap-3">
            <Button variant="secondary">Save as Draft</Button>
            <Button href="/vendor-onboarding/verification">Save and Continue</Button>
          </div>
        </div>
      </div>
    </div>
  );
}