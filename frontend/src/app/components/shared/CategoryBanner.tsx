import Image from "next/image";

export interface CategoryBannerProps {
  name: string;
  productCount: number;
  image?: string;
}

// Orange promo-style header for a category page. Only states what is true
// of the data (the name and how many products match) — no invented
// discount claims.
function CategoryBanner({ name, productCount, image }: CategoryBannerProps) {
  return (
    <section className="relative flex min-h-[150px] items-center overflow-hidden rounded-lg bg-gradient-to-br from-amber-200 to-orange-400 sm:min-h-[180px]">
      {image && (
        <div className="absolute inset-y-0 right-0 w-1/2 [mask-image:linear-gradient(to_right,transparent,black_45%)]">
          <Image src={image} alt="" fill sizes="50vw" className="object-cover" priority />
        </div>
      )}
      <div className="relative z-10 px-6 py-6 sm:px-10">
        <p className="text-xs font-bold uppercase tracking-wide text-ink">Shop</p>
        <h1 className="mt-1 text-3xl font-extrabold uppercase leading-tight text-ink sm:text-5xl">{name}</h1>
        <p className="mt-2 text-sm font-medium text-ink/80">
          {productCount} {productCount === 1 ? "product" : "products"} to explore
        </p>
      </div>
    </section>
  );
}

export default CategoryBanner;
