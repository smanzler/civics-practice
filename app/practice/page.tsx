"use client";

import { ChangeEvent, KeyboardEvent, useEffect, useState } from "react";
import civics, { CivicsQuestion } from "@/lib/civics";
import { Spinner } from "@/components/ui/spinner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Field, FieldLabel, FieldSet } from "@/components/ui/field";
import { ArrowRight, Check, X } from "lucide-react";
import { gradeAnswer, GradeResult } from "../actions";

export default function Page() {
  const [question, setQuestion] = useState<CivicsQuestion>();
  const [answer, setAnswer] = useState<string>("");
  const [result, setResult] = useState<GradeResult>();
  const [submitting, setSubmitting] = useState(false);

  const getQuestion = () => {
    const randomIndex = Math.floor(Math.random() * civics.length);
    setQuestion(civics[randomIndex]);
  };

  useEffect(() => {
    getQuestion();
  }, []);

  const handleSubmit = async () => {
    if (!answer || !question?.acceptableAnswers) return;
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

    getQuestion();
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setAnswer(e.target.value);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSubmit();
  };

  if (!question)
    return (
      <div className="flex items-center justify-center">
        <Spinner />
      </div>
    );

  return (
    <div className="mx-auto space-y-4 max-w-sm">
      <div className="flex flex-row justify-between">
        <h1 className="text-2xl font-bold">Practice</h1>
        <Badge>Question {question.id}</Badge>
      </div>

      <Field>
        <FieldLabel>{question.question}</FieldLabel>
        <Input
          value={answer}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
        />
      </Field>

      <Button
        variant={submitting ? "secondary" : "default"}
        className="w-full mb-12 mt-2"
        onClick={handleSubmit}
        disabled={submitting}
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
