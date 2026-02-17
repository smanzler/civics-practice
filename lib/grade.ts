import { CivicsQuestion } from "./civics";

export type GradeResult = {
  correct: boolean | null;
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
      feedback: "No grading data available for this question.",
    };
  }

  if (question.minAnswersRequired && question.minAnswersRequired > 1) {
    return gradeMultiAnswer(userAnswer, question);
  }

  return gradeSingleAnswer(userAnswer, question);
}

function gradeCurrentInfo(userAnswer: string) {
  return {
    correct: null,
    requiresManualReview: true,
    feedback: "This question requires current information.",
  };
}

function gradeVariable(userAnswer: string) {
  return {
    correct: true,
    feedback: "Answers may vary. Your response is acceptable.",
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
      matchedAnswers: Array.from(matched),
    };
  }

  return {
    correct: false,
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
      matchedAnswers: matches,
    };
  }

  return {
    correct: false,
    feedback: "That answer does not match an accepted response.",
  };
}

function matchesAnswer(user: string, acceptable: string) {
  const u = normalize(user);
  const a = normalize(acceptable);

  return u === a || u.includes(a) || a.includes(u);
}

function normalize(text: string) {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}
