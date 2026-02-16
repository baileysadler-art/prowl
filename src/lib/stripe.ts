import Stripe from "stripe";

export const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2026-01-28.clover",
      typescript: true,
    })
  : (null as unknown as Stripe);

export const PLAN_PRICES: Record<string, { priceId: string; competitorLimit: number; scrapeInterval: number }> = {
  starter: {
    priceId: process.env.STRIPE_STARTER_PRICE_ID || "price_starter",
    competitorLimit: 3,
    scrapeInterval: 12,
  },
  professional: {
    priceId: process.env.STRIPE_PRO_PRICE_ID || "price_professional",
    competitorLimit: 10,
    scrapeInterval: 6,
  },
  business: {
    priceId: process.env.STRIPE_BUSINESS_PRICE_ID || "price_business",
    competitorLimit: 25,
    scrapeInterval: 2,
  },
  enterprise: {
    priceId: process.env.STRIPE_ENTERPRISE_PRICE_ID || "price_enterprise",
    competitorLimit: -1,
    scrapeInterval: 1,
  },
};
