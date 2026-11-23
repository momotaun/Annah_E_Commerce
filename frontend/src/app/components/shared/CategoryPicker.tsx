"use client";

import type { Category } from "@/src/lib/api-types";
import { getCategoryPath, findCategoryById } from "@/src/lib/categoryTree";
import Select from "@/src/app/components/ui/Select";

interface CategoryPickerProps {
  categories: Category[];
  value: string;
  onChange: (categoryId: string) => void;
  disabled?: boolean;
  error?: string;
}

export default function CategoryPicker({
  categories,
  value,
  onChange,
  disabled = false,
  error,
}: CategoryPickerProps) {
  const selectedCategory = value ? findCategoryById(categories, value) : undefined;
  const path = selectedCategory
    ? getCategoryPath(categories, selectedCategory.slug)
    : [];
  const levels: { depth: number; options: Category[]; selected?: Category }[] = [];
  let options = categories;
  let depth = 0;

  while (options.length > 0) {
    const selected = path[depth];
    levels.push({ depth, options, selected });
    if (!selected) break;
    options = selected.children;
    depth++;
  }

  return (
    <div className="flex flex-col gap-4">
      {levels.map((level, index) => {
        const parent = level.depth > 0 ? path[level.depth - 1] : undefined;
        const label = parent ? `Subcategory of ${parent.name}` : "Category";
        const id = `category-level-${level.depth}`;
        return (
          <div key={id}>
            <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-gray-900">
              {label}
            </label>
            <Select
              id={id}
              placeholder={level.depth === 0 ? "Select a category" : "Select a subcategory"}
              value={level.selected?.id ?? ""}
              disabled={disabled}
              error={index === levels.length - 1 ? error : undefined}
              onChange={(event) => onChange(event.target.value)}
              options={level.options.map((category) => ({
                label: category.name,
                value: category.id,
              }))}
            />
          </div>
        );
      })}
    </div>
  );
}
