import Image from "next/image";
import { ArrowRight } from "lucide-react";
import Button from "@/src/app/components/ui/Button";
import { cn } from "@/src/lib/utils";

export interface PromoCardProps {
  eyebrow: string;
  /** The big line, e.g. "Up to <70% off>" — wrap the figure in PromoCard.Accent. */
  headline: React.ReactNode;
  cta: { label: string; href: string };
  image: string;
  tone?: "orange" | "neutral" | "pink";
  className?: string;
}

const toneClasses: Record<NonNullable<PromoCardProps["tone"]>, string> = {
  orange: "bg-gradient-to-br from-amber-200 to-orange-400",
  neutral: "bg-gray-100",
  pink: "bg-gradient-to-br from-pink-200 to-pink-400",
};

// Orange emphasis for the discount figure inside a promo headline.
function Accent({ children }: { children: React.ReactNode }) {
  return <span className="text-sale">{children}</span>;
}

function PromoCard({ eyebrow, headline, cta, image, tone = "orange", className }: PromoCardProps) {
  return (
    <div
      className={cn(
        "group relative flex min-h-[170px] overflow-hidden rounded-lg sm:min-h-[190px]",
        toneClasses[tone],
        className
      )}
    >
      <div className="absolute inset-y-0 right-0 w-1/2 [mask-image:linear-gradient(to_right,transparent,black_45%)]">
        <Image
          src={image}
          alt=""
          fill
          sizes="(min-width: 768px) 20vw, 40vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>

      <div className="relative z-10 flex flex-col justify-center gap-2 px-5 py-5 sm:px-6">
        <span className="text-xs font-bold uppercase tracking-wide text-ink">{eyebrow}</span>
        <p className="text-2xl font-extrabold uppercase leading-tight text-ink sm:text-3xl">{headline}</p>
        <Button
          variant="dark"
          size="sm"
          href={cta.href}
          className="mt-1 w-fit rounded-md uppercase"
          icon={<ArrowRight className="h-3.5 w-3.5" />}
          iconPosition="right"
        >
          {cta.label}
        </Button>
      </div>
    </div>
  );
}

PromoCard.Accent = Accent;

export default PromoCard;
