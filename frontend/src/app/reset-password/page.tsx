"use client";

import { Suspense, useState, FormEvent } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import Header from "@/src/app/components/layout/Header";
import Footer from "@/src/app/components/layout/Footer";
import Input from "@/src/app/components/ui/Input";
import Button from "@/src/app/components/ui/Button";
import { confirmPasswordReset } from "@/src/lib/api/auth";
import { ApiError } from "@/src/lib/api-client";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!token) {
      setError("This reset link is missing its token. Please request a new one.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);
    try {
      await confirmPasswordReset(token, password);
      setSuccess(true);
      setTimeout(() => router.push("/login"), 2500);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        setError("This reset link is invalid or has expired. Please request a new one.");
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!token) {
    return (
      <div className="w-full max-w-md rounded-md border border-gray-200 bg-white p-8 text-center shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900">Invalid reset link</h1>
        <p className="mt-2 text-sm text-gray-500">
          This link is missing a reset token. Please request a new password reset.
        </p>
        <Link href="/forgot-password" className="mt-6 inline-block text-sm font-medium text-primary-600 hover:underline">
          Request a new link
        </Link>
      </div>
    );
  }

  if (success) {
    return (
      <div className="w-full max-w-md rounded-md border border-gray-200 bg-white p-8 text-center shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900">Password reset</h1>
        <p className="mt-2 text-sm text-gray-500">
          Your password has been updated. Redirecting you to login...
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md rounded-md border border-gray-200 bg-white p-8 shadow-sm">
      <h1 className="text-2xl font-bold text-gray-900">Set a new password</h1>
      <p className="mt-2 text-sm text-gray-500">
        Choose a new password for your account.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
        <Input
          type="password"
          placeholder="New Password"
          aria-label="New Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <Input
          type="password"
          placeholder="Confirm New Password"
          aria-label="Confirm New Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />

        {error && <p className="text-sm text-danger-500">{error}</p>}

        <Button type="submit" fullWidth isLoading={isSubmitting}>
          Reset Password
        </Button>
      </form>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header variant="minimal" minimalRightLink={{ label: "Help Center", href: "/help" }} />

      <main className="flex flex-1 items-center justify-center bg-gray-50 px-6 py-16">
        {/* useSearchParams requires a Suspense boundary in the App Router */}
        <Suspense fallback={null}>
          <ResetPasswordForm />
        </Suspense>
      </main>

      <Footer variant="minimal" />
    </div>
  );
}