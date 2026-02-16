import {
  LayoutDashboard,
  Users,
  Package,
  DollarSign,
  Bell,
  FileText,
  Settings,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
}

export const sidebarNav: NavItem[] = [
  { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { title: "Competitors", href: "/dashboard/competitors", icon: Users },
  { title: "Products", href: "/dashboard/products", icon: Package },
  { title: "Pricing", href: "/dashboard/pricing", icon: DollarSign },
  { title: "Alerts", href: "/dashboard/alerts", icon: Bell },
  { title: "Reports", href: "/dashboard/reports", icon: FileText },
  { title: "Settings", href: "/dashboard/settings", icon: Settings },
];

export const planTierLabels: Record<string, string> = {
  starter: "Starter",
  professional: "Professional",
  business: "Business",
  enterprise: "Enterprise",
};

export const planTierColors: Record<string, string> = {
  starter: "bg-slate-100 text-slate-700",
  professional: "bg-rose-100 text-rose-700",
  business: "bg-red-100 text-red-700",
  enterprise: "bg-amber-100 text-amber-700",
};

export const changeTypeLabels: Record<string, string> = {
  price_increase: "Price Increase",
  price_decrease: "Price Decrease",
  new_product: "New Product",
  out_of_stock: "Out of Stock",
  back_in_stock: "Back in Stock",
  sale_started: "Sale Started",
  sale_ended: "Sale Ended",
};

export const changeTypeColors: Record<string, string> = {
  price_increase: "text-red-600 bg-red-50",
  price_decrease: "text-emerald-600 bg-emerald-50",
  new_product: "text-blue-600 bg-blue-50",
  out_of_stock: "text-amber-600 bg-amber-50",
  back_in_stock: "text-emerald-600 bg-emerald-50",
  sale_started: "text-rose-600 bg-rose-50",
  sale_ended: "text-slate-600 bg-slate-50",
};

export const severityColors: Record<string, string> = {
  info: "text-blue-600 bg-blue-50 border-blue-200",
  warning: "text-amber-600 bg-amber-50 border-amber-200",
  critical: "text-red-600 bg-red-50 border-red-200",
};

export const PRICING_TIERS = [
  {
    name: "Starter",
    price: 49,
    annualPrice: 39,
    period: "month",
    description: "Perfect for small brands getting started",
    bestFor: "Solo founders and small shops",
    features: [
      "3 competitors",
      "12-hour refresh rate",
      "Email alerts",
      "Basic reports",
      "7-day price history",
    ],
    competitorLimit: 3,
    scrapeInterval: 12,
    stripePriceId: "price_starter",
  },
  {
    name: "Professional",
    price: 199,
    annualPrice: 159,
    period: "month",
    description: "For growing brands that need deeper insights",
    bestFor: "Growing DTC brands with 5-20 SKUs",
    features: [
      "10 competitors",
      "6-hour refresh rate",
      "Email + Slack alerts",
      "Advanced reports",
      "30-day price history",
      "Price comparison tools",
    ],
    competitorLimit: 10,
    scrapeInterval: 6,
    popular: true,
    stripePriceId: "price_professional",
  },
  {
    name: "Business",
    price: 499,
    annualPrice: 399,
    period: "month",
    description: "For teams that need comprehensive coverage",
    bestFor: "Established brands with large catalogues",
    features: [
      "25 competitors",
      "2-hour refresh rate",
      "All alert channels",
      "Custom reports",
      "90-day price history",
      "API access",
      "Priority support",
    ],
    competitorLimit: 25,
    scrapeInterval: 2,
    stripePriceId: "price_business",
  },
  {
    name: "Enterprise",
    price: 0,
    annualPrice: 0,
    period: "month",
    description: "Custom solutions for large organisations",
    bestFor: "Retailers and marketplaces at scale",
    isEnterprise: true,
    features: [
      "Unlimited competitors",
      "1-hour refresh rate",
      "Custom integrations",
      "Dedicated account manager",
      "Unlimited price history",
      "White-label reports",
      "SLA guarantee",
    ],
    competitorLimit: -1,
    scrapeInterval: 1,
    stripePriceId: "price_enterprise",
  },
];
