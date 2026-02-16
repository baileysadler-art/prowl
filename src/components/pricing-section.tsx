"use client";

import { useState } from "react";
import Link from "next/link";
import { Check } from "lucide-react";
import { PRICING_TIERS } from "@/lib/constants";

export function PricingSection() {
  const [annual, setAnnual] = useState(false);

  return (
    <>
      <div className="mx-auto max-w-2xl text-center">
        <div className="mb-3 inline-flex items-center rounded-full bg-violet-100 px-3 py-1">
          <span className="text-[12px] font-semibold uppercase tracking-widest text-violet-600">Pricing</span>
        </div>
        <h2 className="text-3xl font-semibold tracking-[-0.02em] text-slate-900 sm:text-4xl lg:text-[2.75rem]">
          Simple,{" "}
          <span className="gradient-text">transparent pricing</span>
        </h2>
        <p className="mt-4 text-lg leading-relaxed text-slate-500">
          Start free for 14 days. No credit card required.
        </p>

        {/* Annual toggle */}
        <div className="mt-8 inline-flex items-center gap-3 rounded-full border border-slate-200 bg-white p-1 shadow-sm">
          <button
            onClick={() => setAnnual(false)}
            className={`rounded-full px-4 py-2 text-[13px] font-medium transition-all ${
              !annual
                ? "bg-slate-900 text-white shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setAnnual(true)}
            className={`rounded-full px-4 py-2 text-[13px] font-medium transition-all ${
              annual
                ? "bg-slate-900 text-white shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            Annual
            <span className="ml-1.5 rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
              Save 20%
            </span>
          </button>
        </div>
      </div>

      <div className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {PRICING_TIERS.map((tier) => {
          const isEnterprise = "isEnterprise" in tier;
          const displayPrice = annual ? tier.annualPrice : tier.price;

          return (
            <div
              key={tier.name}
              className={`relative rounded-2xl ${
                tier.popular
                  ? "gradient-border bg-white shadow-xl shadow-violet-200/40 scale-[1.02]"
                  : "card-hover border border-slate-200/80 bg-white shadow-sm"
              }`}
            >
              {tier.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                  <span className="btn-gradient inline-flex items-center rounded-full px-3 py-1 text-[11px] font-medium text-white shadow-md shadow-violet-300/30">
                    Most Popular
                  </span>
                </div>
              )}
              <div className="p-6">
                <h3 className="text-[15px] font-semibold text-slate-900">{tier.name}</h3>
                <p className="mt-1 text-[13px] text-slate-500">{tier.description}</p>
                <p className="mt-2 text-[12px] font-medium text-violet-600">
                  Best for: {tier.bestFor}
                </p>
                <div className="mt-5">
                  {isEnterprise ? (
                    <span className="text-3xl font-semibold tracking-[-0.02em] text-slate-900">
                      Custom
                    </span>
                  ) : (
                    <>
                      <span className="text-4xl font-semibold tracking-[-0.02em] text-slate-900">
                        £{displayPrice}
                      </span>
                      <span className="text-sm text-slate-400">/{tier.period}</span>
                      {annual && (
                        <span className="ml-2 text-[12px] text-slate-400 line-through">
                          £{tier.price}
                        </span>
                      )}
                    </>
                  )}
                </div>
                <ul className="mt-6 space-y-3">
                  {tier.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-start gap-2.5 text-[13px] text-slate-600"
                    >
                      <Check className={`mt-0.5 h-3.5 w-3.5 shrink-0 ${tier.popular ? "text-violet-500" : "text-slate-400"}`} />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link href={isEnterprise ? "#" : "/signup"} className="block mt-8">
                  {isEnterprise ? (
                    <button className="w-full rounded-lg border border-slate-200 bg-white py-2.5 text-[13px] font-medium text-slate-700 transition-all hover:border-violet-200 hover:text-violet-700 hover:shadow-sm">
                      Contact Sales
                    </button>
                  ) : tier.popular ? (
                    <button className="btn-gradient w-full rounded-lg py-2.5 text-[13px] font-medium text-white">
                      Start Free Trial
                    </button>
                  ) : (
                    <button className="w-full rounded-lg border border-slate-200 bg-white py-2.5 text-[13px] font-medium text-slate-700 transition-all hover:border-violet-200 hover:text-violet-700 hover:shadow-sm">
                      Start Free Trial
                    </button>
                  )}
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
