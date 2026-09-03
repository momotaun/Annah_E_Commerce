"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Header from "@/src/app/components/layout/Header";
import Footer from "@/src/app/components/layout/Footer";
import Spinner from "@/src/app/components/ui/Spinner";
import Button from "@/src/app/components/ui/Button";
import Input from "@/src/app/components/ui/Input";
import { confirmEmailVerification, resendVerificationEmail } from "@/src/lib/api/auth";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const hasRun = useRef(false);

  const [resendEmail, setResendEmail] = useState("");
  const [resendSent, setResendSent] = useState(false);
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    if (!token || hasRun.current) return;
    hasRun.current = true;

    confirmEmailVerification(token)
      .then(() => setStatus("success"))
      .catch(() => setStatus("error"));
  }, [token]);

  async function handleResend() {
    if (!resendEmail) return;
    setIsResending(true);
    try {
      await resendVerificationEmail(resendEmail);
      setResendSent(true);
    } finally {
      setIsResending(false);
    }
  }

  if (!token) {
    return (
      <div className="w-full max-w-md rounded-md border border-gray-200 bg-white p-8 text-center shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900">Missing verification link</h1>
        <p className="mt-2 text-sm text-gray-500">
          This link is missing its token. Check your email for the original link, or request a new one below.
        </p>
        <ResendForm
          email={resendEmail}
          setEmail={setResendEmail}
          onResend={handleResend}
          isResending={isResending}
          sent={resendSent}
        />
      </div>
    );
  }

  if (status === "loading") {
    return (
      <div className="w-full max-w-md rounded-md border border-gray-200 bg-white p-8 text-center shadow-sm">
        <Spinner label="Verifying your email..." />
      </div>
    );
  }

  if (status === "success") {
    return (
      <div className="w-full max-w-md rounded-md border border-gray-200 bg-white p-8 text-center shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900">Email verified</h1>
        <p className="mt-2 text-sm text-gray-500">Your email address has been confirmed.</p>
        <Button href="/profile" className="mt-6">Go to my account</Button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md rounded-md border border-gray-200 bg-white p-8 text-center shadow-sm">
      <h1 className="text-2xl font-bold text-gray-900">Link invalid or expired</h1>
      <p className="mt-2 text-sm text-gray-500">
        This verification link is no longer valid. Request a new one below.
      </p>
      <ResendForm
        email={resendEmail}
        setEmail={setResendEmail}
        onResend={handleResend}
        isResending={isResending}
        sent={resendSent}
      />
    </div>
  );
}

function ResendForm({
  email,
  setEmail,
  onResend,
  isResending,
  sent,
}: {
  email: string;
  setEmail: (value: string) => void;
  onResend: () => void;
  isResending: boolean;
  sent: boolean;
}) {
  if (sent) {
    return (
      <p className="mt-6 text-sm text-gray-500">
        If that email is registered and not yet verified, a new link is on its way.
      </p>
    );
  }

  return (
    <div className="mt-6 flex flex-col gap-3">
      <Input
        type="email"
        placeholder="Email Address"
        aria-label="Email Address"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <Button onClick={onResend} isLoading={isResending} disabled={!email}>
        Resend verification email
      </Button>
      <Link href="/login" className="text-sm font-medium text-primary-600 hover:underline">
        Back to login
      </Link>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header variant="minimal" minimalRightLink={{ label: "Help Center", href: "/help" }} />

      <main className="flex flex-1 items-center justify-center bg-gray-50 px-6 py-16">
        {/* useSearchParams requires a Suspense boundary in the App Router */}
        <Suspense fallback={null}>
          <VerifyEmailContent />
        </Suspense>
      </main>

      <Footer variant="minimal" />
    </div>
  );
}
