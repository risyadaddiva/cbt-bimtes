import { Category } from "@/lib/randomize";

// ─────────────────────────────────────────────────────────────────────────────
// Session / Auth types
// ─────────────────────────────────────────────────────────────────────────────

export interface AppSession {
  user: {
    id: string;
    name: string;
    email?: string;
    username: string;
    role: "ADMIN" | "PARTICIPANT";
    participantId: string | null;
    school: string | null;
    track: Category | null;
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Exam types
// ─────────────────────────────────────────────────────────────────────────────

export interface ChoiceDisplay {
  id: string;
  label: string;
  text: string;
}

export interface QuestionDisplay {
  id: string;
  text: string;
  choices: ChoiceDisplay[];
  isMarkedReview?: boolean;
  selectedChoiceId?: string | null;
}

export interface GroupDisplay {
  id: string;
  category: Category;
  status: string;
  durationSecs: number;
  startedAt: string | null;
  questions: QuestionDisplay[];
}

export interface ExamSessionDisplay {
  id: string;
  status: string;
  groupOrder: Category[];
  currentGroupIndex: number;
  groups: GroupDisplay[];
  startedAt: string | null;
}

// ─────────────────────────────────────────────────────────────────────────────
// Result types
// ─────────────────────────────────────────────────────────────────────────────

export interface CategoryScore {
  category: Category;
  score: number;
  correct: number;
  incorrect: number;
  unanswered: number;
  total: number;
}

export interface ResultDisplay {
  id: string;
  totalScore: number;
  scorePerCategory: CategoryScore[];
  totalCorrect: number;
  totalIncorrect: number;
  totalUnanswered: number;
  rank: number | null;
  percentile: number | null;
  submittedAt: string;
  participant: {
    name: string;
    school: string;
    track: Category;
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Admin types
// ─────────────────────────────────────────────────────────────────────────────

export interface DashboardStats {
  totalParticipants: number;
  totalQuestions: number;
  totalCompleted: number;
  averageScore: number;
  activeExams: number;
  completionRate: number;
}

export interface AnalyticsData {
  scoreByCategory: { category: string; avg: number }[];
  hardestQuestions: { id: string; text: string; wrongRate: number; total: number }[];
  easiestQuestions: { id: string; text: string; correctRate: number; total: number }[];
  completionRate: number;
  rankingLeaderboard: {
    rank: number;
    name: string;
    school: string;
    score: number;
  }[];
  scoreDistribution: { range: string; count: number }[];
}

// ─────────────────────────────────────────────────────────────────────────────
// API response types
// ─────────────────────────────────────────────────────────────────────────────

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
