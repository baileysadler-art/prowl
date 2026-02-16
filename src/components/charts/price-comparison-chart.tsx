"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { format } from "date-fns";

const COLORS = [
  "#2563eb",
  "#dc2626",
  "#059669",
  "#d97706",
  "#7c3aed",
  "#db2777",
  "#0891b2",
  "#65a30d",
];

interface CompetitorData {
  name: string;
  data: { date: string; price: number }[];
}

interface PriceComparisonChartProps {
  competitors: CompetitorData[];
  currency?: string;
}

export function PriceComparisonChart({
  competitors,
  currency = "GBP",
}: PriceComparisonChartProps) {
  const symbol = currency === "GBP" ? "£" : "$";

  // Merge all data points into unified timeline
  const dateMap = new Map<string, Record<string, string | number>>();

  competitors.forEach((comp) => {
    comp.data.forEach((d) => {
      const dateKey = format(new Date(d.date), "MMM d");
      const existing = dateMap.get(dateKey) || { date: dateKey };
      existing[comp.name] = d.price;
      dateMap.set(dateKey, existing);
    });
  });

  const chartData = Array.from(dateMap.values());

  return (
    <div className="h-[350px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis
            dataKey="date"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            stroke="#94a3b8"
          />
          <YAxis
            fontSize={12}
            tickLine={false}
            axisLine={false}
            stroke="#94a3b8"
            tickFormatter={(v) => `${symbol}${v}`}
          />
          <Tooltip
            content={({ active, payload, label }) => {
              if (active && payload && payload.length) {
                return (
                  <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
                    <p className="mb-2 text-xs font-medium text-slate-500">
                      {label}
                    </p>
                    {payload.map((p, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm">
                        <div
                          className="h-2 w-2 rounded-full"
                          style={{ backgroundColor: p.color }}
                        />
                        <span className="text-slate-600">{p.name}:</span>
                        <span className="font-medium">
                          {symbol}
                          {Number(p.value).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                );
              }
              return null;
            }}
          />
          <Legend />
          {competitors.map((comp, i) => (
            <Line
              key={comp.name}
              type="monotone"
              dataKey={comp.name}
              stroke={COLORS[i % COLORS.length]}
              strokeWidth={2}
              dot={false}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
