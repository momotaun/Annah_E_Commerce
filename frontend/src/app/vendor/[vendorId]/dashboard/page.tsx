"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import Spinner from "@/src/app/components/ui/Spinner";
import { getMyVendorDashboard, VendorDashboard } from "@/src/lib/api/vendor-orders";

// Mirrors the STATUS_VARIANT convention already used on the vendor orders page and
// /orders (PAID/SHIPPED/DELIVERED = success, PLACED = warning, CANCELLED =
// danger) — pulled from the brand palette in globals.css since recharts
// needs literal colour values, not Tailwind classes.
const STATUS_COLORS: Record<string, string> = {
  PAID: "#16a34a",
  SHIPPED: "#16a34a",
  DELIVERED: "#16a34a",
  PLACED: "#d97706",
  CANCELLED: "#e0432b",
};
const FALLBACK_STATUS_COLOR = "#9ca3af";

const AXIS_TICK = { fontSize: 11, fill: "#6b7280" };

function formatCurrency(value: number | string): string {
  return `R${Number(value).toLocaleString("en-ZA", { minimumFractionDigits: 2 })}`;
}

// revenueOverTime dates are plain "YYYY-MM-DD" strings — parsed with an
// explicit local midnight so this never drifts a day off in a non-UTC
// timezone the way `new Date("YYYY-MM-DD")` (parsed as UTC) would.
function formatShortDate(dateKey: string): string {
  const [year, month, day] = dateKey.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString("en-ZA", {
    day: "numeric",
    month: "short",
  });
}

// recharts' Tooltip formatter/labelFormatter types are generic over
// ValueType/NameType — `unknown` params keep these assignable to whatever
// recharts infers per-chart without fighting its types, since real values
// here are always the number/date-string this dashboard puts in.
function tooltipRevenueFormatter(value: unknown): [string, string] {
  return [formatCurrency(Number(value)), "Revenue"];
}

function tooltipDateLabelFormatter(label: unknown): string {
  return formatShortDate(String(label));
}

export default function VendorDashboardPage() {
  const { vendorId } = useParams<{ vendorId: string }>();
  const [dashboard, setDashboard] = useState<VendorDashboard | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getMyVendorDashboard(vendorId)
      .then(setDashboard)
      .finally(() => setIsLoading(false));
  }, [vendorId]);

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner label="Loading dashboard..." />
      </div>
    );
  }

  if (!dashboard) return null;

  const stats = [
    { label: "Total Orders", value: dashboard.totalOrders.toLocaleString("en-ZA") },
    { label: "Items Sold", value: dashboard.totalItemsSold.toLocaleString("en-ZA") },
    { label: "Total Revenue", value: formatCurrency(dashboard.totalRevenue) },
    { label: "Commission Paid", value: formatCurrency(dashboard.totalCommission) },
    { label: "Net Earnings", value: formatCurrency(dashboard.netEarnings) },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-md border border-gray-200 bg-white p-5">
            <p className="text-xs font-medium uppercase text-gray-500">{stat.label}</p>
            <p className="mt-1 text-2xl font-bold text-gray-900">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-md border border-gray-200 bg-white p-6 lg:col-span-2">
          <h2 className="text-sm font-semibold text-gray-900">Revenue — last 30 days</h2>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dashboard.revenueOverTime} margin={{ left: -16 }}>
                <defs>
                  <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#2f9e63" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#2f9e63" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis
                  dataKey="date"
                  tickFormatter={formatShortDate}
                  tick={AXIS_TICK}
                  interval={Math.ceil(dashboard.revenueOverTime.length / 6) - 1}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={AXIS_TICK}
                  tickFormatter={(value: number) => `R${value}`}
                  axisLine={false}
                  tickLine={false}
                  width={56}
                />
                <Tooltip
                  labelFormatter={tooltipDateLabelFormatter}
                  formatter={tooltipRevenueFormatter}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#2f9e63"
                  strokeWidth={2}
                  fill="url(#revenueFill)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-md border border-gray-200 bg-white p-6">
          <h2 className="text-sm font-semibold text-gray-900">Orders by Status</h2>
          {dashboard.ordersByStatus.length > 0 ? (
            <div className="mt-4 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={dashboard.ordersByStatus}
                    dataKey="count"
                    nameKey="status"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={2}
                  >
                    {dashboard.ordersByStatus.map((entry) => (
                      <Cell
                        key={entry.status}
                        fill={STATUS_COLORS[entry.status] ?? FALLBACK_STATUS_COLOR}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    formatter={(value: string) => (
                      <span className="text-xs text-gray-600">{value}</span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="mt-4 py-16 text-center text-sm text-gray-500">No orders yet.</p>
          )}
        </div>
      </div>

      <div className="mt-6 rounded-md border border-gray-200 bg-white p-6">
        <h2 className="text-sm font-semibold text-gray-900">Top Products</h2>
        {dashboard.topProducts.length > 0 ? (
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dashboard.topProducts} layout="vertical" margin={{ left: 24 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e5e7eb" />
                <XAxis
                  type="number"
                  tickFormatter={(value: number) => `R${value}`}
                  tick={AXIS_TICK}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  type="category"
                  dataKey="productName"
                  width={140}
                  tick={{ fontSize: 12, fill: "#111827" }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip formatter={tooltipRevenueFormatter} />
                <Bar dataKey="revenue" fill="#2f9e63" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <p className="mt-4 py-8 text-center text-sm text-gray-500">No sales yet.</p>
        )}
      </div>
    </div>
  );
}
