import { inngest } from "@/inngest/client";
import { getAdminClient } from "@/lib/supabase/admin";
import { generateSearchQuery } from "@/services/query-generator";
import { searchLinkedInProfiles } from "@/services/exa-search";
import { evaluateCandidate } from "@/services/candidate-evaluator";

export const processJob = inngest.createFunction(
  {
    id: "process-job",
    retries: 3,
    triggers: [{ event: "job/process" }],
  },
  async ({ event, step }) => {
    const { jobId } = (event.data as { jobId: string });

    // Step 1: Mark job as processing and fetch it
    const job = await step.run("fetch-and-start", async () => {
      const admin = getAdminClient();
      const now = new Date().toISOString();
      const { data: j, error } = await admin.from("Job").select("*").eq("id", jobId).single();
      if (error || !j) throw new Error(`Job not found: ${jobId}`);
      await admin.from("Job").update({ status: "PROCESSING", updatedAt: now }).eq("id", jobId);
      await admin.from("ProcessingJob").update({ status: "PROCESSING", startedAt: now, updatedAt: now }).eq("jobId", jobId);
      return j as {
        id: string;
        title: string;
        description: string;
        location: string | null;
        experienceLevel: string | null;
        candidateLimit: number;
      };
    });

    // Step 2: Generate search query via Gemini
    const searchQuery = await step.run("generate-query", async () => {
      const admin = getAdminClient();
      const now = new Date().toISOString();
      await admin.from("ProcessingJob").update({ currentStep: "GENERATING_QUERY", progress: 10, updatedAt: now }).eq("jobId", jobId);
      const query = await generateSearchQuery({
        jobDescription: job.description,
        location: job.location ?? undefined,
        experienceLevel: job.experienceLevel ?? undefined,
      });
      await admin.from("Job").update({ searchQuery: query, updatedAt: now }).eq("id", jobId);
      return query;
    });

    // Step 3: Search LinkedIn profiles via Exa
    const exaCandidates = await step.run("search-linkedin", async () => {
      const admin = getAdminClient();
      const now = new Date().toISOString();
      await admin.from("ProcessingJob").update({ currentStep: "SEARCHING_LINKEDIN", progress: 30, updatedAt: now }).eq("jobId", jobId);
      return searchLinkedInProfiles(searchQuery, job.candidateLimit);
    });

    // No candidates found — complete early
    if (exaCandidates.length === 0) {
      await step.run("complete-empty", async () => {
        const admin = getAdminClient();
        const now = new Date().toISOString();
        await admin.from("Job").update({ status: "COMPLETED", totalCandidatesFound: 0, updatedAt: now }).eq("id", jobId);
        await admin.from("ProcessingJob").update({
          status: "COMPLETED",
          currentStep: "NO_CANDIDATES_FOUND",
          progress: 100,
          completedAt: now,
          updatedAt: now,
        }).eq("jobId", jobId);
      });
      return;
    }

    // Step 4: Save candidates to DB
    const savedCandidates = await step.run("save-candidates", async () => {
      const admin = getAdminClient();
      const now = new Date().toISOString();
      await admin.from("ProcessingJob").update({ currentStep: "SAVING_CANDIDATES", progress: 40, updatedAt: now }).eq("jobId", jobId);

      const inserts = exaCandidates.map((c) => ({
        id: crypto.randomUUID(),
        jobId,
        name: c.name,
        linkedinUrl: c.linkedinUrl,
        profileText: c.profileText,
        profileTitle: c.profileTitle,
        location: c.location,
        workHistory: c.workHistory ? JSON.parse(JSON.stringify(c.workHistory)) : null,
        exaScore: c.exaScore,
        createdAt: now,
        updatedAt: now,
      }));

      const { data, error } = await admin.from("Candidate").insert(inserts).select("id");
      if (error) throw new Error(`Failed to save candidates: ${error.message}`);
      return (data as { id: string }[]);
    });

    // Step 5: Evaluate each candidate
    const evaluations: { candidateId: string; score: number }[] = [];

    for (let i = 0; i < savedCandidates.length; i++) {
      const result = await step.run(`evaluate-candidate-${i}`, async () => {
        const admin = getAdminClient();
        const candidate = savedCandidates[i];
        const exaCandidate = exaCandidates[i];
        const progress = 50 + Math.round(((i + 1) / savedCandidates.length) * 40);
        const now = new Date().toISOString();

        await admin.from("ProcessingJob").update({
          currentStep: `EVALUATING_CANDIDATES (${i + 1}/${savedCandidates.length})`,
          progress,
          updatedAt: now,
        }).eq("jobId", jobId);

        try {
          const evalResult = await evaluateCandidate({
            candidateName: exaCandidate.name,
            profileText: exaCandidate.profileText,
            profileTitle: exaCandidate.profileTitle,
            jobDescription: job.description,
            jobTitle: job.title,
            jobLocation: job.location ?? undefined,
          });

          await admin.from("Evaluation").insert({
            id: crypto.randomUUID(),
            candidateId: candidate.id,
            matchScore: evalResult.matchScore,
            matchBand: evalResult.matchBand,
            whyMatched: evalResult.whyMatched,
            createdAt: now,
          });

          return { candidateId: candidate.id, score: evalResult.matchScore };
        } catch {
          await admin.from("Evaluation").insert({
            id: crypto.randomUUID(),
            candidateId: candidate.id,
            matchScore: 0,
            matchBand: "below_50",
            whyMatched: [],
            createdAt: now,
          });
          return { candidateId: candidate.id, score: 0 };
        }
      });

      evaluations.push(result);
    }

    // Step 6: Rank candidates and mark complete
    await step.run("rank-and-complete", async () => {
      const admin = getAdminClient();
      const now = new Date().toISOString();
      await admin.from("ProcessingJob").update({ currentStep: "RANKING_RESULTS", progress: 95, updatedAt: now }).eq("jobId", jobId);

      evaluations.sort((a, b) => b.score - a.score);

      await Promise.all(
        evaluations.map((e, idx) =>
          admin.from("Candidate").update({ rank: idx + 1, updatedAt: now }).eq("id", e.candidateId)
        )
      );

      await admin.from("Job").update({ status: "COMPLETED", totalCandidatesFound: savedCandidates.length, updatedAt: now }).eq("id", jobId);
      await admin.from("ProcessingJob").update({
        status: "COMPLETED",
        currentStep: "DONE",
        progress: 100,
        completedAt: now,
        updatedAt: now,
      }).eq("jobId", jobId);
    });
  }
);
