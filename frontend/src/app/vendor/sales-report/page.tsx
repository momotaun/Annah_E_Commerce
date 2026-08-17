"use client";

import { useEffect, useState } from "react";
import Spinner from "@/src/app/components/ui/Spinner";
import { getMySalesReport, SalesReport } from "@/src/lib/api/vendor-orders";

export default function VendorSalesReportPage() {
  const [report, setReport] = useState<SalesReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getMySalesReport().then(setReport).finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner label="Loading sales report..." />
      </div>
    );
  }

  if (!report) return null;

  const stats = [
    { label: "Total Orders", value: report.totalOrders },
    { label: "Items Sold", value: report.totalItemsSold },
    { label: "Total Revenue", value: `R${Number(report.totalRevenue).toLocaleString("en-ZA", { minimumFractionDigits: 2 })}` },
    { label: "Commission Paid", value: `R${Number(report.totalCommission).toLocaleString("en-ZA", { minimumFractionDigits: 2 })}` },
    { label: "Net Earnings", value: `R${Number(report.netEarnings).toLocaleString("en-ZA", { minimumFractionDigits: 2 })}` },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Sales Report</h1>
      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-md border border-gray-200 bg-white p-5">
            <p className="text-xs font-medium uppercase text-gray-500">{stat.label}</p>
            <p className="mt-1 text-2xl font-bold text-gray-900">{stat.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}