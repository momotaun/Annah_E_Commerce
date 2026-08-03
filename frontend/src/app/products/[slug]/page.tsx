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

const galleryImages = [
  "/images/probook-1.jpg",
  "/images/probook-2.jpg",
  "/images/probook-3.jpg",
  "/images/probook-4.jpg",
];

const colors = ["#1F2937", "#E5E7EB", "#000000"];
const storageOptions = ["1TB SSD", "2TB SSD"];

const relatedProducts = [
  { title: "Apex Vision Pro 32\"", price: "R22,500", image: "/images/monitor2.jpg" },
  { title: "Apex Sound-X Max", price: "R8,999", image: "/images/speaker2.jpg" },
  { title: "Apex Type-S Keyboard", price: "R3,499", image: "/images/keyboard4.jpg" },
  { title: "Apex FastDrive 4TB", price: "R7,200", image: "/images/drive.jpg" },
];

export default function ProductDetailsPage({
  params,
}: {
  params: { slug: string };
}) {
  const { addItem } = useCart();

  const [selectedColor, setSelectedColor] = useState(colors[0]);
  const [selectedStorage, setSelectedStorage] = useState(storageOptions[0]);
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);

  // TODO (next pass): fetch real product data via getProduct(params.slug)
  // instead of the hardcoded values below. Left as-is for this step since
  // the focus here is wiring Add to Cart, not the data-fetching pass.
  const productId = "REPLACE_WITH_REAL_PRODUCT_ID"; // placeholder until real fetch is wired

  async function handleAddToCart() {
    setIsAdding(true);
    try {
      await addItem(productId, quantity);
    } catch (err) {
      console.error("Failed to add to cart", err);
      // TODO: surface a toast/error state to the user
    } finally {
      setIsAdding(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header showSearch />

      <main className="mx-auto w-full max-w-7xl flex-1 px-6 py-6">
        <Breadcrumb
          items={[
            { label: "Catalogue", href: "/catalogue" },
            { label: "Computing", href: "/categories/computing" },
            { label: "Apex ProBook M3 Max" },
          ]}
        />

        <div className="mt-6 grid grid-cols-1 gap-10 lg:grid-cols-2">
          <ProductGallery images={galleryImages} alt="Apex ProBook M3 Max" />

          <div>
            <Badge variant="primary">Premium Hardware</Badge>
            <h1 className="mt-3 text-3xl font-bold text-gray-900">
              Apex ProBook M3 Max
            </h1>
            <div className="mt-2">
              <RatingStars rating={4.9} reviewCount={124} />
            </div>

            <div className="mt-4 border-t border-gray-200 pt-4">
              <span className="text-3xl font-bold text-primary-600">R45,999</span>
              <p className="mt-1 text-sm text-gray-500">
                Available in installments from R3,200/mo
              </p>
            </div>

            <div className="mt-6">
              <span className="text-sm font-semibold text-gray-900">
                Color: {selectedColor === colors[0] ? "Space Grey" : ""}
              </span>
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
              <span className="text-sm font-semibold text-gray-900">
                Storage Capacity
              </span>
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
                content: <DescriptionTab />,
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

        <section className="mt-16">
          <div className="mb-6 flex items-end justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Customers also viewed</h2>
              <p className="text-sm text-gray-500">
                Recommended pairings and similar high-end workstations.
              </p>
            </div>
            <a href="#" className="text-sm font-medium text-primary-600 hover:underline">
              View All →
            </a>
          </div>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {relatedProducts.map((p) => (
              <ProductCard
                key={p.title}
                href="#"
                image={p.image}
                title={p.title}
                price={p.price}
              />
            ))}
          </div>
        </section>
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

function DescriptionTab() {
  const features = [
    "M3 Max Silicon with 16-core CPU",
    "40-core GPU for high-end creative workflows",
    "Up to 22 hours of sustainable battery life",
  ];

  return (
    <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
      <div>
        <h3 className="text-xl font-bold text-gray-900">Peak Performance Redefined</h3>
        <p className="mt-3 text-sm text-gray-500">
          The Apex ProBook M3 Max is engineered for professionals who demand
          the absolute best. Powered by the next-generation architectural
          breakthrough, it delivers up to 4x faster rendering and 2x more
          power efficiency than its predecessor.
        </p>
        <ul className="mt-4 flex flex-col gap-2">
          {features.map((f) => (
            <li key={f} className="flex items-start gap-2 text-sm text-gray-900">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary-600" />
              {f}
            </li>
          ))}
        </ul>
      </div>
      <div className="relative aspect-square overflow-hidden rounded-md bg-gray-100">
        {/* secondary lifestyle image placeholder */}
      </div>
    </div>
  );
}

function ReviewsSection() {
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
                <div
                  className="h-full rounded-full bg-warning-500"
                  style={{ width: `${row.percent}%` }}
                />
              </div>
              <span className="w-8 text-xs text-gray-500">{row.percent}%</span>
            </div>
          ))}
        </div>
      </div>

      <div className="relative mt-8 grid grid-cols-1 gap-4 blur-sm sm:grid-cols-2">
        <div className="rounded-md border border-gray-200 p-4">
          <p className="text-sm font-semibold text-gray-900">Sarah J.</p>
          <p className="mt-1 text-sm text-gray-500">
            The performance is unmatched. As a video editor, the M3 Max has
            cut my rendering times in half.
          </p>
        </div>
        <div className="rounded-md border border-gray-200 p-4">
          <p className="text-sm font-semibold text-gray-900">Michael R.</p>
          <p className="mt-1 text-sm text-gray-500">
            Incredible build quality. The display is the best I&apos;ve ever
            seen on a laptop.
          </p>
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
