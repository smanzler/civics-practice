"use client";

import { useEffect, useRef, useState } from "react";
import civics from "@/lib/civics";
import { Spinner } from "@/components/ui/spinner";
import { Badge } from "@/components/ui/badge";
import Question, { QuestionRef } from "@/components/question";
import { GradeResult } from "../actions";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export default function Page() {
  const [questionIndex, setQuestionIndex] = useState(0);
  const [questionOrder, setQuestionOrder] = useState<number[] | undefined>(
    undefined,
  );

  const [result, setResult] = useState<GradeResult>();

  const questionRef = useRef<QuestionRef>(null);

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

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Enter") {
      if (!!result) {
        handleNext();
        return;
      }

      questionRef.current?.submit();
    }
  };

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  const handleNext = () => {
    if (!questionOrder || questionIndex >= questionOrder.length) {
      initializeQuestions();
      return;
    }

    setQuestionIndex((prev) => prev + 1);

    questionRef.current?.reset();
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

      <Question
        ref={questionRef}
        question={question}
        result={result}
        setResult={setResult}
        onNext={handleNext}
      />

      <div className="flex justify-end">
        <Button variant="default" className="ml-auto" onClick={handleNext}>
          Next
          <ArrowRight />
        </Button>
      </div>
    </div>
  );
}
