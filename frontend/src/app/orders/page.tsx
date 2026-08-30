"use client";

import { useEffect, useState } from "react";
import Header from "@/src/app/components/layout/Header";
import Footer from "@/src/app/components/layout/Footer";
import Breadcrumb from "@/src/app/components/shared/Breadcrumb";
import Badge from "@/src/app/components/ui/Badge";
import Button from "@/src/app/components/ui/Button";
import Spinner from "@/src/app/components/ui/Spinner";
import { useRequireAuth } from "@/src/hooks/useRequireAuth";
import { getMyOrders, OrderListItem } from "@/src/lib/api/orders";

const STATUS_VARIANT: Record<string, "success" | "warning" | "danger" | "default"> = {
  PAID: "success",
  SHIPPED: "success",
  DELIVERED: "success",
  PLACED: "warning",
  CANCELLED: "danger",
};

export default function OrdersPage() {
  const { isLoading: authLoading, user } = useRequireAuth();
  const [orders, setOrders] = useState<OrderListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (authLoading || !user) return;
    getMyOrders()
      .then(setOrders)
      .finally(() => setIsLoading(false));
  }, [authLoading, user]);

  if (authLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner label="Loading..." />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header showSearch />

      <main className="mx-auto w-full max-w-4xl flex-1 px-6 py-6">
        <Breadcrumb items={[{ label: "My Orders" }]} />
        <h1 className="mt-4 text-3xl font-bold text-gray-900">My Orders</h1>

        {isLoading ? (
          <div className="flex justify-center py-16">
            <Spinner label="Loading orders..." />
          </div>
        ) : orders.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-sm text-gray-500">You haven&apos;t placed any orders yet.</p>
            <Button href="/catalogue" className="mt-4">Start Shopping</Button>
          </div>
        ) : (
          <div className="mt-8 flex flex-col gap-3">
            {orders.map((order) => (
              <div
                key={order.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-gray-200 bg-white p-4"
              >
                <div>
                  <p className="text-sm font-semibold text-gray-900">Order #{order.id.slice(-8)}</p>
                  <p className="mt-0.5 text-xs text-gray-500">
                    {new Date(order.createdAt).toLocaleDateString("en-ZA", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}{" "}
                    · {order.itemCount} item{order.itemCount === 1 ? "" : "s"}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm font-bold text-gray-900">
                    R{Number(order.totalAmount).toLocaleString("en-ZA", { minimumFractionDigits: 2 })}
                  </span>
                  <Badge variant={STATUS_VARIANT[order.status] ?? "default"}>{order.status}</Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer variant="minimal" />
    </div>
  );
}
