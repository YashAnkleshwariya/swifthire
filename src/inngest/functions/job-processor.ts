import { inngest } from "@/inngest/client";
import prisma from "@/lib/prisma";
import { generateSearchQuery } from "@/services/query-generator";
import { searchLinkedInProfiles } from "@/services/exa-search";
import { evaluateCandidate } from "@/services/candidate-evaluator";

export const processJob = inngest.createFunction(
  { id: "process-job", retries: 3 },
  { event: "job/process" },
  async ({ event, step }) => {
    const { jobId } = event.data as { jobId: string };

    // Step 1: Mark job as processing and fetch it
    const job = await step.run("fetch-and-start", async () => {
      const j = await prisma.job.findUniqueOrThrow({ where: { id: jobId } });
      await prisma.job.update({ where: { id: jobId }, data: { status: "PROCESSING" } });
      await prisma.processingJob.update({
        where: { jobId },
        data: { status: "PROCESSING", startedAt: new Date() },
      });
      return j;
    });

    // Step 2: Generate search query via Gemini
    const searchQuery = await step.run("generate-query", async () => {
      await prisma.processingJob.update({
        where: { jobId },
        data: { currentStep: "GENERATING_QUERY", progress: 10 },
      });
      const query = await generateSearchQuery({
        jobDescription: job.description,
        location: job.location ?? undefined,
        experienceLevel: job.experienceLevel ?? undefined,
      });
      await prisma.job.update({ where: { id: jobId }, data: { searchQuery: query } });
      return query;
    });

    // Step 3: Search LinkedIn profiles via Exa
    const exaCandidates = await step.run("search-linkedin", async () => {
      await prisma.processingJob.update({
        where: { jobId },
        data: { currentStep: "SEARCHING_LINKEDIN", progress: 30 },
      });
      return searchLinkedInProfiles(searchQuery, job.candidateLimit);
    });

    // No candidates found — complete early
    if (exaCandidates.length === 0) {
      await step.run("complete-empty", async () => {
        await prisma.job.update({
          where: { id: jobId },
          data: { status: "COMPLETED", totalCandidatesFound: 0 },
        });
        await prisma.processingJob.update({
          where: { jobId },
          data: {
            status: "COMPLETED",
            currentStep: "NO_CANDIDATES_FOUND",
            progress: 100,
            completedAt: new Date(),
          },
        });
      });
      return;
    }

    // Step 4: Save candidates to DB
    const savedCandidates = await step.run("save-candidates", async () => {
      await prisma.processingJob.update({
        where: { jobId },
        data: { currentStep: "SAVING_CANDIDATES", progress: 40 },
      });
      return Promise.all(
        exaCandidates.map((c) =>
          prisma.candidate.create({
            data: {
              jobId,
              name: c.name,
              linkedinUrl: c.linkedinUrl,
              profileText: c.profileText,
              profileTitle: c.profileTitle,
              location: c.location,
              workHistory: c.workHistory
                ? JSON.parse(JSON.stringify(c.workHistory))
                : undefined,
              exaScore: c.exaScore,
            },
          })
        )
      );
    });

    // Step 5: Evaluate each candidate (one step per candidate for granular retries)
    const evaluations: { candidateId: string; score: number }[] = [];

    for (let i = 0; i < savedCandidates.length; i++) {
      const result = await step.run(`evaluate-candidate-${i}`, async () => {
        const candidate = savedCandidates[i];
        const exaCandidate = exaCandidates[i];
        const progress = 50 + Math.round(((i + 1) / savedCandidates.length) * 40);

        await prisma.processingJob.update({
          where: { jobId },
          data: {
            currentStep: `EVALUATING_CANDIDATES (${i + 1}/${savedCandidates.length})`,
            progress,
          },
        });

        try {
          const evalResult = await evaluateCandidate({
            candidateName: candidate.name,
            profileText: exaCandidate.profileText,
            profileTitle: exaCandidate.profileTitle,
            jobDescription: job.description,
            jobTitle: job.title,
            jobLocation: job.location ?? undefined,
          });

          await prisma.evaluation.create({
            data: {
              candidateId: candidate.id,
              matchScore: evalResult.matchScore,
              matchBand: evalResult.matchBand,
              whyMatched: evalResult.whyMatched,
            },
          });

          return { candidateId: candidate.id, score: evalResult.matchScore };
        } catch {
          // Fallback: zero score so the job can still complete
          await prisma.evaluation.create({
            data: {
              candidateId: candidate.id,
              matchScore: 0,
              matchBand: "below_50",
              whyMatched: [],
            },
          });
          return { candidateId: candidate.id, score: 0 };
        }
      });

      evaluations.push(result);
    }

    // Step 6: Rank candidates and mark complete
    await step.run("rank-and-complete", async () => {
      await prisma.processingJob.update({
        where: { jobId },
        data: { currentStep: "RANKING_RESULTS", progress: 95 },
      });

      evaluations.sort((a, b) => b.score - a.score);

      await Promise.all(
        evaluations.map((e, idx) =>
          prisma.candidate.update({
            where: { id: e.candidateId },
            data: { rank: idx + 1 },
          })
        )
      );

      await prisma.job.update({
        where: { id: jobId },
        data: { status: "COMPLETED", totalCandidatesFound: savedCandidates.length },
      });

      await prisma.processingJob.update({
        where: { jobId },
        data: {
          status: "COMPLETED",
          currentStep: "DONE",
          progress: 100,
          completedAt: new Date(),
        },
      });
    });
  }
);
