"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";

export function MobileNav() {
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden">
      <button
        onClick={() => setOpen(!open)}
        className="rounded-lg border border-white/10 bg-white/5 p-2 text-slate-400 transition-colors hover:text-white"
        aria-label="Toggle menu"
      >
        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {open && (
        <div className="absolute left-0 right-0 top-20 z-50 border-b border-white/10 bg-slate-950/95 backdrop-blur-lg">
          <div className="flex flex-col gap-1 px-4 py-4">
            <a
              href="#features"
              onClick={() => setOpen(false)}
              className="rounded-lg px-4 py-3 text-[14px] font-medium text-slate-300 transition-colors hover:bg-white/5 hover:text-white"
            >
              Features
            </a>
            <a
              href="#pricing"
              onClick={() => setOpen(false)}
              className="rounded-lg px-4 py-3 text-[14px] font-medium text-slate-300 transition-colors hover:bg-white/5 hover:text-white"
            >
              Pricing
            </a>
            <a
              href="#faq"
              onClick={() => setOpen(false)}
              className="rounded-lg px-4 py-3 text-[14px] font-medium text-slate-300 transition-colors hover:bg-white/5 hover:text-white"
            >
              FAQ
            </a>
            <Link
              href="/login"
              onClick={() => setOpen(false)}
              className="rounded-lg px-4 py-3 text-[14px] font-medium text-slate-300 transition-colors hover:bg-white/5 hover:text-white"
            >
              Log in
            </Link>
            <Link
              href="/signup"
              onClick={() => setOpen(false)}
              className="mt-2 btn-gradient rounded-lg px-4 py-3 text-center text-[14px] font-medium text-white"
            >
              Start Free Trial
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
