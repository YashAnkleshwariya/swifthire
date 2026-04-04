/**
 * Shared API response types used by both server route handlers and client components.
 * Import from here instead of redeclaring inline in each page.
 */

export interface JobListItem {
  id: string;
  title: string;
  location: string | null;
  experienceLevel: string | null;
  status: string;
  totalCandidatesFound: number;
  createdAt: string;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface JobListResponse {
  success: true;
  jobs: JobListItem[];
  pagination: Pagination;
}

export interface EvaluationData {
  matchScore: number;
  matchBand: "below_50" | "50_to_70" | "above_70";
  whyMatched: string[] | null;
}

export interface CandidateWithEvaluation {
  id: string;
  name: string;
  linkedinUrl: string;
  profileText: string | null;
  profileTitle: string | null;
  location: string | null;
  rank: number | null;
  exaScore: number | null;
  evaluation: EvaluationData | null;
}

export interface UserData {
  id: string;
  email: string;
  name: string | null;
  credits: number;
  isAdmin: boolean;
}

export interface ApiError {
  success: false;
  error: string;
  code: string;
}

export interface ApiSuccess<T> {
  success: true;
  data: T;
}
