"use client";

import { useState, FormEvent } from "react";
import Image from "next/image";
import { MapPin, Clock, Send, Mail } from "lucide-react";
import SocialIcon from "@/src/app/components/ui/SocialIcon";
import TwitterIcon from "@/src/app/components/ui/icons/TwitterIcon";
import InstagramIcon from "@/src/app/components/ui/icons/InstagramIcon";
import FacebookIcon from "@/src/app/components/ui/icons/FacebookIcon";
import Header from "@/src/app/components/layout/Header";
import Footer from "@/src/app/components/layout/Footer";
import Input from "@/src/app/components/ui/Input";
import Textarea from "@/src/app/components/ui/Textarea";
import Select from "@/src/app/components/ui/Select";
import Button from "@/src/app/components/ui/Button";
import Accordion from "@/src/app/components/ui/Accordion";

const faqs = [
  {
    question: "How long does shipping take within South Africa?",
    answer: "Most orders arrive within 2-4 business days for major metros, and 5-7 days for outlying areas.",
  },
  {
    question: "What is your return policy?",
    answer: "We accept returns within 30 days of delivery, provided items are unused and in original packaging.",
  },
  {
    question: "Do you offer wholesale pricing for businesses?",
    answer: "Yes, reach out via this form with 'Wholesale' as the subject and our team will follow up with pricing tiers.",
  },
];

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", subject: "general", message: "" });

  function handleChange<K extends keyof typeof form>(key: K, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    // Wire to contact endpoint once backend is ready
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header showSearch cartCount={0} />

      <main className="mx-auto w-full max-w-7xl flex-1 px-6 py-12">
        <h1 className="text-4xl font-extrabold text-gray-900">Get in Touch</h1>
        <p className="mt-2 max-w-xl text-gray-500">
          We&apos;re here to help you elevate your shopping experience. Reach
          out to our team of experts for any assistance with our premium
          marketplace.
        </p>

        <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-2">
          <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-5 rounded-md border border-gray-200 bg-white p-8 shadow-sm"
          >
            <div>
              <label htmlFor="name" className="text-sm font-semibold text-gray-900">
                Full Name
              </label>
              <Input
                id="name"
                placeholder="John Doe"
                value={form.name}
                onChange={(e) => handleChange("name", e.target.value)}
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
                placeholder="john@example.com"
                value={form.email}
                onChange={(e) => handleChange("email", e.target.value)}
                className="mt-1.5"
              />
            </div>

            <div>
              <label htmlFor="subject" className="text-sm font-semibold text-gray-900">
                Subject
              </label>
              <Select
                id="subject"
                value={form.subject}
                onChange={(e) => handleChange("subject", e.target.value)}
                options={[
                  { label: "General Inquiry", value: "general" },
                  { label: "Order Support", value: "order" },
                  { label: "Wholesale", value: "wholesale" },
                ]}
                className="mt-1.5"
              />
            </div>

            <div>
              <label htmlFor="message" className="text-sm font-semibold text-gray-900">
                Message
              </label>
              <Textarea
                id="message"
                placeholder="How can we help you?"
                value={form.message}
                onChange={(e) => handleChange("message", e.target.value)}
                className="mt-1.5"
              />
            </div>

            <Button type="submit" fullWidth icon={<Send className="h-4 w-4" />} iconPosition="right">
              Send Message
            </Button>
          </form>

          <div className="flex flex-col gap-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-md bg-gray-50 p-5">
                <MapPin className="h-6 w-6 text-primary-600" />
                <h3 className="mt-3 text-base font-semibold text-gray-900">Our Office</h3>
                <p className="mt-1 text-sm text-gray-500">
                  42 Waterfront Plaza<br />
                  V&amp;A Waterfront, Cape Town<br />
                  8001, South Africa
                </p>
              </div>
              <div className="rounded-md bg-gray-50 p-5">
                <Clock className="h-6 w-6 text-primary-600" />
                <h3 className="mt-3 text-base font-semibold text-gray-900">Operating Hours</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Mon - Fri: 08:00 - 18:00<br />
                  Sat: 09:00 - 14:00<br />
                  Sun: Closed
                </p>
              </div>
            </div>

            <div className="relative aspect-video overflow-hidden rounded-md bg-gray-900">
              <Image src="/images/map-preview.jpg" alt="Map preview" fill className="object-cover opacity-80" />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-gray-900 shadow-sm">
                  <MapPin className="h-4 w-4 text-primary-600" />
                  Find us in Cape Town
                </span>
              </div>
            </div>

            <div>
              <span className="text-xs font-semibold uppercase text-gray-500">
                Follow Our Journey
              </span>
              <div className="mt-3 flex gap-3">
                <SocialIcon icon={<TwitterIcon className="h-4 w-4" />} />
                <SocialIcon icon={<InstagramIcon className="h-4 w-4" />} />
                <SocialIcon icon={<FacebookIcon className="h-4 w-4" />} />
                <SocialIcon icon={<Mail className="h-4 w-4" />} />
              </div>
            </div>
          </div>
        </div>

        <section className="mt-20 text-center">
          <h2 className="text-2xl font-bold text-gray-900">Common Questions</h2>
          <p className="mt-1 text-sm text-gray-500">
            Quick answers to frequently asked questions.
          </p>
          <div className="mx-auto mt-8 max-w-2xl text-left">
            <Accordion items={faqs} />
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}