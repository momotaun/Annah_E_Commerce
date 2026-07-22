"use client";

import { useState } from "react";
import Header from "@/src/app/components/layout/Header";
import Footer from "@/src/app/components/layout/Footer";
import FilterSidebar from "@/src/app/components/shared/FilterSidebar";
import SearchBar from "@/src/app/components/shared/SearchBar";
import ProductCard from "@/src/app/components/shared/ProductCard";
import Select from "@/src/app/components/ui/Select";
import Spinner from "@/src/app/components/ui/Spinner";

const categories = [
  { label: "Electronics", value: "electronics" },
  { label: "Computing", value: "computing" },
  { label: "Smart Home", value: "smart-home" },
  { label: "Audio Visual", value: "audio-visual" },
];

const brands = [
  { label: "Apple", value: "apple" },
  { label: "Samsung", value: "samsung" },
  { label: "Dell", value: "dell" },
  { label: "HP", value: "hp" },
  { label: "Lenovo", value: "lenovo" },
];

const swatchColors = ["#111827", "#9CA3AF", "#2563EB", "#F3F4F6", "#EF4444"];

const products = [
  { title: "Apex ProBook M3 Max", category: "Laptops", price: "R2,499.00", rating: 4.9, reviewCount: 124, image: "/images/probook.jpg" },
  { title: "SonicMaster Elite G2", category: "Audio", price: "R349.00", rating: 4.8, reviewCount: 89, image: "/images/headphones2.jpg" },
  { title: "Pulse Watch Series 9", category: "Wearables", price: "R499.00", rating: 4.7, reviewCount: 210, image: "/images/watch2.jpg" },
  { title: "Tactile Cloud RGB", category: "Peripherals", price: "R189.00", rating: 5.0, reviewCount: 45, image: "/images/keyboard2.jpg" },
  { title: "Horizon 34\" Ultrawide", category: "Displays", price: "R899.00", rating: 4.6, reviewCount: 67, image: "/images/monitor.jpg" },
  { title: "Vision X100 Mirrorless", category: "Cameras", price: "R3,199.00", rating: 4.9, reviewCount: 0, image: "/images/camera2.jpg" },
  { title: "Canvas Pro 13", category: "Tablets", price: "R1,149.00", rating: 4.8, reviewCount: 0, image: "/images/tablet.jpg" },
  { title: "RuggedBox Mini", category: "Audio", price: "R129.00", rating: 4.5, reviewCount: 0, image: "/images/speaker.jpg" },
];

export default function CataloguePage() {
  const [selectedCategories, setSelectedCategories] = useState<string[]>(["computing"]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);

  function toggleCategory(value: string, checked: boolean) {
    setSelectedCategories((prev) =>
      checked ? [...prev, value] : prev.filter((v) => v !== value)
    );
  }

  function toggleBrand(value: string, checked: boolean) {
    setSelectedBrands((prev) =>
      checked ? [...prev, value] : prev.filter((v) => v !== value)
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header showSearch cartCount={0} />

      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-8 px-6 py-10 md:flex-row">
        <FilterSidebar
          categories={categories}
          brands={brands}
          colors={swatchColors}
          selectedCategories={selectedCategories}
          selectedBrands={selectedBrands}
          onCategoryChange={toggleCategory}
          onBrandChange={toggleBrand}
        />

        <div className="flex-1">
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <SearchBar placeholder="Search products..." className="sm:max-w-sm" />
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">Sort by:</span>
              <Select
                options={[
                  { label: "Newest Arrivals", value: "newest" },
                  { label: "Price: Low to High", value: "price-asc" },
                  { label: "Price: High to Low", value: "price-desc" },
                  { label: "Top Rated", value: "rating" },
                ]}
                className="w-48"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {products.map((product) => (
              <ProductCard
                key={product.title}
                href={`/products/${product.title.toLowerCase().replace(/\s+/g, "-")}`}
                image={product.image}
                title={product.title}
                category={product.category}
                price={product.price}
                rating={product.rating}
                reviewCount={product.reviewCount || undefined}
                showWishlist
                showQuickView
              />
            ))}
          </div>

          <div className="mt-10 flex justify-center">
            <Spinner label="Loading more premium products..." />
          </div>
        </div>
      </main>

      <Footer
        brandBlurb="Elevating your digital lifestyle with hand-picked premium technology and lifestyle products."
        columns={[
          { title: "Marketplace", links: [{ label: "Catalogue", href: "/catalogue" }, { label: "Latest Deals", href: "/deals" }, { label: "Gift Cards", href: "/gift-cards" }, { label: "Membership", href: "/membership" }] },
          { title: "Support", links: [{ label: "Shipping Policy", href: "/shipping" }, { label: "Returns & Refunds", href: "/returns" }, { label: "Privacy Policy", href: "/privacy" }, { label: "Terms of Service", href: "/terms" }] },
        ]}
        showNewsletter
      />
    </div>
  );
}