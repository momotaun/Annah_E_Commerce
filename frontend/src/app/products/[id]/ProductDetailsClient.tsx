"use client";

import { useState } from "react";
import { Heart, CheckCircle2, Lock } from "lucide-react";
import Header from "@/src/app/components/layout/Header";
import Footer from "@/src/app/components/layout/Footer";
import Breadcrumb from "@/src/app/components/shared/Breadcrumb";
import ProductGallery from "@/src/app/components/shared/ProductGallery";
import ProductCard from "@/src/app/components/shared/ProductCard";
import Badge from "@/src/app/components/ui/Badge";
import RatingStars from "@/src/app/components/ui/RatingStars";
import ColorSwatch from "@/src/app/components/ui/ColorSwatch";
import PillOption from "@/src/app/components/ui/PillOption";
import Stepper from "@/src/app/components/ui/Stepper";
import Button from "@/src/app/components/ui/Button";
import Tabs from "@/src/app/components/ui/Tabs";
import { useCart } from "@/src/context/CartContext";
import { Product } from "@/src/lib/api-types";

// Color/storage options aren't modeled in our backend schema at all yet
// (Product has no variant/option fields) — kept as static, cosmetic-only
// selectors for now. Selecting them does not change price, sku, or what
// gets added to cart. Flagging clearly: this is a known gap, not an
// intentional simplification of real variant logic.
const colors = ["#1F2937", "#E5E7EB", "#000000"];
const storageOptions = ["1TB SSD", "2TB SSD"];

interface ProductDetailsClientProps {
  product: Product;
  relatedProducts: Product[];
  categoryName: string;
}

export default function ProductDetailsClient({
  product,
  relatedProducts,
  categoryName,
}: ProductDetailsClientProps) {
  const { addItem } = useCart();

  const [selectedColor, setSelectedColor] = useState(colors[0]);
  const [selectedStorage, setSelectedStorage] = useState(storageOptions[0]);
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);

  async function handleAddToCart() {
    setIsAdding(true);
    setAddError(null);
    try {
      await addItem(product.id, quantity);
    } catch (err) {
      setAddError("Couldn't add this item to your cart. Please try again.");
      console.error("Failed to add to cart", err);
    } finally {
      setIsAdding(false);
    }
  }

  const galleryImages = product.imageUrl
    ? [product.imageUrl]
    : ["/images/placeholder-product.jpg"];

  return (
    <div className="flex min-h-screen flex-col">
      <Header showSearch />

      <main className="mx-auto w-full max-w-7xl flex-1 px-6 py-6">
        <Breadcrumb
          items={[
            { label: "Catalogue", href: "/catalogue" },
            { label: categoryName, href: "/categories" },
            { label: product.name },
          ]}
        />

        <div className="mt-6 grid grid-cols-1 gap-10 lg:grid-cols-2">
          <ProductGallery images={galleryImages} alt={product.name} />

          <div>
            <Badge variant="primary">Premium Hardware</Badge>
            <h1 className="mt-3 text-3xl font-bold text-gray-900">{product.name}</h1>

            {/* No rating/review data exists in our schema yet — Product has
                no relation to reviews anywhere in the SDD. Hidden rather
                than faking numbers. */}

            <div className="mt-4 border-t border-gray-200 pt-4">
              <span className="text-3xl font-bold text-primary-600">
                R{Number(product.price).toLocaleString("en-ZA", { minimumFractionDigits: 2 })}
              </span>
            </div>

            {product.description && (
              <p className="mt-4 text-sm text-gray-500">{product.description}</p>
            )}

            <div className="mt-6">
              <span className="text-sm font-semibold text-gray-900">Color</span>
              <div className="mt-2 flex gap-2">
                {colors.map((color) => (
                  <ColorSwatch
                    key={color}
                    color={color}
                    selected={selectedColor === color}
                    onClick={() => setSelectedColor(color)}
                  />
                ))}
              </div>
            </div>

            <div className="mt-6">
              <span className="text-sm font-semibold text-gray-900">Storage Capacity</span>
              <div className="mt-2 flex gap-3">
                {storageOptions.map((option) => (
                  <PillOption
                    key={option}
                    label={option}
                    selected={selectedStorage === option}
                    onClick={() => setSelectedStorage(option)}
                  />
                ))}
              </div>
            </div>

            <div className="mt-6 flex gap-4">
              <Stepper value={quantity} onChange={setQuantity} />
              <Button fullWidth isLoading={isAdding} onClick={handleAddToCart}>
                Add to Cart
              </Button>
            </div>

            {addError && (
              <p className="mt-2 text-sm text-danger-500">{addError}</p>
            )}

            <Button variant="ghost" fullWidth className="mt-3" icon={<Heart className="h-4 w-4" />}>
              Add to Wishlist
            </Button>
          </div>
        </div>

        <div className="mt-16">
          <Tabs
            defaultValue="description"
            tabs={[
              {
                value: "description",
                label: "Description",
                content: (
                  <p className="text-sm text-gray-500">
                    {product.description ?? "No description available for this product yet."}
                  </p>
                ),
              },
              {
                value: "specifications",
                label: "Specifications",
                content: <p className="text-sm text-gray-500">Specifications coming soon.</p>,
              },
              {
                value: "availability",
                label: "Availability",
                content: <p className="text-sm text-gray-500">In stock — ships within 2-3 business days.</p>,
              },
            ]}
          />
        </div>

        <ReviewsSection />

        {relatedProducts.length > 0 && (
          <section className="mt-16">
            <div className="mb-6 flex items-end justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Customers also viewed</h2>
                <p className="text-sm text-gray-500">
                  Recommended pairings and similar high-end workstations.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              {relatedProducts.map((p) => (
                <ProductCard
                  key={p.id}
                  href={`/products/${p.id}`}
                  image={p.imageUrl ?? "/images/placeholder-product.jpg"}
                  title={p.name}
                  price={`R${Number(p.price).toLocaleString("en-ZA", { minimumFractionDigits: 2 })}`}
                />
              ))}
            </div>
          </section>
        )}
      </main>

      <Footer
        brandBlurb="The definitive destination for premium computing and professional hardware. Engineered for the future."
        columns={[
          { title: "Shop", links: [{ label: "Catalogue", href: "/catalogue" }, { label: "Categories", href: "/categories" }, { label: "Shipping", href: "/shipping" }, { label: "Returns", href: "/returns" }] },
          { title: "Company", links: [{ label: "About", href: "/about" }, { label: "Contact", href: "/contact" }, { label: "FAQ", href: "/faq" }, { label: "Privacy Policy", href: "/privacy" }] },
        ]}
        showNewsletter
      />
    </div>
  );
}

