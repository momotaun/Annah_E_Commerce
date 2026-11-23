import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import CategoryPicker from "./CategoryPicker";
import type { Category } from "@/src/lib/api-types";

const categories: Category[] = [
  {
    id: "fashion",
    name: "Fashion",
    slug: "fashion",
    parentId: null,
    children: [
      {
        id: "women",
        name: "Women",
        slug: "women",
        parentId: "fashion",
        children: [
          {
            id: "women-shoes",
            name: "Shoes",
            slug: "women-shoes",
            parentId: "women",
            children: [
              {
                id: "women-shoes-size",
                name: "Size",
                slug: "women-shoes-size",
                parentId: "women-shoes",
                children: [],
              },
            ],
          },
        ],
      },
    ],
  },
];

describe("CategoryPicker", () => {
  it("reveals nested Fashion categories one level at a time", () => {
    const onChange = vi.fn();
    const { rerender } = render(
      <CategoryPicker categories={categories} value="" onChange={onChange} />,
    );

    fireEvent.change(screen.getByLabelText("Category"), {
      target: { value: "fashion" },
    });
    expect(onChange).toHaveBeenLastCalledWith("fashion");

    rerender(
      <CategoryPicker categories={categories} value="fashion" onChange={onChange} />,
    );
    fireEvent.change(screen.getByLabelText("Subcategory of Fashion"), {
      target: { value: "women" },
    });
    expect(onChange).toHaveBeenLastCalledWith("women");

    rerender(
      <CategoryPicker categories={categories} value="women-shoes-size" onChange={onChange} />,
    );
    expect(screen.getByLabelText("Category")).toHaveValue("fashion");
    expect(screen.getByLabelText("Subcategory of Fashion")).toHaveValue("women");
    expect(screen.getByLabelText("Subcategory of Women")).toHaveValue("women-shoes");
    expect(screen.getByLabelText("Subcategory of Shoes")).toHaveValue("women-shoes-size");
    expect(screen.getByRole("option", { name: "Size" })).toBeInTheDocument();
  });
});
