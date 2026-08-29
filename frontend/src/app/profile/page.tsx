"use client";

import { useEffect, useState } from "react";
import { Briefcase, BadgeCheck, History, MapPin, Heart } from "lucide-react";
import Header from "@/src/app/components/layout/Header";
import Footer from "@/src/app/components/layout/Footer";
import AccountSidebar from "@/src/app/components/shared/AccountSidebar";
import ActivityCard from "@/src/app/components/shared/ActivityCard";
import Input from "@/src/app/components/ui/Input";
import Button from "@/src/app/components/ui/Button";
import Spinner from "@/src/app/components/ui/Spinner";
import { useAuth } from "@/src/context/AuthContext";
import { useRequireAuth } from "@/src/hooks/useRequireAuth";
import { getMyProfile, updateMyProfile } from "@/src/lib/api/users";

export default function ProfilePage() {
  const { isLoading: authLoading } = useRequireAuth(); // redirects to /login if unauthenticated
  const { user, logout } = useAuth();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [memberSince, setMemberSince] = useState<string | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading || !user) return;
    getMyProfile()
      .then((profile) => {
        setFirstName(profile.firstName);
        setLastName(profile.lastName);
        setMemberSince(
          new Date(profile.createdAt).toLocaleDateString("en-ZA", {
            month: "long",
            year: "numeric",
          }),
        );
      })
      .finally(() => setIsLoadingProfile(false));
  }, [authLoading, user]);

  async function handleSave() {
    setIsSaving(true);
    setSaveMessage(null);
    try {
      await updateMyProfile({ firstName, lastName });
      setSaveMessage("Changes saved.");
    } catch {
      setSaveMessage("Couldn't save changes. Please try again.");
    } finally {
      setIsSaving(false);
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
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user.firstName}
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage your preferences and track your shopping activity.
          </p>

          <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="rounded-md border border-gray-200 bg-white p-6 lg:col-span-2">
              <div className="flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-primary-600" />
                <h2 className="text-lg font-bold text-gray-900">Personal Info</h2>
              </div>

              {isLoadingProfile ? (
                <div className="flex justify-center py-10">
                  <Spinner label="Loading profile..." />
                </div>
              ) : (
                <>
                  <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2">
                    <div>
                      <label htmlFor="firstName" className="text-sm font-medium text-gray-900">
                        First Name
                      </label>
                      <Input
                        id="firstName"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className="mt-1.5"
                      />
                    </div>

                    <div>
                      <label htmlFor="lastName" className="text-sm font-medium text-gray-900">
                        Last Name
                      </label>
                      <Input
                        id="lastName"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className="mt-1.5"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label htmlFor="email" className="text-sm font-medium text-gray-500">
                        Email (Read-only)
                      </label>
                      <Input id="email" value={user.email} disabled className="mt-1.5" />
                    </div>
                  </div>

                  {saveMessage && (
                    <p className="mt-4 text-sm text-gray-500">{saveMessage}</p>
                  )}

                  <div className="mt-6 flex justify-end">
                    <Button isLoading={isSaving} onClick={handleSave}>
                      Save Changes
                    </Button>
                  </div>
                </>
              )}
            </div>

            <div className="flex flex-col gap-6">
              <div className="rounded-md bg-primary-50 p-5">
                <div className="flex items-center gap-2 text-primary-600">
                  <BadgeCheck className="h-5 w-5" />
                  <span className="text-sm font-semibold">Member Since</span>
                </div>
                <p className="mt-2 text-2xl font-bold text-gray-900">
                  {memberSince ?? "—"}
                </p>
              </div>
            </div>
          </div>

          <section className="mt-10">
            <h2 className="text-xl font-bold text-gray-900">Activity &amp; Lists</h2>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
              <ActivityCard
                icon={<History className="h-5 w-5" />}
                title="Order History"
                description="View and track all your past and current marketplace orders."
              />
              <ActivityCard
                icon={<MapPin className="h-5 w-5" />}
                title="Saved Addresses"
                description="Manage your shipping and billing locations for faster checkout."
                comingSoon
              />
              <ActivityCard
                icon={<Heart className="h-5 w-5" />}
                title="Wishlist"
                description="Keep track of the products you love and want to purchase later."
                comingSoon
              />
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}