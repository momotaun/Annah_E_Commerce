"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import Footer from "@/src/app/components/layout/Footer";
import Input from "@/src/app/components/ui/Input";
import Button from "@/src/app/components/ui/Button";
import GoogleIcon from "@/src/app/components/ui/icons/GoogleIcon";
import AppleIcon from "@/src/app/components/ui/icons/AppleIcon";

export default function RegisterPage() {
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  function handleChange<K extends keyof typeof form>(key: K, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex flex-1 flex-col items-center bg-gray-50 px-6 py-16">
        <Link href="/" className="text-2xl font-bold text-primary-600">
          Apex Marketplace
        </Link>

        <div className="mt-6 w-full max-w-md rounded-md border border-gray-200 bg-white p-6 shadow-sm">
          <h1 className="text-center text-4xl font-bold text-gray-900">
            Create your account
          </h1>
          <p className="mt-2 text-center text-base text-gray-500">
            Join Apex Marketplace for a personalized shopping experience.
          </p>

          <form className="mt-6 flex flex-col gap-6">
            <div>
              <label htmlFor="fullName" className="text-sm font-semibold text-gray-900">
                Full Name
              </label>
              <Input
                id="fullName"
                placeholder="Jane Doe"
                value={form.fullName}
                onChange={(e) => handleChange("fullName", e.target.value)}
                className="mt-1.5"
              />
            </div>

            <div>
              <label htmlFor="email" className="text-sm font-semibold text-gray-900">
                Email Address
              </label>
              <Input
                id="email"
                type="email"
                placeholder="jane@example.com"
                value={form.email}
                onChange={(e) => handleChange("email", e.target.value)}
                className="mt-1.5"
              />
            </div>

            <div>
              <label htmlFor="password" className="text-sm font-semibold text-gray-900">
                Password
              </label>
              <Input
                id="password"
                type="password"
                value={form.password}
                onChange={(e) => handleChange("password", e.target.value)}
                className="mt-1.5"
              />
              <p className="mt-1.5 text-xs text-gray-500">
                Password must be at least 8 characters
              </p>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="text-sm font-semibold text-gray-900">
                Confirm Password
              </label>
              <Input
                id="confirmPassword"
                type="password"
                value={form.confirmPassword}
                onChange={(e) => handleChange("confirmPassword", e.target.value)}
                className="mt-1.5"
              />
            </div>

            <Button type="submit" fullWidth icon={<ArrowRight className="h-4 w-4" />} iconPosition="right">
              Create Account
            </Button>
          </form>

          <p className="mt-4 text-center text-sm text-gray-500">
            By creating an account, you agree to our{" "}
            <Link href="/terms" className="text-primary-600 hover:underline">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="text-primary-600 hover:underline">
              Privacy Policy
            </Link>
            .
          </p>

          <div className="my-6 flex items-center gap-3">
            <span className="h-px flex-1 bg-gray-200" />
            <span className="text-xs font-medium text-gray-500">Or sign up with</span>
            <span className="h-px flex-1 bg-gray-200" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Button variant="secondary" icon={<GoogleIcon className="h-4 w-4" />}>
              Google
            </Button>
            <Button variant="secondary" icon={<AppleIcon className="h-4 w-4" />}>
              Apple
            </Button>
          </div>

          <p className="mt-6 text-center text-sm text-gray-500">
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-primary-600 hover:underline">
              Login
            </Link>
          </p>
        </div>
      </main>

      <Footer
        brandBlurb="Experience premium e-commerce with a curated selection of global high-end technology and fashion."
        columns={[
          { title: "Shop", links: [{ label: "Catalog", href: "/catalogue" }, { label: "Deals", href: "/deals" }, { label: "New Arrivals", href: "/new" }] },
          { title: "Company", links: [{ label: "About Us", href: "/about" }, { label: "Contact Support", href: "/contact" }] },
          { title: "Legal", links: [{ label: "Privacy Policy", href: "/privacy" }, { label: "Terms of Service", href: "/terms" }] },
          { title: "Shipping", links: [{ label: "Shipping Info", href: "/shipping" }, { label: "Returns", href: "/returns" }] },
        ]}
      />
    </div>
  );
}