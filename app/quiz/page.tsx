"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel, FieldSet } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import civics from "@/lib/civics";
import useQuizStore from "@/stores/quiz-store";
import { ArrowRight, Check, X } from "lucide-react";
import { ChangeEvent, useEffect, useState } from "react";
import { gradeAnswer, GradeResult } from "../actions";
import { Spinner } from "@/components/ui/spinner";
import { Progress } from "@/components/ui/progress";
import { ChartContainer } from "@/components/ui/chart";
import {
  Label,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  RadialBar,
  RadialBarChart,
} from "recharts";

export default function Page() {
  const {
    results,
    questions,
    currentQuestion,
    startQuiz,
    nextQuestion,
    answerQuestion,
    reset,
  } = useQuizStore();
  const [questionCount, setQuestionCount] = useState([20]);

  const [answer, setAnswer] = useState<string>("");
  const [result, setResult] = useState<GradeResult>();
  const [submitting, setSubmitting] = useState(false);

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Enter") {
      if (questionCount && !questions) {
        handleStartQuiz();
        return;
      }

      // already answered
      if (results?.[currentQuestion] !== undefined) {
        handleNext();
        return;
      }

      // quiz finished
      if (questions && currentQuestion >= questions.length) {
        handleStartNewQuiz();
        return;
      }

      handleSubmit();
    }
  };

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  const question = questions ? civics[questions[currentQuestion]] : undefined;

  const handleSubmit = async () => {
    if (!answer) return;

    if (!question?.acceptableAnswers) {
      answerQuestion(false);

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

  const handleNext = () => {
    if (!result) return;

    const res = result;
    setAnswer("");
    setResult(undefined);

    res.correct;

    nextQuestion();
  };

  const handleStartNewQuiz = () => {
    setAnswer("");
    setResult(undefined);

    reset();
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

  if (currentQuestion >= questions.length || !question) {
    if (!results) return;

    const chartData = [
      {
        name: "score",
        value:
          (Object.values(results).filter(Boolean).length / questions.length) *
          100,
        fill: "var(--chart-2)",
      },
    ];

    const chartConfig = {
      score: {
        label: "Score",
      },
    };

    return (
      <div className="mx-auto space-y-8 max-w-sm">
        <h1 className="font-bold text-2xl">Results</h1>

        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[250px]"
        >
          <RadialBarChart
            data={chartData}
            startAngle={90}
            endAngle={-270}
            innerRadius={80}
            outerRadius={110}
          >
            <PolarGrid
              gridType="circle"
              radialLines={false}
              stroke="none"
              className="first:fill-muted last:fill-background"
              polarRadius={[86, 74]}
            />
            <RadialBar dataKey="value" background cornerRadius={10} />

            <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
            <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) - 28}
                          className="fill-muted-foreground"
                        >
                          %
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={viewBox.cy}
                          className="fill-foreground text-4xl font-bold"
                        >
                          {chartData[0].value.toLocaleString()}
                        </tspan>
                      </text>
                    );
                  }
                }}
              />
            </PolarRadiusAxis>
          </RadialBarChart>
        </ChartContainer>

        <Button className="w-full" onClick={handleStartNewQuiz}>
          Start New Quiz
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto space-y-8 max-w-sm">
      <Field>
        <div className="flex flex-row justify-between">
          <FieldLabel>Progress</FieldLabel>
          <p className="text-sm">
            {currentQuestion + 1}/{questions.length}
          </p>
        </div>

        <Progress value={((currentQuestion + 1) / questions.length) * 100} />
      </Field>

      <div className="flex flex-row justify-between">
        <h1 className="text-2xl font-bold">Quiz</h1>
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
