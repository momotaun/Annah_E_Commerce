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
    <section className="bg-primary-600 py-16 text-center text-white">
      <div className="mx-auto max-w-xl px-6">
        <h2 className="text-2xl font-bold">Stay Ahead of the Curve</h2>
        <p className="mt-2 text-sm text-white/80">
          Get exclusive access to new drops, member-only pricing, and curated
          style guides delivered to your inbox weekly.
        </p>
        <form onSubmit={handleSubmit} className="mt-6 flex gap-3">
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Your email address"
            className="bg-white"
          />
          <Button type="submit" variant="secondary">Subscribe</Button>
        </form>
        <p className="mt-3 text-xs text-white/60">No spam, unsubscribe anytime.</p>
      </div>
    </section>
  );
}

export default NewsletterBand;