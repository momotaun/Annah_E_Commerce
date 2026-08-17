 "use client";

import { useEffect, useState } from "react";
import Spinner from "@/src/app/components/ui/Spinner";
import { getMarketplaceAnalytics, MarketplaceAnalytics } from "@/src/lib/api/admin";

export default function AdminAnalyticsPage() {
  const [analytics, setAnalytics] = useState<MarketplaceAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getMarketplaceAnalytics().then(setAnalytics).finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner label="Loading analytics..." />
      </div>
    );
  }

  if (!analytics) return null;

  const stats = [
    { label: "Total Orders", value: analytics.totalOrders },
    { label: "Total Revenue", value: `R${Number(analytics.totalRevenue).toLocaleString("en-ZA", { minimumFractionDigits: 2 })}` },
    { label: "Commission Earned", value: `R${Number(analytics.totalCommissionEarned).toLocaleString("en-ZA", { minimumFractionDigits: 2 })}` },
    { label: "Active Vendors", value: analytics.activeVendorCount },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Marketplace Analytics</h1>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-md border border-gray-200 bg-white p-5">
            <p className="text-xs font-medium uppercase text-gray-500">{stat.label}</p>
            <p className="mt-1 text-2xl font-bold text-gray-900">{stat.value}</p>
          </div>
        ))}
      </div>

      <h2 className="mt-10 text-lg font-bold text-gray-900">Vendor Breakdown</h2>
      {analytics.vendorBreakdown.length === 0 ? (
        <p className="mt-3 text-sm text-gray-500">No approved vendors yet.</p>
      ) : (
        <div className="mt-4 overflow-hidden rounded-md border border-gray-200 bg-white">
          <table className="w-full text-sm">
            <thead className="border-b border-gray-200 bg-gray-50 text-left text-xs font-medium uppercase text-gray-500">
              <tr>
                <th className="px-4 py-3">Vendor</th>
                <th className="px-4 py-3">Orders</th>
                <th className="px-4 py-3">Revenue</th>
                <th className="px-4 py-3">Commission</th>
              </tr>
            </thead>
            <tbody>
              {analytics.vendorBreakdown.map((v) => (
                <tr key={v.vendorId} className="border-b border-gray-100 last:border-0">
                  <td className="px-4 py-3 font-medium text-gray-900">{v.businessName}</td>
                  <td className="px-4 py-3 text-gray-500">{v.totalOrders}</td>
                  <td className="px-4 py-3 text-gray-500">
                    R{Number(v.totalRevenue).toLocaleString("en-ZA", { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    R{Number(v.totalCommission).toLocaleString("en-ZA", { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}