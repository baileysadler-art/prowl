"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { changeTypeLabels } from "@/lib/constants";

interface ChangeHistogramProps {
  data: { change_type: string; count: number }[];
}

const TYPE_COLORS: Record<string, string> = {
  price_increase: "#dc2626",
  price_decrease: "#059669",
  new_product: "#2563eb",
  out_of_stock: "#d97706",
  back_in_stock: "#10b981",
  sale_started: "#7c3aed",
  sale_ended: "#64748b",
};

export function ChangeHistogram({ data }: ChangeHistogramProps) {
  const chartData = data.map((d) => ({
    type: changeTypeLabels[d.change_type] || d.change_type,
    count: d.count,
    fill: TYPE_COLORS[d.change_type] || "#64748b",
  }));

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis
            dataKey="type"
            fontSize={11}
            tickLine={false}
            axisLine={false}
            stroke="#94a3b8"
            angle={-20}
            textAnchor="end"
          />
          <YAxis
            fontSize={12}
            tickLine={false}
            axisLine={false}
            stroke="#94a3b8"
          />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                return (
                  <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
                    <p className="text-xs text-slate-500">
                      {payload[0].payload.type}
                    </p>
                    <p className="text-sm font-semibold text-slate-900">
                      {payload[0].value} changes
                    </p>
                  </div>
                );
              }
              return null;
            }}
          />
          <Bar dataKey="count" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
