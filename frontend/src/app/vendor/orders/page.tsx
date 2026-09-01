"use client";

import { useEffect, useMemo, useState } from "react";
import Badge from "@/src/app/components/ui/Badge";
import Button from "@/src/app/components/ui/Button";
import Spinner from "@/src/app/components/ui/Spinner";
import {
  getMyVendorOrders,
  markOrderShipped,
  markOrderDelivered,
  VendorOrderItem,
} from "@/src/lib/api/vendor-orders";
import { ApiError } from "@/src/lib/api-client";

const STATUS_VARIANT: Record<string, "success" | "warning" | "danger" | "default"> = {
  PAID: "success",
  SHIPPED: "success",
  DELIVERED: "success",
  PLACED: "warning",
  CANCELLED: "danger",
};

interface OrderGroup {
  orderId: string;
  orderStatus: string;
  orderCreatedAt: string;
  items: VendorOrderItem[];
}

function groupByOrder(items: VendorOrderItem[]): OrderGroup[] {
  const groups = new Map<string, OrderGroup>();
  for (const item of items) {
    const existing = groups.get(item.orderId);
    if (existing) {
      existing.items.push(item);
    } else {
      groups.set(item.orderId, {
        orderId: item.orderId,
        orderStatus: item.orderStatus,
        orderCreatedAt: item.orderCreatedAt,
        items: [item],
      });
    }
  }
  return Array.from(groups.values());
}

export default function VendorOrdersPage() {
  const [items, setItems] = useState<VendorOrderItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actioningOrderId, setActioningOrderId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getMyVendorOrders().then(setItems).finally(() => setIsLoading(false));
  }, []);

  const groups = useMemo(() => groupByOrder(items), [items]);

  function applyUpdate(updated: VendorOrderItem[]) {
    setItems((prev) => {
      const byId = new Map(updated.map((item) => [item.id, item]));
      return prev.map((item) => byId.get(item.id) ?? item);
    });
  }

  async function handleMarkShipped(orderId: string) {
    setActioningOrderId(orderId);
    setError(null);
    try {
      applyUpdate(await markOrderShipped(orderId));
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Couldn't mark this order as shipped. Please try again.",
      );
    } finally {
      setActioningOrderId(null);
    }
  }

  async function handleMarkDelivered(orderId: string) {
    setActioningOrderId(orderId);
    setError(null);
    try {
      applyUpdate(await markOrderDelivered(orderId));
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Couldn't mark this order as delivered. Please try again.",
      );
    } finally {
      setActioningOrderId(null);
    }
  }

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

      {error && <p className="mt-3 text-sm text-danger-500">{error}</p>}

      {groups.length === 0 ? (
        <p className="mt-4 text-sm text-gray-500">No orders yet for your products.</p>
      ) : (
        <div className="mt-4 flex flex-col gap-4">
          {groups.map((group) => {
            const allShipped = group.items.every((item) => item.shippedAt);
            const allDelivered = group.items.every((item) => item.deliveredAt);
            const canShip = group.orderStatus === "PAID" && !allShipped;
            const canDeliver = allShipped && !allDelivered && group.orderStatus !== "CANCELLED";

            return (
              <div key={group.orderId} className="rounded-md border border-gray-200 bg-white p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Order #{group.orderId.slice(-8)}</p>
                    <p className="mt-0.5 text-xs text-gray-500">
                      {new Date(group.orderCreatedAt).toLocaleDateString("en-ZA", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                  <Badge variant={STATUS_VARIANT[group.orderStatus] ?? "default"}>
                    {group.orderStatus}
                  </Badge>
                </div>

                <div className="mt-3 flex flex-col gap-2 border-t border-gray-100 pt-3">
                  {group.items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between text-sm">
                      <span className="text-gray-900">{item.productName} × {item.quantity}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-gray-500">
                          R{Number(item.lineTotal).toLocaleString("en-ZA", { minimumFractionDigits: 2 })}
                          {" "}(commission R{Number(item.commissionAmount).toLocaleString("en-ZA", { minimumFractionDigits: 2 })})
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {(canShip || canDeliver || allShipped) && (
                  <div className="mt-3 flex items-center gap-2 border-t border-gray-100 pt-3">
                    {allDelivered ? (
                      <Badge variant="success">Delivered</Badge>
                    ) : allShipped ? (
                      <Badge variant="success">Shipped</Badge>
                    ) : null}
                    {canShip && (
                      <Button
                        size="sm"
                        variant="outline"
                        isLoading={actioningOrderId === group.orderId}
                        onClick={() => handleMarkShipped(group.orderId)}
                      >
                        Mark as Shipped
                      </Button>
                    )}
                    {canDeliver && (
                      <Button
                        size="sm"
                        variant="outline"
                        isLoading={actioningOrderId === group.orderId}
                        onClick={() => handleMarkDelivered(group.orderId)}
                      >
                        Mark as Delivered
                      </Button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
