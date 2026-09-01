"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Header from "@/src/app/components/layout/Header";
import Footer from "@/src/app/components/layout/Footer";
import Breadcrumb from "@/src/app/components/shared/Breadcrumb";
import Badge from "@/src/app/components/ui/Badge";
import Button from "@/src/app/components/ui/Button";
import Textarea from "@/src/app/components/ui/Textarea";
import Spinner from "@/src/app/components/ui/Spinner";
import { useRequireAuth } from "@/src/hooks/useRequireAuth";
import { getMyOrder, cancelOrder, requestReturn, OrderDetail } from "@/src/lib/api/orders";
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

const PAYMENT_STATUS_VARIANT: Record<string, "success" | "warning" | "danger" | "default"> = {
  SUCCEEDED: "success",
  INITIATED: "warning",
  FAILED: "danger",
  REFUNDED: "default",
};

function formatCurrency(amount: string) {
  return `R${Number(amount).toLocaleString("en-ZA", { minimumFractionDigits: 2 })}`;
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en-ZA", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function OrderDetailClient({ orderId }: { orderId: string }) {
  const { isLoading: authLoading, user } = useRequireAuth();
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [isActioning, setIsActioning] = useState(false);
  const [showReturnForm, setShowReturnForm] = useState(false);
  const [returnReason, setReturnReason] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading || !user) return;
    getMyOrder(orderId)
      .then(setOrder)
      .catch((err) => {
        if (err instanceof ApiError && (err.status === 404 || err.status === 403)) {
          setNotFound(true);
        } else {
          setError("Something went wrong loading this order. Please try again.");
        }
      })
      .finally(() => setIsLoading(false));
  }, [authLoading, user, orderId]);

  async function handleCancel() {
    setIsActioning(true);
    setError(null);
    try {
      const updated = await cancelOrder(orderId);
      setOrder((prev) => (prev ? { ...prev, status: updated.status } : prev));
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Couldn't cancel this order. Please try again.",
      );
    } finally {
      setIsActioning(false);
    }
  }

  async function handleRequestReturn() {
    if (!returnReason.trim()) return;
    setIsActioning(true);
    setError(null);
    try {
      const updated = await requestReturn(orderId, returnReason.trim());
      setOrder((prev) => (prev ? { ...prev, returnRequest: updated.returnRequest } : prev));
      setShowReturnForm(false);
      setReturnReason("");
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Couldn't submit your return request. Please try again.",
      );
    } finally {
      setIsActioning(false);
    }
  }

  if (authLoading || isLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner label="Loading order..." />
      </div>
    );
  }

  if (notFound || !order) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header showSearch />
        <main className="flex flex-1 flex-col items-center justify-center px-6 py-16 text-center">
          <h1 className="text-2xl font-bold text-gray-900">Order not found</h1>
          <p className="mt-2 text-sm text-gray-500">
            We couldn&apos;t find that order, or it doesn&apos;t belong to your account.
          </p>
          <Button href="/orders" className="mt-6">Back to My Orders</Button>
        </main>
        <Footer variant="minimal" />
      </div>
    );
  }

  const canCancel = order.status === "PLACED";
  const canRequestReturn =
    (order.status === "PAID" || order.status === "DELIVERED") && !order.returnRequest;

  return (
    <div className="flex min-h-screen flex-col">
      <Header showSearch />

      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-6">
        <Breadcrumb
          items={[
            { label: "My Orders", href: "/orders" },
            { label: `Order #${order.id.slice(-8)}` },
          ]}
        />

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-3xl font-bold text-gray-900">Order #{order.id.slice(-8)}</h1>
          <div className="flex items-center gap-2">
            <Badge variant={STATUS_VARIANT[order.status] ?? "default"}>{order.status}</Badge>
            {order.returnRequest && (
              <Badge variant={RETURN_STATUS_VARIANT[order.returnRequest.status] ?? "default"}>
                Return {order.returnRequest.status.toLowerCase()}
              </Badge>
            )}
          </div>
        </div>
        <p className="mt-1 text-sm text-gray-500">
          Placed on {formatDate(order.createdAt)}
          {order.invoice && ` · Invoice ${order.invoice.invoiceNumber}`}
        </p>

        {error && <p className="mt-4 text-sm text-danger-500">{error}</p>}

        <div className="mt-6 flex flex-col gap-6">
          <div className="rounded-md border border-gray-200 bg-white p-6">
            <h2 className="text-lg font-bold text-gray-900">Items</h2>
            <div className="mt-4 flex flex-col gap-4">
              {order.items.map((item) => (
                <div key={item.id} className="flex gap-4 border-b border-gray-100 pb-4 last:border-b-0 last:pb-0">
                  <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-md bg-gray-100">
                    <Image
                      src={item.productImageUrl ?? "/images/placeholder-product.jpg"}
                      alt={item.productName}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex flex-1 items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{item.productName}</p>
                      <p className="mt-0.5 text-xs text-gray-500">Qty {item.quantity}</p>
                    </div>
                    <span className="text-sm font-bold text-gray-900">
                      {formatCurrency(item.priceAtOrder)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 flex items-center justify-between border-t border-gray-200 pt-4">
              <span className="text-base font-bold text-gray-900">Total</span>
              <span className="text-xl font-bold text-primary-600">
                {formatCurrency(order.totalAmount)}
              </span>
            </div>
          </div>

          <div className="rounded-md border border-gray-200 bg-white p-6">
            <h2 className="text-lg font-bold text-gray-900">Delivery Address</h2>
            <p className="mt-2 text-sm text-gray-500">
              {order.address.line1}
              <br />
              {order.address.city}, {order.address.province}, {order.address.postalCode}
            </p>
          </div>

          {order.payments.length > 0 && (
            <div className="rounded-md border border-gray-200 bg-white p-6">
              <h2 className="text-lg font-bold text-gray-900">Payment</h2>
              <div className="mt-3 flex flex-col gap-2">
                {order.payments.map((payment) => (
                  <div key={payment.id} className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">
                      {payment.provider} · {formatCurrency(payment.amount)}
                    </span>
                    <Badge variant={PAYMENT_STATUS_VARIANT[payment.status] ?? "default"}>
                      {payment.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}

          {order.returnRequest && (
            <div className="rounded-md border border-gray-200 bg-white p-6">
              <h2 className="text-lg font-bold text-gray-900">Return Request</h2>
              <p className="mt-2 text-sm text-gray-500">{order.returnRequest.reason}</p>
              <p className="mt-1 text-xs text-gray-400">
                Requested {formatDate(order.returnRequest.createdAt)}
              </p>
            </div>
          )}

          {(canCancel || canRequestReturn) && (
            <div className="rounded-md border border-gray-200 bg-white p-6">
              <h2 className="text-lg font-bold text-gray-900">Manage Order</h2>
              <div className="mt-3 flex gap-2">
                {canCancel && (
                  <Button
                    size="sm"
                    variant="outline"
                    isLoading={isActioning}
                    onClick={handleCancel}
                  >
                    Cancel Order
                  </Button>
                )}
                {canRequestReturn && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setShowReturnForm((prev) => !prev)}
                  >
                    Request a Return
                  </Button>
                )}
              </div>

              {showReturnForm && (
                <div className="mt-4 flex flex-col gap-2 rounded-md bg-gray-50 p-3">
                  <label htmlFor="return-reason" className="text-xs font-medium text-gray-900">
                    Tell us why you&apos;d like to return this order
                  </label>
                  <Textarea
                    id="return-reason"
                    rows={3}
                    value={returnReason}
                    onChange={(e) => setReturnReason(e.target.value)}
                    placeholder="e.g. Wrong size, changed my mind, item arrived damaged..."
                  />
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      isLoading={isActioning}
                      disabled={!returnReason.trim()}
                      onClick={handleRequestReturn}
                    >
                      Submit Request
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setShowReturnForm(false);
                        setReturnReason("");
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      <Footer variant="minimal" />
    </div>
  );
}
