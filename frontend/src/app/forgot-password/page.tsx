"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import Header from "@/src/app/components/layout/Header";
import Footer from "@/src/app/components/layout/Footer";
import Input from "@/src/app/components/ui/Input";
import Button from "@/src/app/components/ui/Button";
import { initiatePasswordReset } from "@/src/lib/api/auth";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await initiatePasswordReset(email);
    } finally {
      // Always show the same confirmation state, regardless of outcome —
      // mirrors the backend's deliberate "don't reveal whether this email
      // is registered" behavior (Section 9.2-style email enumeration
      // protection). A network failure is the only case that wouldn't
      // reach here at all, which is an acceptable edge case for this flow.
      setIsSubmitting(false);
      setSubmitted(true);
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header variant="minimal" minimalRightLink={{ label: "Help Center", href: "/help" }} />

      <main className="flex flex-1 items-center justify-center bg-gray-50 px-6 py-16">
        <div className="w-full max-w-md rounded-md border border-gray-200 bg-white p-8 shadow-sm">
          {submitted ? (
            <>
              <h1 className="text-2xl font-bold text-gray-900">Check your email</h1>
              <p className="mt-2 text-sm text-gray-500">
                If an account exists for <span className="font-medium text-gray-900">{email}</span>,
                we&apos;ve sent a link to reset your password. It&apos;ll expire in 1 hour.
              </p>
              <Link
                href="/login"
                className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-primary-600 hover:underline"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Login
              </Link>
            </>
          ) : (
            <>
              <h1 className="text-2xl font-bold text-gray-900">Forgot your password?</h1>
              <p className="mt-2 text-sm text-gray-500">
                Enter the email address associated with your account and
                we&apos;ll send you a link to reset your password.
              </p>

              <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
                <Input
                  type="email"
                  placeholder="Email Address"
                  aria-label="Email Address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />

                <Button type="submit" fullWidth isLoading={isSubmitting}>
                  Send Reset Link
                </Button>
              </form>

              <Link
                href="/login"
                className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-primary-600 hover:underline"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Login
              </Link>
            </>
          )}
        </div>
      </main>

      <Footer variant="minimal" />
    </div>
  );
}