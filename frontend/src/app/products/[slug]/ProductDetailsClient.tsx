"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Heart, Star, Store } from "lucide-react";
import Header from "@/src/app/components/layout/Header";
import Footer from "@/src/app/components/layout/Footer";
import Breadcrumb from "@/src/app/components/shared/Breadcrumb";
import ProductGallery from "@/src/app/components/shared/ProductGallery";
import ProductCard from "@/src/app/components/shared/ProductCard";
import RatingStars from "@/src/app/components/ui/RatingStars";
import ColorSwatch from "@/src/app/components/ui/ColorSwatch";
import PillOption from "@/src/app/components/ui/PillOption";
import Stepper from "@/src/app/components/ui/Stepper";
import Button from "@/src/app/components/ui/Button";
import Textarea from "@/src/app/components/ui/Textarea";
import Tabs from "@/src/app/components/ui/Tabs";
import Spinner from "@/src/app/components/ui/Spinner";
import { useCart } from "@/src/context/CartContext";
import { useWishlist } from "@/src/context/WishlistContext";
import { useAuth } from "@/src/context/AuthContext";
import { withLoginRedirect } from "@/src/lib/loginRedirect";
import { Product } from "@/src/lib/api-types";
import { formatPrice, cn } from "@/src/lib/utils";
import {
  getProductReviews,
  submitProductReview,
  ProductReviewsResponse,
} from "@/src/lib/api/reviews";

// Color/secondary options aren't wired to real per-product data on this
// page yet — kept as static, cosmetic-only selectors for now. Selecting
// them does not change price, sku, or what gets added to cart. The store
// admin side (vendor product forms) does manage real per-category options
// now — see lib/product-option-types.ts — this page just doesn't consume
// them, beyond picking the right label/example values for the category
// below (Fashion gets Size, everything else keeps Storage Capacity).
const colors = ["#1F2937", "#E5E7EB", "#000000"];
const sizeOptions = ["S", "M", "L", "XL"];
const storageOptions = ["1TB SSD", "2TB SSD"];

// No Review or Order-line-item-count model exists yet, so review/sold
// counts have no real backing data — same convention as ProductCard's
// mockRating: a stable per-product number seeded from the slug (so it
// never shifts between renders) rather than a random placeholder.
function mockEngagementCounts(seed: string): { reviewCount: number; soldCount: number } {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return {
    reviewCount: 8 + (hash % 250), // 8 – 257
    soldCount: 12 + (hash % 600), // 12 – 611
  };
}

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
  const { isWishlisted, toggleWishlist } = useWishlist();

  const isFashion = categoryName.trim().toLowerCase() === "fashion";
  const secondaryLabel = isFashion ? "Size" : "Storage Capacity";
  const secondaryOptions = isFashion ? sizeOptions : storageOptions;

  const [selectedColor, setSelectedColor] = useState(colors[0]);
  const [selectedSecondary, setSelectedSecondary] = useState(secondaryOptions[0]);
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);

  const { reviewCount, soldCount } = mockEngagementCounts(product.slug);
  const displayRating = product.averageRating ? Number(product.averageRating) : 4.5;

  const price = Number(product.price);
  const compareAtPrice = product.compareAtPrice ? Number(product.compareAtPrice) : null;
  const isOnSale = compareAtPrice !== null && compareAtPrice > price;
  const discountPercent = isOnSale
    ? Math.round(((compareAtPrice! - price) / compareAtPrice!) * 100)
    : null;

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

  const galleryImages =
    product.images.length > 0
      ? product.images
      : product.imageUrl
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
            {product.vendor && (
              <Link
                href={`/vendors/${product.vendor.id}`}
                className="group inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-primary-600"
              >
                <Store className="h-4 w-4" />
                <span className="font-semibold text-gray-900 group-hover:text-primary-600 group-hover:underline">
                  {product.vendor.businessName}
                </span>
              </Link>
            )}

            <h1 className="mt-2 text-3xl font-bold text-gray-900">{product.name}</h1>

            {/* averageRating is real (seeded per product); review and
                sold counts have no backing model yet, so — same convention
                as ProductCard's mockRating — they're a stable per-product
                mock derived from the slug rather than faked with random
                numbers that would shift on every render. */}
            <div className="mt-2 flex items-center gap-2">
              <RatingStars rating={displayRating} showCount={false} size="sm" />
              <span className="text-sm text-gray-500">
                ({reviewCount} reviews) | {soldCount} sold
              </span>
            </div>

            <div className="mt-4 flex flex-wrap items-end gap-8">
              <span className="text-3xl font-bold text-primary-600">
                {formatPrice(product.price)}
              </span>
              {isOnSale && (
                <>
                  <span className="text-lg text-gray-400 line-through">
                    {formatPrice(product.compareAtPrice!)}
                  </span>
                  <span className="inline-flex items-center justify-center rounded-full bg-danger-500 px-2.5 py-1 text-xs font-semibold text-white">
                    {discountPercent}% off
                  </span>
                </>
              )}
            </div>

            <hr className="mt-4 border-gray-200" />

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
              <span className="text-sm font-semibold text-gray-900">{secondaryLabel}</span>
              <div className="mt-2 flex gap-3">
                {secondaryOptions.map((option) => (
                  <PillOption
                    key={option}
                    label={option}
                    selected={selectedSecondary === option}
                    onClick={() => setSelectedSecondary(option)}
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

            <Button
              variant="ghost"
              fullWidth
              className="mt-3"
              onClick={() => toggleWishlist(product.id)}
              icon={
                <Heart
                  className={cn("h-4 w-4", isWishlisted(product.id) && "fill-current text-danger-500")}
                />
              }
            >
              {isWishlisted(product.id) ? "Remove from Wishlist" : "Add to Wishlist"}
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

        <ReviewsSection productId={product.id} />

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
                  href={`/products/${p.slug}`}
                  image={p.imageUrl ?? "/images/placeholder-product.jpg"}
                  title={p.name}
                  vendor={p.vendor}
                  price={formatPrice(p.price)}
                  showWishlist
                  isWishlisted={isWishlisted(p.id)}
                  onToggleWishlist={() => toggleWishlist(p.id)}
                />
              ))}
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}

