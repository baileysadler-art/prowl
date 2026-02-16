"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

export default function NewCompetitorPage() {
  const [name, setName] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [pages, setPages] = useState("");
  const [frequency, setFrequency] = useState("every_12h");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    // Get user's org
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data: profileData } = await supabase
      .from("users")
      .select("organization_id")
      .eq("id", user.id)
      .single();

    const profile = profileData as any;
    if (!profile?.organization_id) {
      toast.error("Could not find your organization");
      setLoading(false);
      return;
    }

    // Check plan limit
    const { count } = await supabase
      .from("competitors")
      .select("*", { count: "exact", head: true })
      .eq("organization_id", profile.organization_id);

    const { data: subData } = await supabase
      .from("subscriptions")
      .select("competitor_limit")
      .eq("organization_id", profile.organization_id)
      .single();
    const sub = subData as any;

    if (sub && count !== null && count >= sub.competitor_limit && sub.competitor_limit > 0) {
      toast.error("You've reached your competitor limit. Please upgrade your plan.");
      setLoading(false);
      return;
    }

    // Create competitor
    const { data: competitor, error } = await (supabase
      .from("competitors") as any)
      .insert({
        organization_id: profile.organization_id,
        name,
        website_url: websiteUrl.startsWith("http")
          ? websiteUrl
          : `https://${websiteUrl}`,
        scrape_frequency: frequency,
      })
      .select()
      .single();

    if (error) {
      toast.error("Failed to add competitor");
      setLoading(false);
      return;
    }

    // Add pages if provided
    if (pages.trim() && competitor) {
      const pageUrls = pages
        .split("\n")
        .map((p) => p.trim())
        .filter(Boolean);

      if (pageUrls.length > 0) {
        await (supabase.from("competitor_pages") as any).insert(
          pageUrls.map((url) => ({
            competitor_id: competitor.id,
            url: url.startsWith("http") ? url : `https://${url}`,
            page_type: "collection" as const,
          }))
        );
      }
    }

    toast.success("Competitor added successfully");
    router.push("/dashboard/competitors");
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Add Competitor" description="Start tracking a new competitor">
        <Link href="/dashboard/competitors">
          <Button variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </Link>
      </PageHeader>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Competitor Details</CardTitle>
          <CardDescription>
            Enter the competitor&apos;s website details to start monitoring
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Competitor Name</Label>
              <Input
                id="name"
                placeholder="e.g. Acme Store"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="url">Website URL</Label>
              <Input
                id="url"
                placeholder="https://www.example.com"
                value={websiteUrl}
                onChange={(e) => setWebsiteUrl(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="pages">
                Pages to Monitor{" "}
                <span className="text-slate-400">(one URL per line)</span>
              </Label>
              <Textarea
                id="pages"
                placeholder={"https://www.example.com/collections/all\nhttps://www.example.com/products"}
                value={pages}
                onChange={(e) => setPages(e.target.value)}
                rows={4}
              />
              <p className="text-xs text-slate-500">
                Add specific collection or category pages to scrape for products
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="frequency">Scrape Frequency</Label>
              <Select value={frequency} onValueChange={setFrequency}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="every_1h">Every hour</SelectItem>
                  <SelectItem value="every_2h">Every 2 hours</SelectItem>
                  <SelectItem value="every_6h">Every 6 hours</SelectItem>
                  <SelectItem value="every_12h">Every 12 hours</SelectItem>
                  <SelectItem value="every_24h">Every 24 hours</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-3">
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Add Competitor
              </Button>
              <Link href="/dashboard/competitors">
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
