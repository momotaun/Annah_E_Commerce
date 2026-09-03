"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import Header from "@/src/app/components/layout/Header";
import Footer from "@/src/app/components/layout/Footer";
import Button from "@/src/app/components/ui/Button";
import Spinner from "@/src/app/components/ui/Spinner";
import { useRequireAuth } from "@/src/hooks/useRequireAuth";
import { getMyOrder, OrderDetail } from "@/src/lib/api/orders";
import { initiatePayment } from "@/src/lib/api/payments";

const POLL_INTERVAL_MS = 3000;
const MAX_POLLS = 10;

function PaymentResultContent() {
  const { isLoading: authLoading, user } = useRequireAuth();
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");
  const outcome = searchParams.get("outcome");

  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [pollCount, setPollCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const pollTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchOrder = useCallback(async () => {
    if (!orderId) return;
    try {
      const result = await getMyOrder(orderId);
      setOrder(result);
    } catch {
      setError("We couldn't load your order. Please check your order history.");
    } finally {
      setIsLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    if (authLoading || !user || !orderId) return;
    const timer = setTimeout(() => {
      fetchOrder().then(() => {});
    }, 0);
    return () => clearTimeout(timer);
  }, [authLoading, user, orderId, fetchOrder]);

  const latestPayment = order?.payments[order.payments.length - 1];
  const isSettled = order?.status === "PAID" || latestPayment?.status === "FAILED";

  useEffect(() => {
    if (isLoading || isSettled || !order || pollCount >= MAX_POLLS) return;
    pollTimer.current = setTimeout(() => {
      fetchOrder().then(() => setPollCount((c) => c + 1));
    }, POLL_INTERVAL_MS);
    return () => {
      if (pollTimer.current) clearTimeout(pollTimer.current);
    };
  }, [isLoading, isSettled, order, pollCount, fetchOrder]);

  async function handleRetry() {
    if (!orderId) return;
    setIsRetrying(true);
    setError(null);
    try {
      const payment = await initiatePayment(orderId);
      if (payment.redirectUrl) {
        window.location.href = payment.redirectUrl;
        return;
      }
    } catch {
      setError("Couldn't start a new payment attempt. Please try again.");
    } finally {
      setIsRetrying(false);
    }
  }

  if (!orderId) {
    return (
      <div className="w-full max-w-md rounded-md border border-gray-200 bg-white p-8 text-center shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900">Missing order</h1>
        <p className="mt-2 text-sm text-gray-500">
          We couldn&apos;t tell which order this payment was for.
        </p>
        <Button href="/orders" className="mt-6">View my orders</Button>
      </div>
    );
  }

  if (authLoading || isLoading || !user) {
    return <Spinner label="Loading payment status..." />;
  }

  if (error && !order) {
    return (
      <div className="w-full max-w-md rounded-md border border-gray-200 bg-white p-8 text-center shadow-sm">
        <p className="text-sm text-danger-500">{error}</p>
      </div>
    );
  }

  if (order?.status === "PAID") {
    return (
      <div className="w-full max-w-md rounded-md border border-gray-200 bg-white p-8 text-center shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900">Payment received</h1>
        <p className="mt-2 text-sm text-gray-500">
          Thank you — your payment for order {order.invoice?.invoiceNumber ?? order.id} was successful.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Button href={`/orders/${order.id}`} variant="outline">View Order</Button>
          <Button href="/catalogue">Continue Shopping</Button>
        </div>
      </div>
    );
  }

  const failed = latestPayment?.status === "FAILED" || outcome === "cancelled" || outcome === "error";
  if (failed && pollCount >= MAX_POLLS) {
    return (
      <div className="w-full max-w-md rounded-md border border-gray-200 bg-white p-8 text-center shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900">Payment didn&apos;t go through</h1>
        <p className="mt-2 text-sm text-gray-500">
          {outcome === "cancelled"
            ? "You cancelled the payment before it completed."
            : "Something went wrong processing your payment."}
        </p>
        {error && <p className="mt-2 text-sm text-danger-500">{error}</p>}
        <div className="mt-6 flex justify-center gap-3">
          <Button href="/checkout" variant="outline">Back to checkout</Button>
          <Button isLoading={isRetrying} onClick={handleRetry}>Try again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md rounded-md border border-gray-200 bg-white p-8 text-center shadow-sm">
      <Spinner label="Confirming your payment..." />
      <p className="mt-4 text-sm text-gray-500">
        This can take a few moments. This page will update automatically once we hear back from your payment provider.
      </p>
      {pollCount >= MAX_POLLS && (
        <Button variant="ghost" className="mt-4" onClick={() => setPollCount(0)}>
          Check again
        </Button>
      )}
    </div>
  );
}

export default function PaymentResultPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header showSearch />

      <main className="flex flex-1 items-center justify-center bg-gray-50 px-6 py-16">
        {/* useSearchParams requires a Suspense boundary in the App Router */}
        <Suspense fallback={<Spinner label="Loading payment status..." />}>
          <PaymentResultContent />
        </Suspense>
      </main>

      <Footer variant="minimal" />
    </div>
  );
}
