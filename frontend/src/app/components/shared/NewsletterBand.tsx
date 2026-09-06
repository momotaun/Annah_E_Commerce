"use client";

import { useState, FormEvent } from "react";
import Input from "@/src/app/components/ui/Input";
import Button from "@/src/app/components/ui/Button";

function NewsletterBand() {
  const [email, setEmail] = useState("");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    // Wire to newsletter endpoint once backend is ready
  }

  return (
    <section className="bg-primary-600 py-10 text-white">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-6 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold">Join the EliteCommerce community</h2>
          <p className="mt-1 text-sm text-primary-100">
            Be the first to know about new arrivals, exclusive deals and more.
          </p>
        </div>
        <form onSubmit={handleSubmit} className="flex w-full gap-3 md:w-auto">
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Your email address"
            className="rounded-md bg-white md:w-72"
          />
          <Button
            type="submit"
            className="shrink-0 rounded-md bg-primary-500 hover:bg-primary-400"
          >
            Subscribe
          </Button>
        </form>
      </div>
    </section>
  );
}

export default NewsletterBand;