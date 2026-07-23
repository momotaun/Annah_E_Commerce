"use client";

import Image from "next/image";
import Stepper from "@/src/app/components/ui/Stepper";

export interface CartLineItemProps {
  image: string;
  title: string;
  variant?: string;
  price: string;
  quantity: number;
  onQuantityChange: (quantity: number) => void;
}

function CartLineItem({
  image,
  title,
  variant,
  price,
  quantity,
  onQuantityChange,
}: CartLineItemProps) {
  return (
    <div className="flex gap-4 border-b border-gray-200 py-5 last:border-b-0">
      <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-md bg-gray-100">
        <Image src={image} alt={title} fill className="object-cover" />
      </div>

      <div className="flex flex-1 flex-col justify-between">
        <div>
          <p className="text-base font-semibold text-gray-900">{title}</p>
          {variant && <p className="text-sm text-gray-500">{variant}</p>}
        </div>
        <Stepper value={quantity} onChange={onQuantityChange} min={1} />
      </div>

      <span className="shrink-0 text-lg font-bold text-primary-600">{price}</span>
    </div>
  );
}

export default CartLineItem;