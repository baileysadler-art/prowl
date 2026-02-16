import Link from "next/link";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { WaitlistForm } from "@/components/waitlist-form";
import { PricingSection } from "@/components/pricing-section";
import { MobileNav } from "@/components/mobile-nav";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Minus,
  Search,
  LineChart,
  Zap,
  FileBarChart,
  Link2,
  Rocket,
  Clock,
  BellRing,
} from "lucide-react";

const FEATURES = [
  {
    title: "24/7 Price Monitoring",
    description:
      "Automatically track competitor prices across thousands of products. Get notified the moment anything changes.",
    icon: Search,
    color: "text-violet-600",
    bg: "bg-gradient-to-br from-violet-100 to-violet-50",
    accent: "from-violet-500 to-purple-500",
  },
  {
    title: "Price Trend Analysis",
    description:
      "Visualize price movements over time with interactive charts. Spot patterns and predict future pricing strategies.",
    icon: LineChart,
    color: "text-blue-600",
    bg: "bg-gradient-to-br from-blue-100 to-blue-50",
    accent: "from-blue-500 to-indigo-500",
  },
  {
    title: "Instant Alerts",
    description:
      "Get real-time notifications via email, Slack, or in-app when prices change, products launch, or sales begin.",
    icon: Zap,
    color: "text-amber-600",
    bg: "bg-gradient-to-br from-amber-100 to-amber-50",
    accent: "from-amber-500 to-orange-500",
  },
  {
    title: "Competitive Reports",
    description:
      "Automated weekly and monthly reports with key insights, top movers, and actionable recommendations.",
    icon: FileBarChart,
    color: "text-emerald-600",
    bg: "bg-gradient-to-br from-emerald-100 to-emerald-50",
    accent: "from-emerald-500 to-teal-500",
  },
  {
    title: "Multi-Platform Support",
    description:
      "Works with Shopify, WooCommerce, Magento, and any eCommerce platform. No setup required.",
    icon: Link2,
    color: "text-pink-600",
    bg: "bg-gradient-to-br from-pink-100 to-pink-50",
    accent: "from-pink-500 to-rose-500",
  },
  {
    title: "Lightning Fast",
    description:
      "Cloud-based scraping engine processes thousands of products in minutes. Always up-to-date data.",
    icon: Rocket,
    color: "text-cyan-600",
    bg: "bg-gradient-to-br from-cyan-100 to-cyan-50",
    accent: "from-cyan-500 to-blue-500",
  },
];

const HOW_IT_WORKS = [
  {
    step: "01",
    title: "Add Competitors",
    description:
      "Enter your competitor URLs and we'll automatically detect their platform and product pages.",
    gradient: "from-violet-500 to-purple-600",
  },
  {
    step: "02",
    title: "We Monitor 24/7",
    description:
      "Our engine scrapes competitor sites on your chosen schedule, detecting every price and product change.",
    gradient: "from-blue-500 to-indigo-600",
  },
  {
    step: "03",
    title: "Get Insights",
    description:
      "Receive instant alerts, explore analytics dashboards, and review automated intelligence reports.",
    gradient: "from-fuchsia-500 to-pink-600",
  },
];