function StarRatingInput({ value, onChange }: { value: number; onChange: (value: number) => void }) {
  const [hovered, setHovered] = useState(0);

  return (
    <div className="flex items-center gap-1" onMouseLeave={() => setHovered(0)}>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          aria-label={`${star} star${star === 1 ? "" : "s"}`}
          onMouseEnter={() => setHovered(star)}
          onClick={() => onChange(star)}
          className="p-0.5"
        >
          <Star
            className={cn(
              "h-6 w-6 transition-colors",
              star <= (hovered || value)
                ? "fill-warning-500 text-warning-500"
                : "fill-gray-100 text-gray-200"
            )}
          />
        </button>
      ))}
    </div>
  );
}

function ReviewsSection({ productId }: { productId: string }) {
  const { user } = useAuth();
  const pathname = usePathname();

  const [data, setData] = useState<ProductReviewsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formRating, setFormRating] = useState(0);
  const [formComment, setFormComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    getProductReviews(productId)
      .then((result) => {
        if (!cancelled) setData(result);
      })
      .catch(() => {
        if (!cancelled) setData(null);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [productId]);

  async function handleSubmitReview() {
    if (formRating < 1) {
      setSubmitError("Choose a star rating before submitting.");
      return;
    }
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      await submitProductReview(productId, {
        rating: formRating,
        comment: formComment.trim() || undefined,
      });
      const refreshed = await getProductReviews(productId);
      setData(refreshed);
      setIsFormOpen(false);
      setFormRating(0);
      setFormComment("");
    } catch {
      setSubmitError("Couldn't submit your review. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  const summary = data?.summary ?? { average: 0, count: 0, breakdown: [] };
  const reviews = data?.reviews ?? [];

  return (
    <section className="mt-16">
      <div className="flex items-start justify-between">
        <h2 className="text-xl font-bold text-gray-900">Customer Reviews</h2>
        {user ? (
          <Button variant="outline" size="sm" onClick={() => setIsFormOpen((open) => !open)}>
            Write a Review
          </Button>
        ) : (
          <Button variant="outline" size="sm" href={withLoginRedirect(pathname)}>
            Log in to Write a Review
          </Button>
        )}
      </div>

      {isFormOpen && (
        <div className="mt-4 rounded-md border border-gray-200 bg-gray-50 p-4">
          <span className="text-sm font-semibold text-gray-900">Your rating</span>
          <div className="mt-2">
            <StarRatingInput value={formRating} onChange={setFormRating} />
          </div>
          <div className="mt-3">
            <Textarea
              placeholder="Share your thoughts about this product... (optional)"
              value={formComment}
              onChange={(e) => setFormComment(e.target.value)}
            />
          </div>
          {submitError && <p className="mt-2 text-sm text-danger-500">{submitError}</p>}
          <div className="mt-3 flex items-center gap-3">
            <Button size="sm" isLoading={isSubmitting} onClick={handleSubmitReview}>
              Submit Review
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setIsFormOpen(false)}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center py-10">
          <Spinner label="Loading reviews..." />
        </div>
      ) : summary.count === 0 ? (
        <p className="mt-6 text-sm text-gray-500">
          No reviews yet — be the first to share your thoughts on this product.
        </p>
      ) : (
        <>
          <div className="mt-6 flex flex-col gap-8 sm:flex-row">
            <div className="flex flex-col items-center gap-1 sm:w-40">
              <span className="text-4xl font-bold text-gray-900">{summary.average.toFixed(1)}</span>
              <RatingStars rating={summary.average} showValue={false} showCount={false} size="md" />
              <span className="text-xs text-gray-500">
                Based on {summary.count} review{summary.count === 1 ? "" : "s"}
              </span>
            </div>

            <div className="flex-1 space-y-2">
              {summary.breakdown.map((row) => (
                <div key={row.rating} className="flex items-center gap-3">
                  <span className="w-10 text-xs text-gray-500">{row.rating} star</span>
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-gray-100">
                    <div className="h-full rounded-full bg-warning-500" style={{ width: `${row.percent}%` }} />
                  </div>
                  <span className="w-8 text-xs text-gray-500">{row.percent}%</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-6">
            {reviews.map((review) => (
              <div key={review.id} className="border-t border-gray-200 pt-6 first:border-t-0 first:pt-0">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-gray-900">{review.reviewerName}</span>
                  <span className="text-xs text-gray-500">
                    {new Date(review.createdAt).toLocaleDateString("en-ZA", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </div>
                <RatingStars rating={review.rating} showValue={false} showCount={false} size="sm" className="mt-1" />
                {review.comment && <p className="mt-2 text-sm text-gray-500">{review.comment}</p>}
              </div>
            ))}
          </div>
        </>
      )}
    </section>
  );
}