"use client";

import { useState } from "react";
import { Briefcase, BadgeCheck, History, MapPin, Heart } from "lucide-react";
import Header from "@/src/app/components/layout/Header";
import Footer from "@/src/app/components/layout/Footer";
import AccountSidebar from "@/src/app/components/shared/AccountSidebar";
import ActivityCard from "@/src/app/components/shared/ActivityCard";
import Input from "@/src/app/components/ui/Input";
import Button from "@/src/app/components/ui/Button";

export default function ProfilePage() {
  const [fullName, setFullName] = useState("Alex Rivera");
  const [phone, setPhone] = useState("+27 74 123 4567");

  return (
    <div className="flex min-h-screen flex-col">
      <Header
        navLinks={[
          { label: "Home", href: "/" },
          { label: "Catalogue", href: "/catalogue" },
          { label: "Categories", href: "/categories" },
        ]}
        cartCount={0}
        user={{ name: "Alex Rivera", avatarSrc: "/images/alex-avatar.jpg" }}
      />

      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-8 px-6 py-10 md:flex-row">
        <AccountSidebar onLogout={() => {}} />

        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900">Welcome back, Alex</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage your preferences and track your shopping activity.
          </p>

          <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="rounded-md border border-gray-200 bg-white p-6 lg:col-span-2">
              <div className="flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-primary-600" />
                <h2 className="text-lg font-bold text-gray-900">Personal Info</h2>
              </div>

              <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div>
                  <label htmlFor="fullName" className="text-sm font-medium text-gray-900">
                    Full Name
                  </label>
                  <Input
                    id="fullName"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="mt-1.5"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="text-sm font-medium text-gray-500">
                    Email (Read-only)
                  </label>
                  <Input
                    id="email"
                    value="alex.rivera@apex.com"
                    disabled
                    className="mt-1.5"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label htmlFor="phone" className="text-sm font-medium text-gray-900">
                    Phone Number
                  </label>
                  <Input
                    id="phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="mt-1.5"
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <Button>Save Changes</Button>
              </div>
            </div>

            <div className="flex flex-col gap-6">
              <div className="rounded-md bg-primary-50 p-5">
                <div className="flex items-center gap-2 text-primary-600">
                  <BadgeCheck className="h-5 w-5" />
                  <span className="text-sm font-semibold">Member Since</span>
                </div>
                <p className="mt-2 text-2xl font-bold text-gray-900">March 2024</p>
              </div>

              <div className="relative overflow-hidden rounded-md">
                <div className="relative aspect-[4/3] bg-gray-100">
                  <img
                    src="/images/premium-tier-promo.jpg"
                    alt=""
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                </div>
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <span className="text-xs font-semibold uppercase tracking-wide">
                    Premium Tier
                  </span>
                  <p className="mt-1 text-sm font-semibold">
                    Unlock exclusive early access to catalogues.
                  </p>
                </div>
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
                comingSoon
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

      <Footer
        brandBlurb="The world's most premium digital marketplace for curated high-end goods."
        columns={[
          { title: "Explore", links: [{ label: "Home", href: "/" }, { label: "Catalogue", href: "/catalogue" }, { label: "Categories", href: "/categories" }] },
          { title: "Support", links: [{ label: "FAQ", href: "/faq" }, { label: "Shipping", href: "/shipping" }, { label: "Returns", href: "/returns" }] },
          { title: "Legal", links: [{ label: "Privacy Policy", href: "/privacy" }, { label: "Terms of Service", href: "/terms" }] },
        ]}
      />
    </div>
  );
}