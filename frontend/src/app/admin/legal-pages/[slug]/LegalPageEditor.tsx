"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import Spinner from "@/src/app/components/ui/Spinner";
import Input from "@/src/app/components/ui/Input";
import Textarea from "@/src/app/components/ui/Textarea";
import Button from "@/src/app/components/ui/Button";
import { getLegalPage, updateLegalPage, LegalPageSection } from "@/src/lib/api/legal-pages";

interface LegalPageEditorProps {
  slug: string;
}

export default function LegalPageEditor({ slug }: LegalPageEditorProps) {
  const [title, setTitle] = useState("");
  const [sections, setSections] = useState<LegalPageSection[]>([]);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [status, setStatus] = useState<"idle" | "saved" | "error">("idle");

  useEffect(() => {
    getLegalPage(slug)
      .then((page) => {
        setTitle(page.title);
        setSections(page.sections);
        setUpdatedAt(page.updatedAt);
      })
      .finally(() => setIsLoading(false));
  }, [slug]);

  function updateSection(index: number, field: keyof LegalPageSection, value: string) {
    setSections((prev) =>
      prev.map((section, i) => (i === index ? { ...section, [field]: value } : section))
    );
  }

  function addSection() {
    setSections((prev) => [...prev, { title: "", body: "" }]);
  }

  function removeSection(index: number) {
    setSections((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSave() {
    setIsSaving(true);
    setStatus("idle");
    try {
      const updated = await updateLegalPage(slug, { title, sections });
      setUpdatedAt(updated.updatedAt);
      setStatus("saved");
    } catch (err) {
      console.error("Failed to save legal page", err);
      setStatus("error");
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner label="Loading page content..." />
      </div>
    );
  }

  return (
    <div>
      <Link
        href="/admin/legal-pages"
        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-primary-600"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Legal Pages
      </Link>

      <div className="mt-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Edit {title || slug}</h1>
        <Link href={`/${slug}`} target="_blank" className="text-sm text-primary-600 hover:underline">
          View live page
        </Link>
      </div>

      {updatedAt && (
        <p className="mt-1 text-sm text-gray-500">
          Last updated: {new Date(updatedAt).toLocaleString("en-ZA")}
        </p>
      )}

      <div className="mt-6 flex flex-col gap-6">
        <div>
          <label htmlFor="page-title" className="text-sm font-semibold text-gray-900">
            Page Title
          </label>
          <Input
            id="page-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-1.5"
          />
        </div>

        <div className="flex flex-col gap-4">
          {sections.map((section, index) => (
            <div key={index} className="rounded-md border border-gray-200 bg-white p-4">
              <div className="flex items-center justify-between gap-3">
                <label
                  htmlFor={`section-title-${index}`}
                  className="text-sm font-semibold text-gray-900"
                >
                  Section {index + 1}
                </label>
                <button
                  type="button"
                  onClick={() => removeSection(index)}
                  aria-label={`Remove section ${index + 1}`}
                  className="text-gray-400 hover:text-danger-500"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              <Input
                id={`section-title-${index}`}
                placeholder="Section title"
                value={section.title}
                onChange={(e) => updateSection(index, "title", e.target.value)}
                className="mt-2"
              />
              <Textarea
                placeholder="Section body"
                value={section.body}
                onChange={(e) => updateSection(index, "body", e.target.value)}
                className="mt-2"
                rows={4}
              />
            </div>
          ))}

          <Button
            type="button"
            variant="outline"
            onClick={addSection}
            icon={<Plus className="h-4 w-4" />}
          >
            Add Section
          </Button>
        </div>

        <div className="flex items-center gap-3">
          <Button type="button" isLoading={isSaving} onClick={handleSave}>
            Save Changes
          </Button>
          {status === "saved" && (
            <span className="text-sm text-success-500">Saved.</span>
          )}
          {status === "error" && (
            <span className="text-sm text-danger-500">Failed to save. Please try again.</span>
          )}
        </div>
      </div>
    </div>
  );
}
