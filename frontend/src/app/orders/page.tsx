"use client";

import { useEffect, useState } from "react";
import Header from "@/src/app/components/layout/Header";
import Footer from "@/src/app/components/layout/Footer";
import Breadcrumb from "@/src/app/components/shared/Breadcrumb";
import Badge from "@/src/app/components/ui/Badge";
import Button from "@/src/app/components/ui/Button";
import Textarea from "@/src/app/components/ui/Textarea";
import Spinner from "@/src/app/components/ui/Spinner";
import { useRequireAuth } from "@/src/hooks/useRequireAuth";
import { getMyOrders, cancelOrder, requestReturn, OrderListItem } from "@/src/lib/api/orders";
import { ApiError } from "@/src/lib/api-client";

const STATUS_VARIANT: Record<string, "success" | "warning" | "danger" | "default"> = {
  PAID: "success",
  SHIPPED: "success",
  DELIVERED: "success",
  PLACED: "warning",
  CANCELLED: "danger",
};

const RETURN_STATUS_VARIANT: Record<string, "success" | "warning" | "danger" | "default"> = {
  PENDING: "warning",
  APPROVED: "success",
  REJECTED: "danger",
};

export default function OrdersPage() {
  const { isLoading: authLoading, user } = useRequireAuth();
  const [orders, setOrders] = useState<OrderListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actioningId, setActioningId] = useState<string | null>(null);
  const [returnFormId, setReturnFormId] = useState<string | null>(null);
  const [returnReason, setReturnReason] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading || !user) return;
    getMyOrders()
      .then(setOrders)
      .finally(() => setIsLoading(false));
  }, [authLoading, user]);

  async function handleCancel(orderId: string) {
    setActioningId(orderId);
    setError(null);
    try {
      const updated = await cancelOrder(orderId);
      setOrders((prev) => prev.map((o) => (o.id === orderId ? updated : o)));
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Couldn't cancel this order. Please try again.",
      );
    } finally {
      setActioningId(null);
    }
  }

  async function handleRequestReturn(orderId: string) {
    if (!returnReason.trim()) return;
    setActioningId(orderId);
    setError(null);
    try {
      const updated = await requestReturn(orderId, returnReason.trim());
      setOrders((prev) => prev.map((o) => (o.id === orderId ? updated : o)));
      setReturnFormId(null);
      setReturnReason("");
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Couldn't submit your return request. Please try again.",
      );
    } finally {
      setActioningId(null);
    }
  }

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

        {error && <p className="mt-4 text-sm text-danger-500">{error}</p>}

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
            {orders.map((order) => {
              const canCancel = order.status === "PLACED";
              const canRequestReturn =
                (order.status === "PAID" || order.status === "DELIVERED") &&
                !order.returnRequest;

              return (
                <div
                  key={order.id}
                  className="rounded-md border border-gray-200 bg-white p-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
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
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold text-gray-900">
                        R{Number(order.totalAmount).toLocaleString("en-ZA", { minimumFractionDigits: 2 })}
                      </span>
                      <Badge variant={STATUS_VARIANT[order.status] ?? "default"}>{order.status}</Badge>
                      {order.returnRequest && (
                        <Badge variant={RETURN_STATUS_VARIANT[order.returnRequest.status] ?? "default"}>
                          Return {order.returnRequest.status.toLowerCase()}
                        </Badge>
                      )}
                    </div>
                  </div>

                  {(canCancel || canRequestReturn) && (
                    <div className="mt-3 flex gap-2 border-t border-gray-100 pt-3">
                      {canCancel && (
                        <Button
                          size="sm"
                          variant="outline"
                          isLoading={actioningId === order.id}
                          onClick={() => handleCancel(order.id)}
                        >
                          Cancel Order
                        </Button>
                      )}
                      {canRequestReturn && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            setReturnFormId(returnFormId === order.id ? null : order.id)
                          }
                        >
                          Request a Return
                        </Button>
                      )}
                    </div>
                  )}

                  {returnFormId === order.id && (
                    <div className="mt-3 flex flex-col gap-2 rounded-md bg-gray-50 p-3">
                      <label htmlFor={`return-reason-${order.id}`} className="text-xs font-medium text-gray-900">
                        Tell us why you&apos;d like to return this order
                      </label>
                      <Textarea
                        id={`return-reason-${order.id}`}
                        rows={3}
                        value={returnReason}
                        onChange={(e) => setReturnReason(e.target.value)}
                        placeholder="e.g. Wrong size, changed my mind, item arrived damaged..."
                      />
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          isLoading={actioningId === order.id}
                          disabled={!returnReason.trim()}
                          onClick={() => handleRequestReturn(order.id)}
                        >
                          Submit Request
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setReturnFormId(null);
                            setReturnReason("");
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>

      <Footer variant="minimal" />
    </div>
  );
}
