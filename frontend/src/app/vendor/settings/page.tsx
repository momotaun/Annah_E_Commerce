"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Spinner from "@/src/app/components/ui/Spinner";
import Input from "@/src/app/components/ui/Input";
import Textarea from "@/src/app/components/ui/Textarea";
import Button from "@/src/app/components/ui/Button";
import SingleImageUpload from "@/src/app/components/shared/SingleImageUpload";
import {
  getMyVendorProfile,
  updateMyVendorProfile,
  uploadVendorLogo,
  VendorProfile,
} from "@/src/lib/api/vendors";
import { ApiError } from "@/src/lib/api-client";

export default function VendorSettingsPage() {
  const [vendor, setVendor] = useState<VendorProfile | null>(null);
  const [businessName, setBusinessName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [bio, setBio] = useState("");
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [status, setStatus] = useState<"idle" | "saved" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    getMyVendorProfile()
      .then((profile) => {
        setVendor(profile);
        setBusinessName(profile.businessName);
        setContactEmail(profile.contactEmail);
        setBio(profile.bio ?? "");
        setLogoUrl(profile.logoUrl);
      })
      .finally(() => setIsLoading(false));
  }, []);

  async function handleSave() {
    setStatus("idle");
    setErrorMessage(null);
    if (!businessName.trim() || !contactEmail.trim()) {
      setStatus("error");
      setErrorMessage("Business name and contact email are required.");
      return;
    }

    setIsSaving(true);
    try {
      const updated = await updateMyVendorProfile({
        businessName: businessName.trim(),
        contactEmail: contactEmail.trim(),
        bio: bio.trim() === "" ? null : bio.trim(),
        logoUrl,
      });
      setVendor(updated);
      setStatus("saved");
    } catch (err) {
      console.error("Failed to save store settings", err);
      setStatus("error");
      setErrorMessage(
        err instanceof ApiError && err.status === 409
          ? "That contact email is already used by another vendor."
          : "Failed to save. Please try again."
      );
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner label="Loading store settings..." />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Store Settings</h1>
        {vendor?.status === "APPROVED" && (
          <Link
            href={`/vendors/${vendor.id}`}
            target="_blank"
            className="text-sm text-primary-600 hover:underline"
          >
            View storefront
          </Link>
        )}
      </div>
      <p className="mt-1 text-sm text-gray-500">
        How your store appears to customers on the marketplace.
      </p>

      <div className="mt-6 flex max-w-2xl flex-col gap-6">
        <div>
          <span className="text-sm font-semibold text-gray-900">Store Logo</span>
          <p className="mt-1 text-sm text-gray-500">
            Square images work best. Without one, your store shows its initials instead.
          </p>
          <div className="mt-2">
            <SingleImageUpload imageUrl={logoUrl} onChange={setLogoUrl} uploadFn={uploadVendorLogo} />
          </div>
        </div>

        <div>
          <label htmlFor="business-name" className="text-sm font-semibold text-gray-900">
            Business Name
          </label>
          <Input
            id="business-name"
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
            className="mt-1.5"
          />
        </div>

        <div>
          <label htmlFor="contact-email" className="text-sm font-semibold text-gray-900">
            Contact Email
          </label>
          <Input
            id="contact-email"
            type="email"
            value={contactEmail}
            onChange={(e) => setContactEmail(e.target.value)}
            className="mt-1.5"
          />
        </div>

        <div>
          <label htmlFor="store-bio" className="text-sm font-semibold text-gray-900">
            Store Description
          </label>
          <Textarea
            id="store-bio"
            placeholder="Tell customers what your store is about..."
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className="mt-1.5"
            rows={4}
            maxLength={1000}
          />
        </div>

        <div className="flex items-center gap-3">
          <Button type="button" isLoading={isSaving} onClick={handleSave}>
            Save Changes
          </Button>
          {status === "saved" && <span className="text-sm text-success-500">Saved.</span>}
          {status === "error" && errorMessage && (
            <span className="text-sm text-danger-500">{errorMessage}</span>
          )}
        </div>
      </div>
    </div>
  );
}
