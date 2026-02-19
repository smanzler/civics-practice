"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel, FieldSet } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import civics from "@/lib/civics";
import useQuizStore from "@/stores/quiz-store";
import { ArrowRight, Check, X } from "lucide-react";
import { ChangeEvent, KeyboardEvent, useState } from "react";
import { gradeAnswer, GradeResult } from "../actions";
import { Spinner } from "@/components/ui/spinner";

export default function Page() {
  const {
    results,
    questions,
    currentQuestion,
    startQuiz,
    nextQuestion,
    answerQuestion,
  } = useQuizStore();
  const [questionCount, setQuestionCount] = useState([20]);

  const [answer, setAnswer] = useState<string>("");
  const [result, setResult] = useState<GradeResult>();
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!answer || !question?.acceptableAnswers) return;
    setSubmitting(true);
    try {
      const gradeResult = await gradeAnswer(
        answer,
        question.question,
        question.acceptableAnswers,
      );

      answerQuestion(gradeResult.correct ?? false);

      setResult(gradeResult);
    } finally {
      setSubmitting(false);
    }
  };

  const handleStartQuiz = () => {
    startQuiz(questionCount[0]);
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setAnswer(e.target.value);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      // already answered
      if (results?.[currentQuestion] !== undefined) {
        // no more questions
        if (questions && currentQuestion === questions.length - 1) {
          handleSeeResults();
          return;
        }

        handleNext();
        return;
      }

      handleSubmit();
    }
  };

  const handleNext = () => {
    if (!result) return;

    const res = result;
    setAnswer("");
    setResult(undefined);

    res.correct;

    nextQuestion();
  };

  const handleSeeResults = () => {
    nextQuestion();
  };

  if (currentQuestion === undefined || questions === undefined) {
    return (
      <div className="mx-auto space-y-8 max-w-sm">
        <h1 className="font-bold text-2xl">Start Quiz</h1>
        <FieldSet>
          <Field>
            <div className="flex flex-row justify-between gap-2">
              <FieldLabel>Number of Questions</FieldLabel>
              <strong className="text-sm">{questionCount}</strong>
            </div>
            <Slider
              min={2}
              max={120}
              value={questionCount}
              onValueChange={setQuestionCount}
            />
          </Field>
        </FieldSet>

        <Button
          className="w-full"
          disabled={!questionCount}
          onClick={handleStartQuiz}
        >
          Start Quiz
        </Button>
      </div>
    );
  }

  if (currentQuestion >= questions.length) {
    if (!results) return;

    return (
      <div className="mx-auto space-y-8 max-w-sm">
        <h1 className="font-bold text-2xl">Not Bad</h1>

        <p>
          %
          {(Object.values(results).filter(Boolean).length / questions.length) *
            100}
        </p>
      </div>
    );
  }

  const question = civics[questions[currentQuestion] - 1];

  return (
    <div className="mx-auto space-y-8 max-w-sm">
      <h1 className="font-bold text-2xl">Quiz</h1>

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
              {currentQuestion !== questions.length - 1
                ? "Next"
                : "See Results"}
              <ArrowRight />
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
