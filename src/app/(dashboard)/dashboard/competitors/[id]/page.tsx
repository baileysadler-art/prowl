import { notFound } from "next/navigation";
import Link from "next/link";
import { getOrgId } from "@/lib/auth";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CompetitorOverview } from "@/components/competitors/competitor-overview";
import { CompetitorProducts } from "@/components/competitors/competitor-products";
import { CompetitorChanges } from "@/components/competitors/competitor-changes";
import { CompetitorActivity } from "@/components/competitors/competitor-activity";
import { ScrapeButton } from "@/components/competitors/scrape-button";
import { ArrowLeft, Globe, ExternalLink } from "lucide-react";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function CompetitorDetailPage({ params }: Props) {
  const { id } = await params;
  const { supabase } = await getOrgId();

  const { data } = await supabase
    .from("competitors")
    .select("*")
    .eq("id", id)
    .single();

  const competitor = data as any;
  if (!competitor) {
    notFound();
  }

  const [
    { data: products },
    { data: changes },
    { data: scrapeJobs },
    { data: pages },
  ] = await Promise.all([
    supabase
      .from("products")
      .select("*")
      .eq("competitor_id", id)
      .order("name"),
    supabase
      .from("product_changes")
      .select("*, products!inner(name, url)")
      .eq("products.competitor_id", id)
      .order("detected_at", { ascending: false })
      .limit(50),
    supabase
      .from("scrape_jobs")
      .select("*")
      .eq("competitor_id", id)
      .order("created_at", { ascending: false })
      .limit(20),
    supabase
      .from("competitor_pages")
      .select("*")
      .eq("competitor_id", id)
      .order("created_at"),
  ]);

  const statusColors: Record<string, string> = {
    active: "bg-emerald-50 text-emerald-700",
    paused: "bg-slate-50 text-slate-700",
    error: "bg-red-50 text-red-700",
  };

  return (
    <div className="space-y-6">
      <PageHeader title={competitor.name}>
        <div className="flex items-center gap-2">
          <ScrapeButton competitorId={competitor.id} />
          <a
            href={competitor.website_url}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button variant="outline" size="sm">
              <ExternalLink className="mr-2 h-4 w-4" />
              Visit Site
            </Button>
          </a>
          <Link href="/dashboard/competitors">
            <Button variant="outline" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          </Link>
        </div>
      </PageHeader>

      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100">
          <Globe className="h-5 w-5 text-slate-600" />
        </div>
        <div>
          <p className="text-sm text-slate-500">{competitor.website_url}</p>
        </div>
        <Badge
          variant="secondary"
          className={statusColors[competitor.status]}
        >
          {competitor.status}
        </Badge>
      </div>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="products">
            Products ({(products as any)?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="changes">Price Changes</TabsTrigger>
          <TabsTrigger value="activity">Activity Log</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <CompetitorOverview
            competitor={competitor}
            productCount={(products as any)?.length || 0}
            changeCount={(changes as any)?.length || 0}
            pages={(pages || []) as any}
          />
        </TabsContent>

        <TabsContent value="products" className="mt-6">
          <CompetitorProducts products={(products || []) as any} />
        </TabsContent>

        <TabsContent value="changes" className="mt-6">
          <CompetitorChanges changes={(changes || []) as any} />
        </TabsContent>

        <TabsContent value="activity" className="mt-6">
          <CompetitorActivity jobs={(scrapeJobs || []) as any} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
