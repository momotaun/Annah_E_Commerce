"use client";

import { useEffect, useState } from "react";
import { ChevronDown, ChevronUp, Plus, Trash2 } from "lucide-react";
import Spinner from "@/src/app/components/ui/Spinner";
import Input from "@/src/app/components/ui/Input";
import Button from "@/src/app/components/ui/Button";
import SingleImageUpload from "@/src/app/components/shared/SingleImageUpload";
import {
  getHeroSlides,
  createHeroSlide,
  updateHeroSlide,
  deleteHeroSlide,
  reorderHeroSlides,
  uploadHeroSlideImage,
  HeroSlide,
  HeroSlideInput,
} from "@/src/lib/api/hero-slides";

const BLANK_SLIDE: HeroSlideInput = {
  eyebrow: "",
  headlineBefore: "",
  highlight: "",
  headlineAfter: "",
  subheading: "",
  imageUrl: "",
  ctaLabel: "Shop Now",
  ctaHref: "/catalogue",
  badgeValue: "",
  badgeCaption: "",
  categorySlug: null,
};

// A saved slide from the API, or a locally-added one that hasn't been
// POSTed yet — both render through the same card, but only a saved slide
// has an `id`/`order` to reorder or delete by.
type EditableSlide = HeroSlide | (HeroSlideInput & { id: null });

