"use client";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface CategoryBreakdownProps {
  data: { category: string; count: number }[];
}

const COLORS = [
  "#e11d48",
  "#0d9488",
  "#2563eb",
  "#d97706",
  "#7c3aed",
  "#059669",
  "#dc2626",
  "#0891b2",
];

export function CategoryBreakdown({ data }: CategoryBreakdownProps) {
  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={2}
            dataKey="count"
            nameKey="category"
          >
            {data.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                return (
                  <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
                    <p className="text-xs text-slate-500">
                      {payload[0].name}
                    </p>
                    <p className="text-sm font-semibold text-slate-900">
                      {payload[0].value} products
                    </p>
                  </div>
                );
              }
              return null;
            }}
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
