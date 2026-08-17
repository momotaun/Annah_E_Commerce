"use client";

import Badge from "@/src/app/components/ui/Badge";
import Button from "@/src/app/components/ui/Button";
import Spinner from "@/src/app/components/ui/Spinner";
import { getVendors, approveVendor, VendorListItem } from "@/src/lib/api/admin";
import { getVendors, approveVendor, VendorListItem } from "@/src/lib/api/admin";
import { useState } from "react";

export default function AdminVendorsPage() {
  const [vendors, setVendors] = useState<VendorListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actioningId, setActioningId] = useState<string | null>(null);

  function loadVendors() {
    setIsLoading(true);
    getVendors()
      .then(setVendors)
      .finally(() => setIsLoading(false));
  }

  useEffect(() => {
    loadVendors();
  }, []);

  async function handleAction(vendorId: string, status: "APPROVED" | "SUSPENDED") {
    setActioningId(vendorId);
    try {
      await approveVendor(vendorId, status);
      setVendors((prev) =>
        prev.map((v) => (v.id === vendorId ? { ...v, status } : v)),
      );
    } catch (err) {
      console.error("Failed to update vendor status", err);
    } finally {
      setActioningId(null);
    }
  }

  const badgeVariant = (status: VendorListItem["status"]) =>
    status === "APPROVED" ? "primary" : status === "SUSPENDED" ? "danger" : "warning";

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner label="Loading vendors..." />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Vendor Applications</h1>

      {vendors.length === 0 ? (
        <p className="mt-4 text-sm text-gray-500">No vendor applications yet.</p>
      ) : (
        <div className="mt-4 flex flex-col gap-3">
          {vendors.map((vendor) => (
            <div
              key={vendor.id}
              className="flex items-center justify-between rounded-md border border-gray-200 bg-white p-4"
            >
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-gray-900">{vendor.businessName}</p>
                  <Badge variant={badgeVariant(vendor.status)}>{vendor.status}</Badge>
                </div>
                <p className="text-xs text-gray-500">{vendor.contactEmail}</p>
              </div>

              <div className="flex gap-2">
                {vendor.status !== "APPROVED" && (
                  <Button
                    size="sm"
                    isLoading={actioningId === vendor.id}
                    onClick={() => handleAction(vendor.id, "APPROVED")}
                  >
                    Approve
                  </Button>
                )}
                {vendor.status !== "SUSPENDED" && (
                  <Button
                    size="sm"
                    variant="danger"
                    isLoading={actioningId === vendor.id}
                    onClick={() => handleAction(vendor.id, "SUSPENDED")}
                  >
                    Suspend
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}