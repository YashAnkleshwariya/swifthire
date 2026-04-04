import { getExaClient } from "@/lib/exa";

export interface ExaCandidate {
  name: string;
  linkedinUrl: string;
  profileText: string;
  profileTitle: string;
  location: string;
  workHistory: Record<string, unknown> | null;
  exaScore: number;
}

export async function searchLinkedInProfiles(
  query: string,
  limit: number = 10
): Promise<ExaCandidate[]> {
  // Request extra results to compensate for non-profile URLs filtered out below
  const fetchCount = Math.min(limit * 3, 100);

  const exa = getExaClient();
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore - category and highlights parameters are valid but not in exa-js types yet
  const results = await exa.searchAndContents(query, {
    numResults: fetchCount,
    type: "auto",
    category: "people",
    highlights: { maxCharacters: 4000 },
  });

  const seen = new Set<string>();
  const candidates: ExaCandidate[] = [];

  for (const r of results.results) {
    // Only keep actual profile URLs
    if (!r.url || !r.url.includes("linkedin.com/in/")) continue;

    // Deduplicate by URL
    const normalizedUrl = r.url.split("?")[0].replace(/\/$/, "");
    if (seen.has(normalizedUrl)) continue;
    seen.add(normalizedUrl);

    const profileText = (r.highlights ?? []).join("\n\n");

    candidates.push({
      name: extractName(r.title ?? "", r.url),
      linkedinUrl: normalizedUrl,
      profileText,
      profileTitle: extractTitle(r.title ?? ""),
      location: extractLocation(profileText),
      workHistory: null,
      exaScore: r.score ?? 0,
    });
  }

  return candidates.slice(0, limit);
}

function extractName(title: string, url: string): string {
  // LinkedIn titles are typically "FirstName LastName - Title | LinkedIn"
  const dashIndex = title.indexOf(" - ");
  if (dashIndex > 0) return title.substring(0, dashIndex).trim();

  const pipeIndex = title.indexOf(" | ");
  if (pipeIndex > 0) return title.substring(0, pipeIndex).trim();

  // Fallback: extract from URL slug
  const slug = url.split("/in/")[1]?.replace(/\/$/, "") ?? "Unknown";
  return slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function extractTitle(title: string): string {
  // Extract the job title portion: "Name - Title | LinkedIn"
  const dashIndex = title.indexOf(" - ");
  if (dashIndex > 0) {
    const afterDash = title.substring(dashIndex + 3);
    const pipeIndex = afterDash.indexOf(" | ");
    return pipeIndex > 0
      ? afterDash.substring(0, pipeIndex).trim()
      : afterDash.trim();
  }
  return title.substring(0, 200);
}

function extractLocation(text: string): string {
  const match = text.match(
    /(?:located?\s+in|based\s+in|📍|location[:\s])\s*([^\n,.]+)/i
  );
  return match?.[1]?.trim() ?? "";
}