function ReviewsSection() {
  // Entirely static/placeholder — no Review model exists in our schema.
  // Left in for visual parity with the Figma design, but this section
  // displays no real data whatsoever right now.
  const breakdown = [
    { stars: 5, percent: 92 },
    { stars: 4, percent: 6 },
    { stars: 3, percent: 2 },
  ];

  return (
    <section className="relative mt-16">
      <div className="flex items-start justify-between">
        <h2 className="text-xl font-bold text-gray-900">Customer Reviews</h2>
        <Button variant="outline" size="sm">Write a Review</Button>
      </div>

      <div className="mt-6 flex flex-col gap-8 sm:flex-row">
        <div className="flex flex-col items-center gap-1 sm:w-40">
          <span className="text-4xl font-bold text-gray-900">4.9</span>
          <RatingStars rating={4.9} showValue={false} showCount={false} size="md" />
          <span className="text-xs text-gray-500">Based on 124 reviews</span>
        </div>

        <div className="flex-1 space-y-2">
          {breakdown.map((row) => (
            <div key={row.stars} className="flex items-center gap-3">
              <span className="w-10 text-xs text-gray-500">{row.stars} star</span>
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-gray-100">
                <div className="h-full rounded-full bg-warning-500" style={{ width: `${row.percent}%` }} />
              </div>
              <span className="w-8 text-xs text-gray-500">{row.percent}%</span>
            </div>
          ))}
        </div>
      </div>

      <div className="absolute inset-x-0 top-1/2 flex -translate-y-1/2 justify-center">
        <span className="flex items-center gap-2 rounded-full bg-gray-900/90 px-4 py-2 text-sm font-medium text-white">
          <Lock className="h-4 w-4" />
          Reviews Coming Soon
        </span>
      </div>
    </section>
  );
}