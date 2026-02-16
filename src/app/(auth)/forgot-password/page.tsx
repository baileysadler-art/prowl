"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, ArrowLeft } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
  }

  if (success) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-lg shadow-black/5">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-slate-900">Check your email</h2>
          <p className="mt-1 text-sm text-slate-500">
            We sent a password reset link to <strong>{email}</strong>
          </p>
        </div>
        <Link href="/login" className="block">
          <Button variant="outline" className="w-full rounded-lg">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to sign in
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-lg shadow-black/5">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-slate-900">Forgot password</h2>
        <p className="mt-1 text-sm text-slate-500">
          Enter your email and we&apos;ll send you a reset link
        </p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="rounded-lg bg-red-50 border border-red-100 p-3 text-sm text-red-600">
            {error}
          </div>
        )}
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="you@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="rounded-lg border-slate-200 bg-white"
            required
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="btn-gradient flex w-full items-center justify-center rounded-lg py-2.5 text-sm font-semibold text-white disabled:opacity-70"
        >
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Send reset link
        </button>
        <p className="text-center">
          <Link
            href="/login"
            className="text-sm text-slate-500 hover:text-rose-600"
          >
            Back to sign in
          </Link>
        </p>
      </form>
    </div>
  );
}
