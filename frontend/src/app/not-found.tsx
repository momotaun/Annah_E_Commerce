import Image from "next/image";
import { Home, ArrowLeft, Search, Truck, Headphones, WifiOff, HelpCircle } from "lucide-react";
import Header from "@/src/app/components/layout/Header";
import Footer from "@/src/app/components/layout/Footer";
import Button from "@/src/app/components/ui/Button";
import GoBackButton from "./components/shared/GoBackButton";
import InfoCard from "@/src/app/components/shared/InfoCard";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header variant="minimal" />

      <main className="flex flex-1 flex-col items-center justify-center px-6 py-16 text-center">
        <div className="relative mb-8">
          <div className="relative h-64 w-64 overflow-hidden rounded-full bg-gray-100">
            <Image src="/images/404-drone.jpg" alt="" fill className="object-cover" />
          </div>

          <span className="absolute -right-2 -top-2 flex h-9 w-9 items-center justify-center rounded-xl bg-white text-primary-600 shadow-sm">
            <HelpCircle className="h-5 w-5" />
          </span>

          <span className="absolute -left-2 bottom-6 flex h-11 w-11 items-center justify-center rounded-full bg-white text-primary-600 shadow-sm">
            <WifiOff className="h-5 w-5" />
          </span>
        </div>

        <h1 className="text-6xl font-extrabold text-primary-600">404</h1>
        <h2 className="mt-3 text-2xl font-bold text-gray-900">
          Oops! That page has wandered off.
        </h2>
        <p className="mt-3 max-w-md text-gray-500">
          The content you&apos;re looking for might have been moved, deleted, or
          never existed in the first place. Don&apos;t worry, we&apos;ll help you
          find your way back.
        </p>

        <div className="mt-8 flex gap-4">
          <Button variant="primary" href="/" icon={<Home className="h-4 w-4" />}>
            Return Home
          </Button>
          <GoBackButton />
        </div>

        <div className="mt-16 grid w-full max-w-3xl grid-cols-1 gap-4 sm:grid-cols-3">
          <InfoCard
            icon={<Search className="h-5 w-5" />}
            title="Search Products"
            description="Find exactly what you need."
          />
          <InfoCard
            icon={<Truck className="h-5 w-5" />}
            title="Order Status"
            description="Track your latest delivery."
          />
          <InfoCard
            icon={<Headphones className="h-5 w-5" />}
            title="Help Center"
            description="Talk to our expert team."
          />
        </div>
      </main>

      <Footer variant="minimal" />
    </div>
  );
}