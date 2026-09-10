"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Store } from "lucide-react";
import WizardSteps from "@/src/app/components/shared/WizardSteps";
import SingleImageUpload from "@/src/app/components/shared/SingleImageUpload";
import Textarea from "@/src/app/components/ui/Textarea";
import Button from "@/src/app/components/ui/Button";
import Spinner from "@/src/app/components/ui/Spinner";
import { vendorSteps } from "@/src/lib/vendorOnboardingSteps";
import { useRequireAuth } from "@/src/hooks/useRequireAuth";
import {
  getMyVendorProfile,
  updateMyVendorProfile,
  uploadVendorLogo,
} from "@/src/lib/api/vendors";
import { ApiError } from "@/src/lib/api-client";

export default function VendorStoreSetupPage() {
  const { isLoading: authLoading, user } = useRequireAuth();
  const router = useRouter();

  const [businessName, setBusinessName] = useState("");
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [bio, setBio] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // The vendor record is created on the previous step, so anyone landing
  // here without one is sent back to start rather than shown a dead form.
  useEffect(() => {
    if (authLoading || !user) return;
    getMyVendorProfile()
      .then((profile) => {
        setBusinessName(profile.businessName);
        setLogoUrl(profile.logoUrl);
        setBio(profile.bio ?? "");
      })
      .catch((err) => {
        if (err instanceof ApiError && err.status === 404) {
          router.replace("/vendor-onboarding/business-info");
          return;
        }
        setError("Couldn't load your registration. Please try again.");
      })
      .finally(() => setIsLoading(false));
  }, [authLoading, user, router]);

  async function handleContinue() {
    setError(null);
    setIsSubmitting(true);
    try {
      await updateMyVendorProfile({
        logoUrl,
        bio: bio.trim() === "" ? null : bio.trim(),
      });
      router.push("/vendor-onboarding/verification");
    } catch (err) {
      console.error("Failed to save store setup", err);
      setError("Something went wrong saving your store details. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (authLoading || !user) return null;

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <WizardSteps steps={vendorSteps} currentStep={1} />

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Spinner label="Loading your registration..." />
        </div>
      ) : (
        <div className="mt-12 grid grid-cols-1 gap-10 lg:grid-cols-[1fr_1.4fr]">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Set up your store</h1>
            <p className="mt-3 text-sm text-gray-500">
              This is how customers will see {businessName || "your store"} on
              the marketplace. Both are optional and can be changed later
              from your store settings.
            </p>

            <div className="mt-6 flex gap-3 rounded-md bg-gray-50 p-4">
              <Store className="h-5 w-5 shrink-0 text-primary-600" />
              <div>
                <p className="text-sm font-semibold text-gray-900">Your storefront</p>
                <p className="mt-1 text-sm text-gray-500">
                  Your logo and description appear on your public storefront
                  page, and your logo shows next to your products.
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-md border border-gray-200 bg-white p-8">
            <div>
              <span className="text-sm font-semibold text-gray-900">Store Logo</span>
              <p className="mt-1 text-sm text-gray-500">
                Square images work best. Without one, your store shows its
                initials instead.
              </p>
              <div className="mt-3">
                <SingleImageUpload
                  imageUrl={logoUrl}
                  onChange={setLogoUrl}
                  uploadFn={uploadVendorLogo}
                />
              </div>
            </div>

            <div className="my-6 border-t border-gray-200" />

            <div>
              <label htmlFor="store-bio" className="text-sm font-semibold text-gray-900">
                Store Description
              </label>
              <Textarea
                id="store-bio"
                placeholder="Tell customers what your store is about..."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="mt-2"
                rows={4}
                maxLength={1000}
              />
            </div>

            {error && <p className="mt-4 text-sm text-danger-500">{error}</p>}

            <div className="mt-8 flex items-center justify-between">
              <Button variant="ghost" size="sm" href="/vendor-onboarding/business-info">
                ← Back
              </Button>
              <Button isLoading={isSubmitting} onClick={handleContinue}>
                Save and Continue →
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
