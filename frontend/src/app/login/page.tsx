"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Header from "@/src/app/components/layout/Header";
import Footer from "@/src/app/components/layout/Footer";
import Input from "@/src/app/components/ui/Input";
import Checkbox from "@/src/app/components/ui/Checkbox";
import Button from "@/src/app/components/ui/Button";
import GoogleIcon from "@/src/app/components/ui/icons/GoogleIcon";
import AppleIcon from "@/src/app/components/ui/icons/AppleIcon";
import { useAuth } from "@/src/context/AuthContext";
import { ApiError } from "@/src/lib/api-client";
import { getHomeRouteForRole } from "@/src/lib/api/auth";

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      const user = await login(email, password);
      router.push(getHomeRouteForRole(user.role));
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        setError("Incorrect email or password.");
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header
        variant="minimal"
        minimalRightLink={{ label: "Help Center", href: "/help" }}
      />

      <main className="flex flex-1 items-center justify-center bg-gray-50 px-6 py-16">
        <div className="w-full max-w-md rounded-md border border-gray-200 bg-white p-8 shadow-sm">
          <h1 className="text-3xl font-bold text-gray-900">Welcome back</h1>
          <p className="mt-1 text-sm text-gray-500">
            Enter your details to access your account.
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

            <Input
              type="password"
              placeholder="Password"
              aria-label="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <div className="flex items-center justify-between">
              <Checkbox id="remember" label="Remember Me" />
              <Link href="/forgot-password" className="text-sm font-medium text-primary-600 hover:underline">
                Forgot Password?
              </Link>
            </div>

            {error && (
              <p className="text-sm text-danger-500">{error}</p>
            )}

            <Button type="submit" fullWidth isLoading={isSubmitting}>
              Login
            </Button>
          </form>

          <div className="my-6 flex items-center gap-3">
            <span className="h-px flex-1 bg-gray-200" />
            <span className="text-xs font-medium uppercase text-gray-500">
              Or continue with
            </span>
            <span className="h-px flex-1 bg-gray-200" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Button variant="secondary" icon={<GoogleIcon className="h-4 w-4" />} disabled>
              Google
            </Button>
            <Button variant="secondary" icon={<AppleIcon className="h-4 w-4" />} disabled>
              Apple
            </Button>
          </div>

          <p className="mt-6 text-center text-sm text-gray-500">
            New here?{" "}
            <Link href="/register" className="font-medium text-primary-600 hover:underline">
              Create an account
            </Link>
          </p>
        </div>
      </main>

      <Footer variant="minimal" />
    </div>
  );
}