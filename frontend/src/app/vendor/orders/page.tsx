"use client";

import { useEffect, useState } from "react";
import Spinner from "@/src/app/components/ui/Spinner";
import { getMyVendorOrders, VendorOrderItem } from "@/src/lib/api/vendor-orders";

export default function VendorOrdersPage() {
  const [items, setItems] = useState<VendorOrderItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getMyVendorOrders().then(setItems).finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner label="Loading orders..." />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Orders</h1>

      {items.length === 0 ? (
        <p className="mt-4 text-sm text-gray-500">No orders yet for your products.</p>
      ) : (
        <div className="mt-4 flex flex-col gap-3">
          {items.map((item) => (
            <div key={item.id} className="flex items-center justify-between rounded-md border border-gray-200 bg-white p-4">
              <div>
                <p className="text-sm font-semibold text-gray-900">{item.productName}</p>
                <p className="text-xs text-gray-500">
                  Qty {item.quantity} · Order {item.orderId} · {item.orderStatus}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-gray-900">
                  R{Number(item.lineTotal).toLocaleString("en-ZA", { minimumFractionDigits: 2 })}
                </p>
                <p className="text-xs text-gray-500">
                  Commission: R{Number(item.commissionAmount).toLocaleString("en-ZA", { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}