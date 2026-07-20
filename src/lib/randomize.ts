// ─────────────────────────────────────────────────────────────────────────────
// Exam Configuration — Safe for client-side use (no Prisma imports)
// ─────────────────────────────────────────────────────────────────────────────

export type Category =
  | "MIPA"
  | "SOSHUM"
  | "WAWASAN_KEBANGSAAN"
  | "LITERASI"
  | "TES_SKOLASTIK"
  | "KEAGAMAAN";

export const EXAM_CONFIG = {
  groups: {
    MIPA: { questions: 30, durationMinutes: 45 },
    SOSHUM: { questions: 30, durationMinutes: 45 },
    WAWASAN_KEBANGSAAN: { questions: 10, durationMinutes: 15 },
    LITERASI: { questions: 20, durationMinutes: 30 },
    TES_SKOLASTIK: { questions: 15, durationMinutes: 15 },
    KEAGAMAAN: { questions: 15, durationMinutes: 15 },
  } as Record<Category, { questions: number; durationMinutes: number }>,
  totalQuestions: 90,
  totalDurationMinutes: 120,
} as const;

export const CATEGORY_LABELS: Record<Category, string> = {
  MIPA: "MIPA (IPA)",
  SOSHUM: "SOSHUM (IPS)",
  WAWASAN_KEBANGSAAN: "Wawasan Kebangsaan",
  LITERASI: "Literasi Bahasa",
  TES_SKOLASTIK: "Tes Skolastik",
  KEAGAMAAN: "Keagamaan",
};

export const CATEGORY_COLORS: Record<Category, string> = {
  MIPA: "bg-blue-50 text-blue-700 border-blue-200",
  SOSHUM: "bg-rose-50 text-rose-700 border-rose-200",
  WAWASAN_KEBANGSAAN: "bg-green-50 text-green-700 border-green-200",
  LITERASI: "bg-yellow-50 text-yellow-700 border-yellow-200",
  TES_SKOLASTIK: "bg-red-50 text-red-700 border-red-200",
  KEAGAMAAN: "bg-purple-50 text-purple-700 border-purple-200",
};

// Fisher-Yates shuffle
export function shuffle<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export interface RandomizedGroup {
  category: Category;
  questionOrder: string[];
  optionOrder: Record<string, string[]>;
  durationSecs: number;
}

export interface QuestionWithChoices {
  id: string;
  choices: { id: string; label: string; text: string; isCorrect: boolean }[];
}

/**
 * Generates a fully randomized exam session:
 * - Group order is shuffled
 * - Within each group, questions are shuffled
 * - Within each question, answer choices are shuffled
 */
export function randomizeExamSession(
  track: Category,
  questionsByCategory: Record<Category, QuestionWithChoices[]>
): RandomizedGroup[] {
  const groups: Category[] = [
    track,
    "WAWASAN_KEBANGSAAN",
    "LITERASI",
    "TES_SKOLASTIK",
    "KEAGAMAAN",
  ];

  const shuffledGroups = shuffle(groups);

  return shuffledGroups.map((category) => {
    const config = EXAM_CONFIG.groups[category];
    const questions = questionsByCategory[category] ?? [];

    const shuffledQuestions = shuffle(questions).slice(0, config.questions);

    const optionOrder: Record<string, string[]> = {};
    for (const q of shuffledQuestions) {
      optionOrder[q.id] = shuffle(q.choices.map((c) => c.id));
    }

    return {
      category,
      questionOrder: shuffledQuestions.map((q) => q.id),
      optionOrder,
      durationSecs: config.durationMinutes * 60,
    };
  });
}

/**
 * Calculate score for a single group
 * Scoring: +4 correct, -1 incorrect, 0 unanswered (SNBT style)
 */
export function calculateGroupScore(
  answers: { isCorrect: boolean; selectedChoiceId: string | null }[]
): { score: number; correct: number; incorrect: number; unanswered: number } {
  let correct = 0;
  let incorrect = 0;
  let unanswered = 0;

  for (const answer of answers) {
    if (answer.selectedChoiceId === null) {
      unanswered++;
    } else if (answer.isCorrect) {
      correct++;
    } else {
      incorrect++;
    }
  }

  const rawScore = correct * 4 - incorrect * 1;
  const maxScore = answers.length * 4;
  const score = Math.max(0, (rawScore / maxScore) * 100);

  return { score, correct, incorrect, unanswered };
}
