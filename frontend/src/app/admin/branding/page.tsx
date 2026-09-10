"use client";

import { useEffect, useState } from "react";
import Spinner from "@/src/app/components/ui/Spinner";
import Input from "@/src/app/components/ui/Input";
import Button from "@/src/app/components/ui/Button";
import SingleImageUpload from "@/src/app/components/shared/SingleImageUpload";
import { getSiteSettings, updateSiteSettings, uploadSiteLogo } from "@/src/lib/api/site-settings";
import { useSiteSettings } from "@/src/context/SiteSettingsContext";

export default function BrandingPage() {
  const { refresh } = useSiteSettings();
  const [siteName, setSiteName] = useState("");
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [announcementText, setAnnouncementText] = useState("");
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [status, setStatus] = useState<"idle" | "saved" | "error">("idle");

  useEffect(() => {
    getSiteSettings()
      .then((settings) => {
        setSiteName(settings.siteName);
        setLogoUrl(settings.logoUrl);
        setAnnouncementText(settings.announcementText ?? "");
        setUpdatedAt(settings.updatedAt);
      })
      .finally(() => setIsLoading(false));
  }, []);

  async function handleSave() {
    setIsSaving(true);
    setStatus("idle");
    try {
      const updated = await updateSiteSettings({
        siteName,
        logoUrl,
        announcementText: announcementText.trim() === "" ? null : announcementText,
      });
      setUpdatedAt(updated.updatedAt);
      refresh(updated);
      setStatus("saved");
    } catch (err) {
      console.error("Failed to save site settings", err);
      setStatus("error");
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner label="Loading branding..." />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Branding</h1>
      <p className="mt-1 text-sm text-gray-500">
        Controls the site name, logo, and announcement strip shown across every page.
      </p>

      {updatedAt && (
        <p className="mt-1 text-sm text-gray-500">
          Last updated: {new Date(updatedAt).toLocaleString("en-ZA")}
        </p>
      )}

      <div className="mt-6 flex flex-col gap-6">
        <div>
          <label htmlFor="site-name" className="text-sm font-semibold text-gray-900">
            Site Name
          </label>
          <Input
            id="site-name"
            value={siteName}
            onChange={(e) => setSiteName(e.target.value)}
            className="mt-1.5 max-w-sm"
          />
        </div>

        <div>
          <span className="text-sm font-semibold text-gray-900">Logo</span>
          <p className="mt-1 text-sm text-gray-500">
            Leave empty to use the generated initial badge instead.
          </p>
          <div className="mt-2">
            <SingleImageUpload imageUrl={logoUrl} onChange={setLogoUrl} uploadFn={uploadSiteLogo} />
          </div>
        </div>

        <div>
          <label htmlFor="announcement-text" className="text-sm font-semibold text-gray-900">
            Announcement Strip
          </label>
          <p className="mt-1 text-sm text-gray-500">
            Shown at the top of every page. Leave empty to hide it.
          </p>
          <Input
            id="announcement-text"
            value={announcementText}
            onChange={(e) => setAnnouncementText(e.target.value)}
            placeholder="e.g. FREE SHIPPING ON ORDERS OVER R1000!"
            className="mt-1.5"
          />
        </div>

        <div className="flex items-center gap-3">
          <Button type="button" isLoading={isSaving} onClick={handleSave}>
            Save Changes
          </Button>
          {status === "saved" && <span className="text-sm text-success-500">Saved.</span>}
          {status === "error" && (
            <span className="text-sm text-danger-500">Failed to save. Please try again.</span>
          )}
        </div>
      </div>
    </div>
  );
}