const WHY_PROWL = [
  {
    title: "Save Hours Every Week",
    description:
      "Stop manually checking competitor websites. Prowl monitors pricing, stock levels, and promotions automatically so your team can focus on strategy.",
    icon: Clock,
    color: "text-violet-600",
    bg: "bg-gradient-to-br from-violet-100 to-violet-50",
    tint: "from-violet-500/[0.03] to-transparent",
  },
  {
    title: "Never Miss a Price Change",
    description:
      "Get instant alerts the moment a competitor adjusts pricing or launches a promotion. React in minutes, not days.",
    icon: BellRing,
    color: "text-blue-600",
    bg: "bg-gradient-to-br from-blue-100 to-blue-50",
    tint: "from-blue-500/[0.03] to-transparent",
  },
  {
    title: "Data-Driven Decisions",
    description:
      "Interactive dashboards and automated reports give you the competitive intelligence to make confident pricing and product decisions.",
    icon: BarChart3,
    color: "text-emerald-600",
    bg: "bg-gradient-to-br from-emerald-100 to-emerald-50",
    tint: "from-emerald-500/[0.03] to-transparent",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950 antialiased">
      {/* ═══════════════════════════════════════════
          HERO + NAV — Dark, atmospheric
          ═══════════════════════════════════════════ */}
      <section className="relative overflow-hidden bg-slate-950">
        {/* Floating gradient blobs */}
        <div className="absolute -top-40 -left-40 h-[600px] w-[600px] rounded-full bg-gradient-to-br from-violet-500/30 via-purple-500/20 to-fuchsia-500/15 blur-3xl animate-float" />
        <div className="absolute top-0 -right-40 h-[500px] w-[500px] rounded-full bg-gradient-to-bl from-blue-500/25 via-indigo-500/15 to-cyan-500/10 blur-3xl animate-float-slow" />
        <div className="absolute bottom-0 left-1/3 h-[400px] w-[400px] rounded-full bg-gradient-to-tr from-pink-500/20 via-rose-500/10 to-orange-500/5 blur-3xl animate-float-reverse" />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 h-[300px] w-[600px] rounded-full bg-gradient-to-r from-violet-400/10 to-pink-400/10 blur-3xl" />

        {/* Navbar */}
        <nav className="relative z-50">
          <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
            <Link href="/" className="text-xl font-bold tracking-tight">
              <span className="gradient-text">Prowl</span>
            </Link>
            <div className="hidden items-center gap-10 md:flex">
              <a href="#features" className="text-[13px] font-medium text-slate-400 transition-colors hover:text-white">
                Features
              </a>
              <a href="#pricing" className="text-[13px] font-medium text-slate-400 transition-colors hover:text-white">
                Pricing
              </a>
              <a href="#faq" className="text-[13px] font-medium text-slate-400 transition-colors hover:text-white">
                FAQ
              </a>
              <Link href="/login" className="text-[13px] font-medium text-slate-400 transition-colors hover:text-white">
                Log in
              </Link>
              <Link href="/signup">
                <button className="btn-gradient rounded-lg px-5 py-2 text-[13px] font-medium text-white">
                  Start Free Trial
                </button>
              </Link>
            </div>
            <MobileNav />
          </div>
        </nav>

        {/* Hero content */}
        <div className="relative mx-auto max-w-7xl px-4 pb-24 pt-16 sm:px-6 sm:pb-32 sm:pt-20 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm px-4 py-1.5">
              <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[13px] font-medium text-slate-300">
                2,400+ eCommerce brands on the waitlist
              </span>
            </div>
            <h1 className="text-4xl font-semibold tracking-[-0.03em] text-white sm:text-5xl lg:text-[4.25rem] lg:leading-[1.1]">
              Stop Losing Margin to{" "}
              <span className="gradient-text">Price Moves</span> You Missed
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-slate-400 sm:text-xl">
              Prowl tracks every price change, product launch, and promotion
              across your competitors — and alerts you in minutes, not days.
              Stop losing margin to pricing moves you didn&apos;t see coming.
            </p>
            <div className="mt-10 flex justify-center">
              <WaitlistForm />
            </div>
            <p className="mt-4 text-[13px] text-slate-500">
              Get early access + 3 months free &middot; Launching March 2026
            </p>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          PLATFORM LOGOS — Dark, bridges hero to light
          ═══════════════════════════════════════════ */}
      <section className="relative border-y border-white/5 bg-slate-950 py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="text-center text-xs font-medium uppercase tracking-widest text-slate-500">
            Monitors pricing across every major platform
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-12 gap-y-6">
            {[
              { name: "Shopify", icon: "🟢" },
              { name: "WooCommerce", icon: "🟣" },
              { name: "Magento", icon: "🟠" },
              { name: "BigCommerce", icon: "🔵" },
              { name: "Custom Stores", icon: "⚙️" },
            ].map((platform) => (
              <div key={platform.name} className="flex items-center gap-2.5 rounded-lg border border-white/[0.06] bg-white/[0.03] px-4 py-2">
                <span className="text-sm">{platform.icon}</span>
                <span className="text-[14px] font-medium tracking-tight text-slate-400">
                  {platform.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          FEATURES — Light, warm-tinted, premium cards
          ═══════════════════════════════════════════ */}
      <section id="features" className="relative overflow-hidden bg-[#f8f9fc] py-32">
        {/* Subtle radial tints for depth */}
        <div className="absolute top-0 left-1/4 h-[500px] w-[500px] rounded-full bg-violet-200/20 blur-3xl" />
        <div className="absolute bottom-0 right-1/4 h-[400px] w-[400px] rounded-full bg-blue-200/15 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <div className="mb-3 inline-flex items-center rounded-full bg-violet-100 px-3 py-1">
              <span className="text-[12px] font-semibold uppercase tracking-widest text-violet-600">Features</span>
            </div>
            <h2 className="text-3xl font-semibold tracking-[-0.02em] text-slate-900 sm:text-4xl lg:text-[2.75rem]">
              Everything you need for{" "}
              <span className="gradient-text-blue">competitive intelligence</span>
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-slate-500">
              Powerful tools to monitor, analyze, and act on competitor data
            </p>
          </div>
          <div className="mt-20 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((feature) => {
              const Icon = feature.icon;
              return (
                <div key={feature.title} className="card-hover group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-8 shadow-sm">
                  {/* Coloured top accent line */}
                  <div className={`absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r ${feature.accent} opacity-0 transition-opacity group-hover:opacity-100`} />
                  <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${feature.bg}`}>
                    <Icon className={`h-5 w-5 ${feature.color}`} />
                  </div>
                  <h3 className="mt-5 text-[15px] font-semibold tracking-[-0.01em] text-slate-900">
                    {feature.title}
                  </h3>
                  <p className="mt-2.5 text-sm leading-relaxed text-slate-500">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          HOW IT WORKS — Light, clean with visual steps
          ═══════════════════════════════════════════ */}
      <section className="relative overflow-hidden bg-white py-32">
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <div className="mb-3 inline-flex items-center rounded-full bg-indigo-100 px-3 py-1">
              <span className="text-[12px] font-semibold uppercase tracking-widest text-indigo-600">How it works</span>
            </div>
            <h2 className="text-3xl font-semibold tracking-[-0.02em] text-slate-900 sm:text-4xl lg:text-[2.75rem]">
              Get started in{" "}
              <span className="gradient-text">three steps</span>
            </h2>
          </div>
          <div className="relative mt-20 grid gap-8 md:grid-cols-3">
            {/* Connecting gradient line on desktop */}
            <div className="absolute top-[3.25rem] left-[16.67%] right-[16.67%] hidden h-px md:block">
              <div className="h-full w-full bg-gradient-to-r from-violet-300 via-blue-300 to-pink-300" />
            </div>

            {HOW_IT_WORKS.map((item) => (
              <div key={item.step} className="relative rounded-2xl border border-slate-100 bg-slate-50/50 px-6 pb-8 pt-10 text-center">
                <div className={`relative z-10 mx-auto -mt-16 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br ${item.gradient} text-sm font-bold text-white shadow-lg ring-4 ring-white`}>
                  {item.step}
                </div>
                <h3 className="mt-5 text-lg font-semibold tracking-[-0.01em] text-slate-900">
                  {item.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-slate-500">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          DASHBOARD PREVIEW — Dark, dramatic contrast
          ═══════════════════════════════════════════ */}
      <section className="relative overflow-hidden bg-slate-950 py-32">
        <div className="absolute inset-0 grid-pattern" />
        {/* Ambient glow behind dashboard */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 h-[500px] w-[700px] rounded-full bg-gradient-to-r from-violet-500/15 via-indigo-500/10 to-blue-500/15 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <div className="mb-3 inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1">
              <span className="text-[12px] font-semibold uppercase tracking-widest text-violet-400">Dashboard</span>
            </div>
            <h2 className="text-3xl font-semibold tracking-[-0.02em] text-white sm:text-4xl lg:text-[2.75rem]">
              Every competitor move, <span className="gradient-text-blue whitespace-nowrap">one dashboard</span>
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-slate-400">
              Your competitors made 47 price changes last week. Prowl caught every single one.
            </p>
          </div>
          <div className="mt-16 rounded-2xl border border-white/10 bg-white/[0.03] p-1.5 shadow-2xl shadow-violet-500/10 backdrop-blur-sm">
            <div className="rounded-xl bg-slate-900/60 backdrop-blur-md p-6 sm:p-8">
              {/* Faux dashboard header */}
              <div className="flex items-center justify-between border-b border-white/10 pb-5">
                <div>
                  <p className="text-[13px] font-medium text-slate-500">Overview</p>
                  <p className="text-lg font-semibold text-white">Competitor Dashboard</p>
                </div>
                <div className="hidden sm:flex items-center gap-2">
                  <div className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-400">Last 7 days</div>
                  <div className="btn-gradient rounded-lg px-3 py-1.5 text-xs font-medium text-white">Export</div>
                </div>
              </div>
              {/* KPI row */}
              <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {[
                  { label: "Competitors", value: "12", change: null },
                  { label: "Price Changes", value: "47", change: "+12%" },
                  { label: "New Products", value: "23", change: "+8%" },
                  { label: "Active Alerts", value: "5", change: null },
                ].map((kpi) => (
                  <div key={kpi.label} className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-4">
                    <p className="text-[11px] font-medium uppercase tracking-wider text-slate-500">{kpi.label}</p>
                    <div className="mt-1 flex items-baseline gap-2">
                      <p className="text-2xl font-semibold text-white">{kpi.value}</p>
                      {kpi.change && (
                        <span className="text-[11px] font-medium text-emerald-400">{kpi.change}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              {/* Faux chart area */}
              <div className="mt-5 grid gap-3 lg:grid-cols-3">
                <div className="lg:col-span-2 rounded-xl border border-white/[0.08] bg-white/[0.03] p-5">
                  <p className="text-[13px] font-medium text-slate-300">Price Trends</p>
                  <div className="mt-4 flex items-end gap-1 h-32">
                    {[40, 45, 38, 52, 48, 56, 51, 62, 58, 65, 60, 68, 72, 70, 75, 73, 78, 82, 80, 85].map((h, i) => (
                      <div key={i} className="flex-1 rounded-sm bg-gradient-to-t from-violet-500 to-blue-400" style={{ height: `${h}%`, opacity: 0.4 + (i / 20) * 0.6 }} />
                    ))}
                  </div>
                </div>
                <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-5">
                  <p className="text-[13px] font-medium text-slate-300">Recent Changes</p>
                  <div className="mt-4 space-y-3">
                    {[
                      { name: "iPhone 15 Pro", change: "-£50", type: "down" },
                      { name: "Galaxy S24 Ultra", change: "+£30", type: "up" },
                      { name: "MacBook Air M3", change: "-£100", type: "down" },
                      { name: "AirPods Pro 2", change: "—", type: "same" },
                    ].map((item) => (
                      <div key={item.name} className="flex items-center justify-between">
                        <span className="text-[12px] text-slate-400 truncate pr-2">{item.name}</span>
                        <span className={`flex items-center gap-1 text-[12px] font-medium ${item.type === 'down' ? 'text-emerald-400' : item.type === 'up' ? 'text-red-400' : 'text-slate-500'}`}>
                          {item.type === 'down' && <TrendingDown className="h-3 w-3" />}
                          {item.type === 'up' && <TrendingUp className="h-3 w-3" />}
                          {item.type === 'same' && <Minus className="h-3 w-3" />}
                          {item.change}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          SOCIAL PROOF — Stats + credibility
          ═══════════════════════════════════════════ */}
      <section className="relative bg-white py-20 border-b border-slate-100">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {[
              { stat: "2,400+", label: "Brands on the waitlist" },
              { stat: "1.2M+", label: "Prices tracked in beta" },
              { stat: "<3 min", label: "Average alert delivery" },
              { stat: "99.7%", label: "Scraping accuracy" },
            ].map((item) => (
              <div key={item.label} className="text-center">
                <p className="text-3xl font-semibold tracking-[-0.02em] text-slate-900 sm:text-4xl">
                  {item.stat}
                </p>
                <p className="mt-2 text-[13px] text-slate-500">{item.label}</p>
              </div>
            ))}
          </div>
          <div className="mt-16 rounded-2xl border border-slate-200/80 bg-slate-50/50 p-8 sm:p-10">
            <div className="mx-auto max-w-3xl text-center">
              <p className="text-lg leading-relaxed text-slate-600 italic">
                &ldquo;We built Prowl because we were tired of manually checking competitor
                websites every morning. As an eCommerce operator, I was spending 5+ hours
                a week just tracking prices — and still missing changes that cost us margin.
                Prowl automates that entire workflow.&rdquo;
              </p>
              <div className="mt-6 flex items-center justify-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-purple-600 text-sm font-bold text-white">
                  P
                </div>
                <div className="text-left">
                  <p className="text-[14px] font-semibold text-slate-900">Prowl Team</p>
                  <p className="text-[12px] text-slate-500">Founder &amp; CEO</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          WHY PROWL — White, distinct card personalities
          ═══════════════════════════════════════════ */}
      <section className="relative overflow-hidden bg-white py-32">
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <div className="mb-3 inline-flex items-center rounded-full bg-amber-100 px-3 py-1">
              <span className="text-[12px] font-semibold uppercase tracking-widest text-amber-700">Why Prowl</span>
            </div>
            <h2 className="text-3xl font-semibold tracking-[-0.02em] text-slate-900 sm:text-4xl lg:text-[2.75rem]">
              Built for{" "}
              <span className="gradient-text-warm">eCommerce teams</span>
            </h2>
          </div>
          <div className="mt-20 grid gap-6 md:grid-cols-3">
            {WHY_PROWL.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className={`card-hover relative flex flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-gradient-to-br ${item.tint} p-8 shadow-sm`}>
                  <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${item.bg}`}>
                    <Icon className={`h-5 w-5 ${item.color}`} />
                  </div>
                  <h3 className="mt-5 text-[15px] font-semibold tracking-[-0.01em] text-slate-900">
                    {item.title}
                  </h3>
                  <p className="mt-3 flex-1 text-[14px] leading-relaxed text-slate-500">
                    {item.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          PRICING — Warm-tinted light, elevated cards
          ═══════════════════════════════════════════ */}
      <section id="pricing" className="relative overflow-hidden bg-[#f8f9fc] py-32">
        {/* Subtle mesh tints */}
        <div className="absolute top-20 right-0 h-[500px] w-[500px] rounded-full bg-violet-200/15 blur-3xl" />
        <div className="absolute bottom-20 left-0 h-[400px] w-[400px] rounded-full bg-pink-200/10 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <PricingSection />
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          FAQ — Clean light, refined accordion
          ═══════════════════════════════════════════ */}
      <section id="faq" className="relative bg-[#f8f9fc] py-32">
        <div className="relative mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="mb-3 inline-flex items-center rounded-full bg-blue-100 px-3 py-1">
              <span className="text-[12px] font-semibold uppercase tracking-widest text-blue-600">FAQ</span>
            </div>
            <h2 className="text-3xl font-semibold tracking-[-0.02em] text-slate-900 sm:text-4xl lg:text-[2.75rem]">
              Frequently asked{" "}
              <span className="gradient-text-blue">questions</span>
            </h2>
          </div>
          <div className="mt-14 rounded-2xl border border-slate-200/80 bg-white p-2 shadow-sm">
            <Accordion type="single" collapsible>
              {[
                {
                  q: "How does Prowl monitor competitor prices?",
                  a: "Prowl uses advanced web scraping technology to automatically visit competitor websites on a regular schedule. We extract product information, prices, and availability data, then compare it against previous records to detect changes.",
                },
                {
                  q: "Which eCommerce platforms do you support?",
                  a: "We support all major eCommerce platforms including Shopify, WooCommerce, and Magento, plus custom-built stores via our generic scraping engine. Our platform auto-detects the technology and applies optimized scraping strategies.",
                },
                {
                  q: "How quickly will I be notified of price changes?",
                  a: "Depending on your plan, we check competitor sites every 1-12 hours. When a change is detected, alerts are sent instantly via your configured channels (email, Slack, or in-app notifications).",
                },
                {
                  q: "Is web scraping legal?",
                  a: "Yes, we only scrape publicly available information that any consumer could access. Our practices comply with all applicable laws and we respect robots.txt directives.",
                },
                {
                  q: "Can I cancel my subscription anytime?",
                  a: "Absolutely! You can cancel your subscription at any time from your billing settings. Your access will continue until the end of your current billing period.",
                },
                {
                  q: "Do you offer a free trial?",
                  a: "Yes! All plans come with a 14-day free trial. No credit card required to start. You'll get full access to all features during the trial period.",
                },
              ].map((faq, i) => (
                <AccordionItem key={i} value={`faq-${i}`} className="border-slate-100 px-4">
                  <AccordionTrigger className="text-left text-[14px] font-medium text-slate-900 hover:text-violet-600 hover:no-underline">
                    {faq.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-[13px] leading-relaxed text-slate-500">
                    {faq.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          CTA BANNER — Full gradient, edge-to-edge
          ═══════════════════════════════════════════ */}
      <section className="relative gradient-cta py-28 overflow-hidden">
        <div className="absolute -top-24 -left-24 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-24 -right-24 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-48 w-96 rounded-full bg-white/5 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-semibold tracking-[-0.02em] text-white sm:text-5xl">
            Stop losing margin to pricing moves you didn&apos;t see coming
          </h2>
          <p className="mx-auto mt-5 max-w-md text-lg text-white/70">
            Join the waitlist — first 100 get 3 months free when we launch in March 2026.
          </p>
          <div className="mt-10 flex justify-center">
            <WaitlistForm variant="cta" />
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          FOOTER — Dark, anchors the page
          ═══════════════════════════════════════════ */}
      <footer className="bg-slate-950 border-t border-white/5 py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <Link href="/" className="text-xl font-bold tracking-tight">
                <span className="gradient-text">Prowl</span>
              </Link>
              <p className="mt-4 text-[13px] leading-relaxed text-slate-500">
                Competitor intelligence for eCommerce brands. Monitor pricing,
                products, and promotions 24/7.
              </p>
            </div>
            <div>
              <h3 className="text-[13px] font-semibold text-white">Product</h3>
              <ul className="mt-4 space-y-3">
                {[
                  { label: "Features", href: "#features" },
                  { label: "Pricing", href: "#pricing" },
                  { label: "FAQ", href: "#faq" },
                ].map((item) => (
                  <li key={item.label}>
                    <a href={item.href} className="text-[13px] text-slate-500 transition-colors hover:text-slate-300">
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-[13px] font-semibold text-white">Account</h3>
              <ul className="mt-4 space-y-3">
                {[
                  { label: "Log in", href: "/login" },
                  { label: "Sign up", href: "/signup" },
                ].map((item) => (
                  <li key={item.label}>
                    <Link href={item.href} className="text-[13px] text-slate-500 transition-colors hover:text-slate-300">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-[13px] font-semibold text-white">Legal</h3>
              <ul className="mt-4 space-y-3">
                <li>
                  <span className="text-[13px] text-slate-600">
                    Privacy Policy &mdash; coming soon
                  </span>
                </li>
                <li>
                  <span className="text-[13px] text-slate-600">
                    Terms of Service &mdash; coming soon
                  </span>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-14 border-t border-white/5 pt-8 text-center text-[13px] text-slate-500">
            &copy; {new Date().getFullYear()} Prowl. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
