"use client";

import { useEffect, useState } from "react";
import Badge from "@/src/app/components/ui/Badge";
import Button from "@/src/app/components/ui/Button";
import Spinner from "@/src/app/components/ui/Spinner";
import { getAdminOrders, resolveReturnRequest, AdminOrderListItem } from "@/src/lib/api/admin";

const STATUS_VARIANT: Record<string, "success" | "warning" | "danger" | "default"> = {
  PAID: "success",
  SHIPPED: "success",
  DELIVERED: "success",
  PLACED: "warning",
  CANCELLED: "danger",
};

const PAYMENT_STATUS_VARIANT: Record<string, "success" | "warning" | "danger" | "default"> = {
  SUCCEEDED: "success",
  INITIATED: "warning",
  FAILED: "danger",
  REFUNDED: "default",
};

const RETURN_STATUS_VARIANT: Record<string, "success" | "warning" | "danger" | "default"> = {
  PENDING: "warning",
  APPROVED: "success",
  REJECTED: "danger",
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<AdminOrderListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actioningId, setActioningId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function loadOrders() {
    setIsLoading(true);
    getAdminOrders()
      .then(setOrders)
      .finally(() => setIsLoading(false));
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      loadOrders();
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  async function handleResolve(orderId: string, status: "APPROVED" | "REJECTED") {
    setActioningId(orderId);
    setError(null);
    try {
      const updated = await resolveReturnRequest(orderId, status);
      setOrders((prev) => prev.map((o) => (o.id === orderId ? updated : o)));
    } catch {
      setError("Couldn't update this return request. Please try again.");
    } finally {
      setActioningId(null);
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
      <p className="mt-1 text-sm text-gray-500">
        Every order placed on the marketplace, with payment status and any return requests.
      </p>

      {error && <p className="mt-3 text-sm text-danger-500">{error}</p>}

      {orders.length === 0 ? (
        <p className="mt-4 text-sm text-gray-500">No orders yet.</p>
      ) : (
        <div className="mt-4 flex flex-col gap-3">
          {orders.map((order) => (
            <div key={order.id} className="rounded-md border border-gray-200 bg-white p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-gray-900">Order #{order.id.slice(-8)}</p>
                  <p className="mt-0.5 text-xs text-gray-500">{order.customerEmail}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-gray-900">
                    R{Number(order.totalAmount).toLocaleString("en-ZA", { minimumFractionDigits: 2 })}
                  </span>
                  <Badge variant={STATUS_VARIANT[order.status] ?? "default"}>{order.status}</Badge>
                  {order.paymentStatus && (
                    <Badge variant={PAYMENT_STATUS_VARIANT[order.paymentStatus] ?? "default"}>
                      Payment: {order.paymentStatus}
                    </Badge>
                  )}
                </div>
              </div>

              {order.returnRequest && (
                <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 pt-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <Badge variant={RETURN_STATUS_VARIANT[order.returnRequest.status] ?? "default"}>
                        Return {order.returnRequest.status.toLowerCase()}
                      </Badge>
                    </div>
                    <p className="mt-1 text-sm text-gray-500">{order.returnRequest.reason}</p>
                  </div>
                  {order.returnRequest.status === "PENDING" && (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        isLoading={actioningId === order.id}
                        onClick={() => handleResolve(order.id, "APPROVED")}
                      >
                        Approve Return
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        isLoading={actioningId === order.id}
                        onClick={() => handleResolve(order.id, "REJECTED")}
                      >
                        Reject Return
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
