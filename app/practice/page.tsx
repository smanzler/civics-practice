"use client";

import { ChangeEvent, useEffect, useState } from "react";
import civics from "@/lib/civics";
import { Spinner } from "@/components/ui/spinner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Field, FieldLabel, FieldSet } from "@/components/ui/field";
import { ArrowRight, Check, X } from "lucide-react";
import { gradeAnswer, GradeResult } from "../actions";

export default function Page() {
  const [questionIndex, setQuestionIndex] = useState(0);
  const [questionOrder, setQuestionOrder] = useState<number[] | undefined>(
    undefined,
  );
  const [answer, setAnswer] = useState<string>("");
  const [result, setResult] = useState<GradeResult>();
  const [submitting, setSubmitting] = useState(false);

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
      console.log(result);
      if (!!result) {
        handleNext();
        return;
      }

      handleSubmit();
    }
  };

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  const getNextQuestion = () => {
    if (!questionOrder || questionIndex >= questionOrder.length) {
      initializeQuestions();
      return;
    }

    setQuestionIndex((prev) => prev + 1);
  };

  const handleSubmit = async () => {
    if (!answer) return;

    if (!question?.acceptableAnswers) {
      setResult({ correct: false, input: answer });
      return;
    }

    setSubmitting(true);
    try {
      const gradeResult = await gradeAnswer(
        answer,
        question.question,
        question.acceptableAnswers,
      );

      setResult(gradeResult);
    } finally {
      setSubmitting(false);
    }
  };

  const handleNext = () => {
    setAnswer("");
    setResult(undefined);

    getNextQuestion();
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setAnswer(e.target.value);
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

      <Field>
        <FieldLabel>{question.question}</FieldLabel>
        <Input value={answer} onChange={handleChange} />
      </Field>

      <Button
        variant={submitting ? "secondary" : "default"}
        className="w-full mb-12 mt-2"
        onClick={handleSubmit}
        disabled={submitting || !!result}
      >
        {submitting ? <Spinner /> : "Submit"}
      </Button>

      {result && (
        <>
          <FieldSet>
            <Field className="gap-1">
              <div className="flex flex-row justify-between">
                <FieldLabel className="font-bold">Your answer</FieldLabel>
                {result.correct ? (
                  <Badge className="bg-green-600/10 text-green-600 dark:bg-green-400/10 dark:text-green-400">
                    <Check />
                    Correct Answer
                  </Badge>
                ) : (
                  <Badge variant="destructive">
                    <X />
                    Wrong Answer
                  </Badge>
                )}
              </div>
              <p>{result.input}</p>
            </Field>
            <Field className="gap-1">
              <FieldLabel className="font-bold">Acceptable answers</FieldLabel>
              {question.acceptableAnswers?.map((a) => (
                <p key={a}>{a}</p>
              ))}
            </Field>
          </FieldSet>
          <div className="flex justify-end">
            <Button variant="default" className="ml-auto" onClick={handleNext}>
              Next
              <ArrowRight />
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
