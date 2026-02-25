"use client";

import { useEffect, useState } from "react";
import civics from "@/lib/civics";
import { Spinner } from "@/components/ui/spinner";
import { Badge } from "@/components/ui/badge";
import Question from "@/components/question";

export default function Page() {
  const [questionIndex, setQuestionIndex] = useState(0);
  const [questionOrder, setQuestionOrder] = useState<number[] | undefined>(
    undefined,
  );

  const question = questionOrder
    ? civics[questionOrder[questionIndex]]
    : undefined;

  const initializeQuestions = () => {
    const questions = Array.from({ length: civics.length }, (_, i) => i);

    for (let i = questions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [questions[i], questions[j]] = [questions[j], questions[i]];
    }

    setQuestionIndex(0);
    setQuestionOrder(questions);
  };

  useEffect(() => {
    initializeQuestions();
  }, []);

  const handleNext = () => {
    if (!questionOrder || questionIndex >= questionOrder.length) {
      initializeQuestions();
      return;
    }

    setQuestionIndex((prev) => prev + 1);
  };

  if (!question)
    return (
      <div className="flex items-center justify-center">
        <Spinner />
      </div>
    );

  return (
    <div className="mx-auto space-y-8 max-w-sm">
      <div className="flex flex-row justify-between">
        <h1 className="text-2xl font-bold">Practice</h1>
        <Badge>Question {question.id}</Badge>
      </div>

      <Question question={question} onNext={handleNext} />
    </div>
  );
}
