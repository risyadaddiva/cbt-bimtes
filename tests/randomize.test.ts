import { describe, it, expect } from "vitest";
import { shuffle, randomizeExamSession, calculateGroupScore, EXAM_CONFIG } from "../src/lib/randomize";
import { Category } from "@prisma/client";

describe("shuffle", () => {
  it("should return an array of the same length", () => {
    const arr = [1, 2, 3, 4, 5];
    expect(shuffle(arr)).toHaveLength(5);
  });

  it("should contain the same elements", () => {
    const arr = [1, 2, 3, 4, 5];
    const shuffled = shuffle(arr);
    expect(shuffled.sort()).toEqual(arr.sort());
  });

  it("should not mutate original array", () => {
    const arr = [1, 2, 3, 4, 5];
    const original = [...arr];
    shuffle(arr);
    expect(arr).toEqual(original);
  });

  it("should produce different orders for large arrays (statistical)", () => {
    const arr = Array.from({ length: 20 }, (_, i) => i);
    const results = new Set<string>();
    for (let i = 0; i < 100; i++) {
      results.add(JSON.stringify(shuffle(arr)));
    }
    expect(results.size).toBeGreaterThan(1);
  });
});

describe("randomizeExamSession", () => {
  const mockQuestions = (n: number) =>
    Array.from({ length: n }, (_, i) => ({
      id: `q-${i}`,
      choices: [
        { id: `c-${i}-0`, label: "A", text: "Choice A", isCorrect: true },
        { id: `c-${i}-1`, label: "B", text: "Choice B", isCorrect: false },
        { id: `c-${i}-2`, label: "C", text: "Choice C", isCorrect: false },
        { id: `c-${i}-3`, label: "D", text: "Choice D", isCorrect: false },
        { id: `c-${i}-4`, label: "E", text: "Choice E", isCorrect: false },
      ],
    }));

  const questionsByCategory = {
    [Category.MIPA]: mockQuestions(50),
    [Category.SOSHUM]: mockQuestions(50),
    [Category.WAWASAN_KEBANGSAAN]: mockQuestions(20),
    [Category.LITERASI]: mockQuestions(40),
    [Category.TES_SKOLASTIK]: mockQuestions(30),
    [Category.KEAGAMAAN]: mockQuestions(30),
  };

  it("should return exactly 5 groups for MIPA track", () => {
    const groups = randomizeExamSession(Category.MIPA, questionsByCategory);
    expect(groups).toHaveLength(5);
  });

  it("should return exactly 5 groups for SOSHUM track", () => {
    const groups = randomizeExamSession(Category.SOSHUM, questionsByCategory);
    expect(groups).toHaveLength(5);
  });

  it("should include MIPA but not SOSHUM for MIPA track", () => {
    const groups = randomizeExamSession(Category.MIPA, questionsByCategory);
    const categories = groups.map((g) => g.category);
    expect(categories).toContain(Category.MIPA);
    expect(categories).not.toContain(Category.SOSHUM);
  });

  it("should include SOSHUM but not MIPA for SOSHUM track", () => {
    const groups = randomizeExamSession(Category.SOSHUM, questionsByCategory);
    const categories = groups.map((g) => g.category);
    expect(categories).toContain(Category.SOSHUM);
    expect(categories).not.toContain(Category.MIPA);
  });

  it("each group should have correct question count per EXAM_CONFIG", () => {
    const groups = randomizeExamSession(Category.MIPA, questionsByCategory);
    for (const group of groups) {
      const expected = EXAM_CONFIG.groups[group.category].questions;
      expect(group.questionOrder).toHaveLength(expected);
    }
  });

  it("each group should have shuffled option order for each question", () => {
    const groups = randomizeExamSession(Category.MIPA, questionsByCategory);
    for (const group of groups) {
      for (const qId of group.questionOrder) {
        expect(group.optionOrder[qId]).toHaveLength(5);
      }
    }
  });

  it("should produce different group orders across multiple calls (statistical)", () => {
    const orders = new Set<string>();
    for (let i = 0; i < 20; i++) {
      const groups = randomizeExamSession(Category.MIPA, questionsByCategory);
      orders.add(groups.map((g) => g.category).join(","));
    }
    expect(orders.size).toBeGreaterThan(1);
  });
});

describe("calculateGroupScore", () => {
  it("should score 100 for all correct answers", () => {
    const answers = Array(10).fill({ isCorrect: true, selectedChoiceId: "c1" });
    const { score, correct, incorrect, unanswered } = calculateGroupScore(answers);
    expect(correct).toBe(10);
    expect(incorrect).toBe(0);
    expect(unanswered).toBe(0);
    expect(score).toBe(100);
  });

  it("should score 0 for all wrong answers (floor at 0)", () => {
    const answers = Array(10).fill({ isCorrect: false, selectedChoiceId: "c1" });
    const { score, correct, incorrect } = calculateGroupScore(answers);
    expect(correct).toBe(0);
    expect(incorrect).toBe(10);
    expect(score).toBe(0);
  });

  it("should score 0 for unanswered questions", () => {
    const answers = Array(10).fill({ isCorrect: false, selectedChoiceId: null });
    const { score, unanswered } = calculateGroupScore(answers);
    expect(unanswered).toBe(10);
    expect(score).toBe(0);
  });

  it("should apply +4/-1 scoring correctly", () => {
    // 8 correct, 2 wrong: (8×4 - 2×1) / (10×4) × 100 = (30/40)×100 = 75
    const answers = [
      ...Array(8).fill({ isCorrect: true, selectedChoiceId: "c1" }),
      ...Array(2).fill({ isCorrect: false, selectedChoiceId: "c2" }),
    ];
    const { score } = calculateGroupScore(answers);
    expect(score).toBeCloseTo(75, 1);
  });

  it("should handle empty answers array", () => {
    const { score, correct, incorrect, unanswered } = calculateGroupScore([]);
    expect(score).toBe(0);
    expect(correct).toBe(0);
    expect(incorrect).toBe(0);
    expect(unanswered).toBe(0);
  });
});
