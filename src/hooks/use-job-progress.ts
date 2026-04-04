"use client";

import { useEffect, useState, useCallback, useRef } from "react";

interface JobProgress {
  status: string;
  currentStep: string | null;
  progress: number;
  error: string | null;
  startedAt: string | null;
  completedAt: string | null;
}

export function useJobProgress(jobId: string) {
  const [data, setData] = useState<JobProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchProgress = useCallback(async () => {
    try {
      const res = await fetch(`/api/jobs/${jobId}/status`);
      if (res.ok) {
        const progress = await res.json();
        setData(progress);

        // Stop polling if completed or failed
        if (
          progress.status === "COMPLETED" ||
          progress.status === "FAILED"
        ) {
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
        }
      }
    } catch (err) {
      console.error("Failed to fetch progress:", err);
    } finally {
      setLoading(false);
    }
  }, [jobId]);

  useEffect(() => {
    fetchProgress();
    intervalRef.current = setInterval(fetchProgress, 2000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [fetchProgress]);

  const isProcessing =
    data?.status === "PROCESSING" || data?.status === "QUEUED";
  const isCompleted = data?.status === "COMPLETED";
  const isFailed = data?.status === "FAILED";

  return {
    status: data?.status ?? null,
    currentStep: data?.currentStep ?? null,
    progress: data?.progress ?? 0,
    error: data?.error ?? null,
    isProcessing,
    isCompleted,
    isFailed,
    loading,
  };
}