export default function BannersPage() {
  const [slides, setSlides] = useState<EditableSlide[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [savingIndex, setSavingIndex] = useState<number | null>(null);
  const [statusByIndex, setStatusByIndex] = useState<Record<number, "saved" | "error" | undefined>>({});
  const [isReordering, setIsReordering] = useState(false);

  useEffect(() => {
    getHeroSlides()
      .then(setSlides)
      .finally(() => setIsLoading(false));
  }, []);

  function updateField(index: number, field: keyof HeroSlideInput, value: string) {
    setSlides((prev) =>
      prev.map((slide, i) =>
        i === index ? { ...slide, [field]: field === "categorySlug" && value === "" ? null : value } : slide
      )
    );
  }

  function updateImage(index: number, imageUrl: string | null) {
    setSlides((prev) =>
      prev.map((slide, i) => (i === index ? { ...slide, imageUrl: imageUrl ?? "" } : slide))
    );
  }

  function addSlide() {
    setSlides((prev) => [...prev, { ...BLANK_SLIDE, id: null }]);
  }

  async function saveSlide(index: number) {
    const slide = slides[index];
    setSavingIndex(index);
    setStatusByIndex((prev) => ({ ...prev, [index]: undefined }));
    try {
      const input: HeroSlideInput = {
        eyebrow: slide.eyebrow,
        headlineBefore: slide.headlineBefore,
        highlight: slide.highlight,
        headlineAfter: slide.headlineAfter,
        subheading: slide.subheading,
        imageUrl: slide.imageUrl,
        ctaLabel: slide.ctaLabel,
        ctaHref: slide.ctaHref,
        badgeValue: slide.badgeValue,
        badgeCaption: slide.badgeCaption,
        categorySlug: slide.categorySlug,
      };
      const saved = slide.id ? await updateHeroSlide(slide.id, input) : await createHeroSlide(input);
      setSlides((prev) => prev.map((s, i) => (i === index ? saved : s)));
      setStatusByIndex((prev) => ({ ...prev, [index]: "saved" }));
    } catch (err) {
      console.error("Failed to save hero slide", err);
      setStatusByIndex((prev) => ({ ...prev, [index]: "error" }));
    } finally {
      setSavingIndex(null);
    }
  }

  async function removeSlide(index: number) {
    const slide = slides[index];
    if (!window.confirm("Delete this slide? This can't be undone.")) return;

    if (!slide.id) {
      setSlides((prev) => prev.filter((_, i) => i !== index));
      return;
    }

    try {
      await deleteHeroSlide(slide.id);
      setSlides((prev) => prev.filter((_, i) => i !== index));
    } catch (err) {
      console.error("Failed to delete hero slide", err);
    }
  }

  async function moveSlide(index: number, direction: -1 | 1) {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= slides.length) return;

    const reordered = [...slides];
    [reordered[index], reordered[targetIndex]] = [reordered[targetIndex], reordered[index]];
    setSlides(reordered);

    const savedIds = reordered.map((s) => s.id).filter((id): id is string => id !== null);
    if (savedIds.length === 0) return;

    setIsReordering(true);
    try {
      const updated = await reorderHeroSlides(savedIds);
      // Preserve any not-yet-saved local cards in their current position;
      // only the saved slides actually moved server-side.
      setSlides((prev) => {
        const updatedById = new Map(updated.map((s) => [s.id, s]));
        return prev.map((s) => (s.id && updatedById.has(s.id) ? updatedById.get(s.id)! : s));
      });
    } catch (err) {
      console.error("Failed to reorder hero slides", err);
    } finally {
      setIsReordering(false);
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner label="Loading banners..." />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Banners</h1>
      <p className="mt-1 text-sm text-gray-500">
        Controls the homepage hero carousel. Slides are shown in the order below.
      </p>

      <div className="mt-6 flex flex-col gap-4">
        {slides.map((slide, index) => (
          <div key={slide.id ?? `new-${index}`} className="rounded-md border border-gray-200 bg-white p-4">
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm font-semibold text-gray-900">
                Slide {index + 1}
                {!slide.id && <span className="ml-2 text-gray-400">(unsaved)</span>}
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => moveSlide(index, -1)}
                  disabled={index === 0 || isReordering}
                  aria-label="Move slide up"
                  className="rounded-md p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-900 disabled:cursor-not-allowed disabled:opacity-30"
                >
                  <ChevronUp className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => moveSlide(index, 1)}
                  disabled={index === slides.length - 1 || isReordering}
                  aria-label="Move slide down"
                  className="rounded-md p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-900 disabled:cursor-not-allowed disabled:opacity-30"
                >
                  <ChevronDown className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => removeSlide(index)}
                  aria-label={`Remove slide ${index + 1}`}
                  className="ml-2 text-gray-400 hover:text-danger-500"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field label="Eyebrow" value={slide.eyebrow} onChange={(v) => updateField(index, "eyebrow", v)} />
              <Field label="Badge Value" value={slide.badgeValue} onChange={(v) => updateField(index, "badgeValue", v)} placeholder="e.g. 30%" />
              <Field label="Headline (before highlight)" value={slide.headlineBefore} onChange={(v) => updateField(index, "headlineBefore", v)} />
              <Field label="Highlight" value={slide.highlight} onChange={(v) => updateField(index, "highlight", v)} />
              <Field label="Headline (after highlight)" value={slide.headlineAfter} onChange={(v) => updateField(index, "headlineAfter", v)} />
              <Field label="Badge Caption" value={slide.badgeCaption} onChange={(v) => updateField(index, "badgeCaption", v)} />
              <Field label="Subheading" value={slide.subheading} onChange={(v) => updateField(index, "subheading", v)} className="sm:col-span-2" />
              <Field label="CTA Label" value={slide.ctaLabel} onChange={(v) => updateField(index, "ctaLabel", v)} />
              <Field label="CTA Link" value={slide.ctaHref} onChange={(v) => updateField(index, "ctaHref", v)} placeholder="/catalogue" />
              <Field
                label="Category (optional, for colour theme)"
                value={slide.categorySlug ?? ""}
                onChange={(v) => updateField(index, "categorySlug", v)}
                placeholder="e.g. electronics"
              />
            </div>

            <div className="mt-3">
              <span className="text-sm font-semibold text-gray-900">Background Image</span>
              <div className="mt-2">
                <SingleImageUpload
                  imageUrl={slide.imageUrl || null}
                  onChange={(url) => updateImage(index, url)}
                  uploadFn={uploadHeroSlideImage}
                />
              </div>
            </div>

            <div className="mt-4 flex items-center gap-3">
              <Button type="button" isLoading={savingIndex === index} onClick={() => saveSlide(index)}>
                Save Slide
              </Button>
              {statusByIndex[index] === "saved" && <span className="text-sm text-success-500">Saved.</span>}
              {statusByIndex[index] === "error" && (
                <span className="text-sm text-danger-500">Failed to save. Please try again.</span>
              )}
            </div>
          </div>
        ))}

        <Button type="button" variant="outline" onClick={addSlide} icon={<Plus className="h-4 w-4" />}>
          Add Slide
        </Button>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  className,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <label className="text-xs font-medium text-gray-500">{label}</label>
      <Input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="mt-1" />
    </div>
  );
}
