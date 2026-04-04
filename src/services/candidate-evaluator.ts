import { geminiFlash } from "@/lib/gemini";

export interface EvaluationInput {
  candidateName: string;
  profileText: string;
  profileTitle?: string;
  jobDescription: string;
  jobTitle?: string;
  jobLocation?: string;
}

export interface EvaluationResult {
  matchScore: number;
  matchBand: "below_50" | "50_to_70" | "above_70";
  whyMatched: string[];
}

const SYSTEM_PROMPT = `Score LinkedIn profile 0-100 based on job match.

Criteria:
- Title match: 20pts
- Experience: 30pts
- Industry: 20pts
- Seniority: 15pts
- Skills: 15pts

Return JSON only:
{
  "candidate_name": "Name",
  "linkedin_url": "URL",
  "match_score": 75,
  "match_band": "above_70",
  "why_matched": ["Evidence 1", "Evidence 2", "Evidence 3"]
}

Bands: "below_50" | "50_to_70" | "above_70"

CRITICAL: Respond ONLY with valid JSON. No markdown, no code fences, no explanation.`;

export async function evaluateCandidate(
  input: EvaluationInput
): Promise<EvaluationResult> {
  const userPrompt = `Job Description:
${input.jobDescription}

${input.jobTitle ? `Job Title: ${input.jobTitle}` : ""}
${input.jobLocation ? `Job Location: ${input.jobLocation}` : ""}

Candidate Profile:
Name: ${input.candidateName}
${input.profileTitle ? `Title: ${input.profileTitle}` : ""}

Profile:
${input.profileText}`;

  const result = await geminiFlash.generateContent(
    SYSTEM_PROMPT + "\n\n" + userPrompt
  );

  const text = result.response.text().trim();

  // Strip markdown code fences if present
  const jsonStr = text
    .replace(/```json\n?/g, "")
    .replace(/```\n?/g, "")
    .trim();

  let parsed: Record<string, unknown>;
  try {
    parsed = JSON.parse(jsonStr);
  } catch {
    throw new Error(`Failed to parse AI evaluation response: ${jsonStr.substring(0, 200)}`);
  }

  const clamp = (n: unknown) =>
    Math.max(0, Math.min(100, Math.round(Number(n) || 0)));

  const rawBand = String(parsed.match_band ?? "");
  const matchBand: EvaluationResult["matchBand"] =
    rawBand === "below_50" || rawBand === "50_to_70" || rawBand === "above_70"
      ? rawBand
      : "below_50";

  return {
    matchScore: clamp(parsed.match_score),
    matchBand,
    whyMatched: Array.isArray(parsed.why_matched)
      ? parsed.why_matched.map(String)
      : [],
  };
}
