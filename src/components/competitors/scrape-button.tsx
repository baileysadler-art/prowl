"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, RefreshCw } from "lucide-react";
import { toast } from "sonner";

interface ScrapeButtonProps {
  competitorId: string;
}

export function ScrapeButton({ competitorId }: ScrapeButtonProps) {
  const [loading, setLoading] = useState(false);

  async function handleScrape() {
    setLoading(true);
    try {
      const res = await fetch("/api/scraper/trigger", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ competitorId }),
      });

      if (!res.ok) {
        throw new Error("Scrape failed");
      }

      const data = await res.json();
      toast.success(
        `Scrape completed: ${data.productsFound || 0} products found, ${data.changesDetected || 0} changes detected`
      );
    } catch {
      toast.error("Failed to trigger scrape");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleScrape}
      disabled={loading}
    >
      {loading ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <RefreshCw className="mr-2 h-4 w-4" />
      )}
      Scrape Now
    </Button>
  );
}
