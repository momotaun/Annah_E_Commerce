"use client";

import { useState } from "react";
import Image from "next/image";
import Header from "@/src/app/components/layout/Header";
import Footer from "@/src/app/components/layout/Footer";
import Breadcrumb from "@/src/app/components/shared/Breadcrumb";
import FilterSidebar from "@/src/app/components/shared/FilterSidebar";
import ProductCard from "@/src/app/components/shared/ProductCard";
import Select from "@/src/app/components/ui/Select";
import Spinner from "@/src/app/components/ui/Spinner";

const categories = [
  { label: "Laptops & PC", value: "laptops" },
  { label: "Smartphones", value: "smartphones" },
  { label: "Audio & Music", value: "audio" },
  { label: "Wearables", value: "wearables" },
];

const brands = [
  { label: "Apple", value: "apple" },
  { label: "Samsung", value: "samsung" },
  { label: "Dell", value: "dell" },
  { label: "Sony", value: "sony" },
];

const products = [
  { title: "Apex Air Pro 14", description: "M2 Chip, 16GB RAM, 512GB SSD. Midnight Black.", price: "R1,299.00", image: "/images/laptop.jpg", badge: { label: "Best Seller", variant: "primary" as const } },
  { title: "SonicPure H1", description: "Active Noise Cancellation, 40h Battery Life.", price: "R349.00", image: "/images/headphones3.jpg" },
  { title: "Zenith Phone X", description: "5G Enabled, 200MP Triple Camera, 120Hz Display.", price: "R999.00", image: "/images/phone2.jpg", badge: { label: "New Entry", variant: "warning" as const } },
  { title: "Tactile Pro K9", description: "Mechanical Brown Switches, Wireless/Wired.", price: "R189.00", image: "/images/keyboard3.jpg" },
  { title: "Orbit Watch 5", description: "Advanced Health Monitoring, LTE, 5-Day Battery.", price: "R429.00", image: "/images/watch3.jpg" },
  { title: "Lumina Mirrorless R7", description: "Full Frame, 45MP, 4K/120fps Video Recording.", price: "R2,499.00", image: "/images/camera3.jpg" },
];

export default function CategoryPage() {
  const [selectedCategories, setSelectedCategories] = useState<string[]>(["laptops"]);
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

      <main className="mx-auto w-full max-w-7xl flex-1 px-6 py-6">
        <Breadcrumb
          items={[
            { label: "Home", href: "/" },
            { label: "Catalogue", href: "/catalogue" },
            { label: "Electronics" },
          ]}
        />

        <section className="relative mt-4 flex min-h-[260px] items-center overflow-hidden rounded-md bg-gray-900">
          <Image src="/images/electronics-banner.jpg" alt="" fill className="object-cover opacity-70" />
          <div className="relative max-w-lg px-8 text-white">
            <h1 className="text-4xl font-extrabold">Electronics</h1>
            <p className="mt-3 text-sm text-gray-200">
              Experience the future with our curated collection of
              high-performance laptops, premium audio, and cutting-edge
              mobile devices. Precision engineered for professionals and
              tech enthusiasts.
            </p>
          </div>
        </section>

        <div className="mt-8 flex flex-col gap-8 md:flex-row">
          <FilterSidebar
            categories={categories}
            brands={brands}
            selectedCategories={selectedCategories}
            selectedBrands={selectedBrands}
            onCategoryChange={toggleCategory}
            onBrandChange={toggleBrand}
          />

          <div className="flex-1">
            <div className="mb-6 flex items-center justify-between">
              <span className="text-sm text-gray-500">Showing 24 of 148 products</span>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">Sort by:</span>
                <Select
                  options={[
                    { label: "Newest", value: "newest" },
                    { label: "Price: Low to High", value: "price-asc" },
                    { label: "Price: High to Low", value: "price-desc" },
                  ]}
                  className="w-40"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
              {products.map((product) => (
                <ProductCard
                  key={product.title}
                  href={`/products/${product.title.toLowerCase().replace(/\s+/g, "-")}`}
                  image={product.image}
                  title={product.title}
                  description={product.description}
                  price={product.price}
                  badge={product.badge}
                  onAddToCart={() => {}}
                />
              ))}
            </div>

            <div className="mt-10 flex justify-center">
              <Spinner label="Loading more premium products..." />
            </div>
          </div>
        </div>
      </main>

      <Footer
        brandBlurb="Your premier destination for the world's most advanced electronics and lifestyle technology. Experience premium service and unparalleled quality."
        columns={[
          { title: "Shop Categories", links: [{ label: "Laptops", href: "/categories/laptops" }, { label: "Smartphones", href: "/categories/smartphones" }, { label: "Audio Gear", href: "/categories/audio" }, { label: "Smart Home", href: "/categories/smart-home" }] },
          { title: "Company", links: [{ label: "About Us", href: "/about" }, { label: "Contact", href: "/contact" }, { label: "FAQ", href: "/faq" }, { label: "Terms of Service", href: "/terms" }] },
        ]}
      />
    </div>
  );
}