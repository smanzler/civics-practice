import { CivicsQuestion } from "./civics";

export type GradeResult = {
  correct: boolean | null;
  input: string;
  feedback?: string;
  requiresManualReview?: boolean;
  matchedAnswers?: unknown[];
  matchedCount?: number;
  required?: number;
};

export function gradeAnswer(
  userAnswer: string,
  question: CivicsQuestion,
): GradeResult {
  if (!userAnswer || !userAnswer.trim()) {
    return {
      correct: false,
      input: "",
      feedback: "No answer provided.",
    };
  }

  if (question.variable) {
    return gradeVariable(userAnswer);
  }

  if (question.requiresCurrentInfo) {
    return gradeCurrentInfo(userAnswer);
  }

  if (!question.acceptableAnswers || question.acceptableAnswers.length === 0) {
    return {
      correct: false,
      input: userAnswer,
      feedback: "No grading data available for this question.",
    };
  }

  if (question.minAnswersRequired && question.minAnswersRequired > 1) {
    return gradeMultiAnswer(userAnswer, question);
  }

  return gradeSingleAnswer(userAnswer, question);
}

function gradeVariable(userAnswer: string) {
  return {
    correct: true,
    input: "",
    feedback: "Answers may vary. Your response is acceptable.",
  };
}

function gradeCurrentInfo(userAnswer: string) {
  return {
    correct: null,
    input: "",
    requiresManualReview: true,
    feedback: "This question requires current information.",
  };
}

function gradeMultiAnswer(userAnswer: string, question: CivicsQuestion) {
  const userParts = splitUserAnswers(userAnswer);

  const matched = new Set();

  for (const part of userParts) {
    for (const acceptable of question.acceptableAnswers ?? []) {
      if (matchesAnswer(part, acceptable)) {
        matched.add(acceptable);
      }
    }
  }

  const needed = question.minAnswersRequired || 1;

  if (matched.size >= needed) {
    return {
      correct: true,
      input: userAnswer,
      matchedAnswers: Array.from(matched),
    };
  }

  return {
    correct: false,
    input: userAnswer,
    matchedCount: matched.size,
    required: needed,
    feedback: `You named ${matched.size}, but ${needed} are required.`,
  };
}

function splitUserAnswers(text: string) {
  return text
    .split(/,| and |\n/i)
    .map((a: string) => a.trim())
    .filter(Boolean);
}

function gradeSingleAnswer(userAnswer: string, question: CivicsQuestion) {
  const matches = question.acceptableAnswers?.filter((a) =>
    matchesAnswer(userAnswer, a),
  );

  if (matches && matches.length > 0) {
    return {
      correct: true,
      input: userAnswer,
      matchedAnswers: matches,
    };
  }

  return {
    correct: false,
    input: userAnswer,
    feedback: "That answer does not match an accepted response.",
  };
}

const MIN_SUBSTRING_LENGTH = 5;

function matchesAnswer(user: string, acceptable: string) {
  const u = normalize(user);
  const a = normalize(acceptable);

  if (u === a) return true;
  if (u.includes(a)) return true;
  if (u.length >= MIN_SUBSTRING_LENGTH && a.includes(u)) return true;
  return false;
}

function normalize(text: string) {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}
