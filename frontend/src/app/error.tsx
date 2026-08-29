"use client";

import { useEffect } from "react";
import { RefreshCw, HelpCircle, CloudOff } from "lucide-react";
import Badge from "@/src/app/components/ui/Badge";
import Button from "@/src/app/components/ui/Button";
import Footer from "@/src/app/components/layout/Footer";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log to an error reporting service once we have one wired up
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col">
      <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
        <span className="text-xl font-bold text-primary-600">Apex Marketplace</span>
        <span className="text-sm text-gray-500">
          © {new Date().getFullYear()} Apex Marketplace. All rights reserved.
        </span>
      </div>

      <main className="flex flex-1 flex-col items-center justify-center px-6 py-16 text-center">
        <div className="float-animation-slow relative mb-8">
          <div className="flex h-40 w-40 items-center justify-center rounded-3xl bg-white shadow-sm">
            <CloudOff className="h-16 w-16 text-primary-600" />
          </div>
          <Badge variant="danger" className="absolute -bottom-2 right-0">
            ERROR 500
          </Badge>
        </div>

        <h1 className="text-4xl font-extrabold text-gray-900">
          System glitch.
          <br />
          We&apos;re on it.
        </h1>
        <p className="mt-4 max-w-md text-gray-500">
          Apex Marketplace is experiencing a brief technical interruption. Our
          engineering team has been notified and is currently resolving the
          issue.
        </p>

        <div className="mt-8 flex gap-4">
          <Button
            variant="primary"
            icon={<RefreshCw className="h-4 w-4" />}
            onClick={() => reset()}
          >
            Retry
          </Button>
          <Button variant="outline" href="/contact" icon={<HelpCircle className="h-4 w-4" />}>
            Contact Support
          </Button>
        </div>

        <div className="mt-12 flex w-full max-w-md items-center justify-center gap-6 border-t border-gray-200 pt-6 text-sm text-gray-500">
          <a href="/status" className="hover:text-primary-600">System Status</a>
          <a href="/" className="hover:text-primary-600">Return to Home</a>
          <a href="/help" className="hover:text-primary-600">Help Center</a>
        </div>
      </main>

      <Footer variant="minimal" />
    </div>
  );
}