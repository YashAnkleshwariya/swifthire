"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

const CREDIT_COST = 10;

export default function NewJobPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [credits, setCredits] = useState<number | null>(null);
  const [form, setForm] = useState({
    description: "",
    location: "",
    experienceLevel: "",
    candidateLimit: 20,
  });

  useEffect(() => {
    fetch("/api/user")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setCredits(data.data.credits);
      })
      .catch(console.error);
  }, []);

  const insufficientCredits = credits !== null && credits < CREDIT_COST;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (insufficientCredits) return;
    setLoading(true);

    try {
      const body: Record<string, unknown> = {
        description: form.description,
        candidateLimit: form.candidateLimit,
      };
      if (form.location.trim()) body.location = form.location.trim();
      if (form.experienceLevel) body.experienceLevel = form.experienceLevel;

      const res = await fetch("/api/jobs/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error ?? "Failed to create job");
      }

      toast({
        title: "Job created",
        description: "Your job match is being processed.",
      });

      router.push(`/dashboard/jobs/${data.jobId}`);
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to create job",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            ✨ Create New Job Match
          </h1>
          <p className="text-lg text-gray-600">
            Paste a job description and let AI find matching LinkedIn candidates
          </p>
        </div>

        <Card className="border-0 shadow-2xl bg-white/90 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 border-b pb-6">
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-2xl font-bold text-gray-800">
                  Job Details
                </CardTitle>
                <CardDescription className="text-base mt-2">
                  Fill in the details below to start matching
                </CardDescription>
              </div>
              <div className="text-right space-y-2">
                <Badge
                  variant={insufficientCredits ? "destructive" : "secondary"}
                  className={
                    insufficientCredits
                      ? "bg-gradient-to-r from-red-500 to-pink-500 text-white px-4 py-2 text-sm shadow-lg"
                      : "bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-2 text-sm shadow-lg"
                  }
                >
                  ⚡ {credits !== null ? `${credits} credits` : "Loading..."}
                </Badge>
                <p className="text-sm text-gray-500 font-medium">
                  Cost: {CREDIT_COST} credits per job
                </p>
              </div>
            </div>
          </CardHeader>
        <CardContent className="p-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Job Description */}
            <div className="space-y-2">
              <Label htmlFor="description">
                Job Description *
              </Label>
              <Textarea
                id="description"
                placeholder="Paste the full job description here..."
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                required
                minLength={50}
                rows={12}
                className="resize-y"
              />
              <p className="text-xs text-gray-400">
                {form.description.length}/10,000 characters (min 50)
              </p>
            </div>

            {/* Location */}
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                placeholder="e.g. San Francisco, CA"
                value={form.location}
                onChange={(e) =>
                  setForm({ ...form, location: e.target.value })
                }
              />
            </div>

            {/* Experience Level */}
            <div className="space-y-2">
              <Label>Experience Level</Label>
              <Select
                value={form.experienceLevel}
                onValueChange={(val) =>
                  setForm({ ...form, experienceLevel: val })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select experience level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Entry">Entry Level</SelectItem>
                  <SelectItem value="Mid">Mid Level</SelectItem>
                  <SelectItem value="Senior">Senior Level</SelectItem>
                  <SelectItem value="Lead">Lead / Principal</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Candidate Limit */}
            <div className="space-y-2">
              <Label>
                Number of Candidates:{" "}
                <span className="font-bold">{form.candidateLimit}</span>
              </Label>
              <Slider
                value={[form.candidateLimit]}
                onValueChange={(vals) =>
                  setForm({ ...form, candidateLimit: vals[0] })
                }
                min={5}
                max={50}
                step={5}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-400">
                <span>5</span>
                <span>50</span>
              </div>
            </div>

            {/* Insufficient credits warning */}
            {insufficientCredits && (
              <div className="bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-300 rounded-xl p-4 shadow-md">
                <p className="text-base text-red-700 flex items-center gap-2">
                  <span className="text-xl">⚠️</span>
                  <span>
                    You need {CREDIT_COST} credits but only have {credits}.{" "}
                    <a
                      href="/dashboard/billing"
                      className="underline font-bold hover:text-red-900 transition-colors"
                    >
                      Purchase more credits →
                    </a>
                  </span>
                </p>
              </div>
            )}

            <Button
              type="submit"
              disabled={loading || insufficientCredits}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-lg py-7 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.02]"
              size="lg"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="animate-spin">⚙️</span> Creating Job Match...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <span>🚀</span> Find Matching Candidates
                </span>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
      </div>
    </div>
  );
}
