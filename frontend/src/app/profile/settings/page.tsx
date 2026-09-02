"use client";

import { useState, FormEvent } from "react";
import { Lock } from "lucide-react";
import Header from "@/src/app/components/layout/Header";
import Footer from "@/src/app/components/layout/Footer";
import AccountSidebar from "@/src/app/components/shared/AccountSidebar";
import Input from "@/src/app/components/ui/Input";
import Button from "@/src/app/components/ui/Button";
import Spinner from "@/src/app/components/ui/Spinner";
import { useAuth } from "@/src/context/AuthContext";
import { useRequireAuth } from "@/src/hooks/useRequireAuth";
import { changeMyPassword } from "@/src/lib/api/users";
import { ApiError } from "@/src/lib/api-client";

export default function SettingsPage() {
  const { isLoading: authLoading } = useRequireAuth();
  const { user, logout } = useAuth();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (newPassword.length < 8) {
      setError("New password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("New passwords do not match.");
      return;
    }

    setIsSubmitting(true);
    try {
      await changeMyPassword(currentPassword, newPassword);
      setSuccess(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        setError("Current password is incorrect.");
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
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
      <Header
        navLinks={[
          { label: "Home", href: "/" },
          { label: "Catalogue", href: "/catalogue" },
          { label: "Categories", href: "/categories" },
        ]}
      />

      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-8 px-6 py-10 md:flex-row">
        <AccountSidebar onLogout={logout} />

        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage your account security.
          </p>

          <div className="mt-8 max-w-md rounded-md border border-gray-200 bg-white p-6">
            <div className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-primary-600" />
              <h2 className="text-lg font-bold text-gray-900">Change Password</h2>
            </div>

            <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
              <div>
                <label htmlFor="currentPassword" className="text-sm font-medium text-gray-900">
                  Current Password
                </label>
                <Input
                  id="currentPassword"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="mt-1.5"
                  required
                />
              </div>

              <div>
                <label htmlFor="newPassword" className="text-sm font-medium text-gray-900">
                  New Password
                </label>
                <Input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="mt-1.5"
                  required
                />
                <p className="mt-1.5 text-xs text-gray-500">
                  Must be at least 8 characters
                </p>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="text-sm font-medium text-gray-900">
                  Confirm New Password
                </label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="mt-1.5"
                  required
                />
              </div>

              {error && <p className="text-sm text-danger-500">{error}</p>}
              {success && (
                <p className="text-sm text-success-500">
                  Password updated. Your other signed-in devices have been signed out.
                </p>
              )}

              <div className="flex justify-end">
                <Button type="submit" isLoading={isSubmitting}>
                  Update Password
                </Button>
              </div>
            </form>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
