"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Button from "@/src/app/components/ui/Button";

export default function GoBackButton() {
  const router = useRouter();
  return (
    <Button variant="secondary" icon={<ArrowLeft className="h-4 w-4" />} onClick={() => router.back()}>
      Go Back
    </Button>
  );
}