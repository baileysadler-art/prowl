/**
 * Cheerio-based HTML fetching and parsing strategy.
 * Fetches a URL with a rotating user agent and loads it into Cheerio for DOM traversal.
 */

import * as cheerio from "cheerio";
import { getRandomUserAgent, retryWithBackoff } from "@/lib/scraper/utils";

/**
 * Fetches HTML from the given URL and returns a Cheerio instance for DOM manipulation.
 * Uses a randomized user agent to reduce detection, and retries on failure with backoff.
 * Throws an error if the fetch fails after retries or the response is not OK.
 */
export async function fetchAndParse(url: string): Promise<cheerio.CheerioAPI> {
  const html = await retryWithBackoff(async () => {
    const response = await fetch(url, {
      headers: {
        "User-Agent": getRandomUserAgent(),
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
        "Accept-Encoding": "gzip, deflate, br",
        "Cache-Control": "no-cache",
        Pragma: "no-cache",
        "Sec-Fetch-Dest": "document",
        "Sec-Fetch-Mode": "navigate",
        "Sec-Fetch-Site": "none",
        "Sec-Fetch-User": "?1",
        "Upgrade-Insecure-Requests": "1",
      },
      redirect: "follow",
      signal: AbortSignal.timeout(30000),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText} for ${url}`);
    }

    return await response.text();
  }, 3, 2000);

  return cheerio.load(html);
}
