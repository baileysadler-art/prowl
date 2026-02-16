"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { format } from "date-fns";

interface PriceHistoryChartProps {
  data: { date: string; price: number }[];
  currency?: string;
}

export function PriceHistoryChart({
  data,
  currency = "GBP",
}: PriceHistoryChartProps) {
  const symbol = currency === "GBP" ? "£" : "$";

  const chartData = data.map((d) => ({
    date: format(new Date(d.date), "MMM d"),
    fullDate: format(new Date(d.date), "MMM d, yyyy HH:mm"),
    price: d.price,
  }));

  return (
    <div className="h-[300px] w-full">
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
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                return (
                  <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
                    <p className="text-xs text-slate-500">
                      {payload[0].payload.fullDate}
                    </p>
                    <p className="text-sm font-semibold text-slate-900">
                      {symbol}
                      {Number(payload[0].value).toFixed(2)}
                    </p>
                  </div>
                );
              }
              return null;
            }}
          />
          <Line
            type="monotone"
            dataKey="price"
            stroke="#e11d48"
            strokeWidth={2}
            dot={{ fill: "#e11d48", strokeWidth: 0, r: 3 }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
