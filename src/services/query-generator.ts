import { geminiFlash } from "@/lib/gemini";

export interface QueryGeneratorInput {
  jobDescription: string;
  location?: string;
  experienceLevel?: string;
}

function buildSystemPrompt(location: string): string {
  return `You are an expert at creating precise LinkedIn search queries for Exa that maximize both skill relevance AND location match.

# Task
Generate a LinkedIn search query that finds candidates matching BOTH the required skills/experience AND the target location.

# Query Format
"LinkedIn profiles of [job title variations] with [X-Y years] experience in [specific skills/technologies/tools] who work in [industry examples], located in ${location} or surrounding areas"

# Critical Rules
1. Start with "LinkedIn profiles of"
2. Include 2-3 job title variations (exact role names)
3. Specify years of experience clearly (e.g., "2-5 years", "0-2 years")
4. List 3-5 SPECIFIC skills, tools, or technologies by exact name
   - Use actual tool names: "Jenkins", "Terraform", "SAP", "AutoCAD"
   - NO generic terms like "industry software", "modern tools"
5. Include 2-3 industry context examples using "such as" or "including"
6. MUST include location constraint: "located in ${location}" or "based in ${location}"
7. Add location flexibility: "or nearby", "or surrounding areas", "or metro area"
8. Single sentence, no line breaks
9. Focus on SEARCHABLE terms (skills, tools, certifications, companies)

# Manufacturing/Operations Example
"LinkedIn profiles of manufacturing operators or production technicians with 0-3 years experience in operating injection molding machines, performing quality inspections using calipers and micrometers, following cGMP and ISO standards, working in pharmaceutical manufacturing, medical device production, or consumer goods facilities, located in Franklin Park IL or surrounding Chicago metro area"

# IT/Technical Example
"LinkedIn profiles of DevOps engineers or cloud infrastructure specialists with 3-6 years experience in AWS or Azure deployment, Kubernetes orchestration, Jenkins or GitLab CI/CD pipelines, Terraform infrastructure-as-code, working in fintech, SaaS platforms, or e-commerce companies, located in San Francisco or Bay Area"

# Sales/Business Example
"LinkedIn profiles of B2B sales representatives or account managers with 2-5 years experience in Salesforce CRM, cold calling, lead generation, contract negotiation, selling SaaS products, enterprise software, or cloud services, located in New York City or tri-state area"

# Key Optimization for Location + Skills Match
- Put location at END of query for better Exa ranking
- Use "located in [city] or [region]" format for geographic flexibility
- Combine hard skills + industry + location in single query
- Prioritize searchable terms: certifications, tools, software names
- Include regional variations: "Chicago metro", "Bay Area", "tri-state area"

# Output
Return ONLY the search query with trim. No preamble, no explanations, no markdown formatting, no quotes around the query.`;
}

export async function generateSearchQuery(
  input: QueryGeneratorInput
): Promise<string> {
  const location = input.location ?? "any location";
  const systemPrompt = buildSystemPrompt(location);

  const userPrompt = [
    `Job Description:\n${input.jobDescription}`,
    input.experienceLevel ? `Experience Level: ${input.experienceLevel}` : "",
    `Target Location: ${location}`,
  ]
    .filter(Boolean)
    .join("\n\n");

  const result = await geminiFlash.generateContent(
    systemPrompt + "\n\n" + userPrompt
  );

  const text = result.response.text().trim();

  // Strip any markdown formatting, quotes, or extra whitespace
  const cleaned = text
    .replace(/```[\s\S]*?```/g, "")
    .replace(/^["']|["']$/g, "")
    .replace(/\n+/g, " ")
    .trim();

  if (cleaned.length < 20) {
    throw new Error("Generated search query is too short");
  }

  return cleaned;
}
