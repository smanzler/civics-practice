"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel, FieldSet } from "@/components/ui/field";
import { Slider } from "@/components/ui/slider";
import civics from "@/lib/civics";
import useQuizStore from "@/stores/quiz-store";
import { ArrowRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { GradeResult } from "../actions";
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
import Question, { QuestionRef } from "@/components/question";

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

  const [result, setResult] = useState<GradeResult>();
  const questionRef = useRef<QuestionRef>(null);

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Enter") {
      // quiz not started or finished
      if (
        (questionCount && !questions) ||
        (questions && currentQuestion >= questions.length)
      ) {
        handleStartQuiz();
        return;
      }

      // already answered
      if (results?.[currentQuestion] !== undefined) {
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

  const question = questions ? civics[questions[currentQuestion]] : undefined;

  const handleStartQuiz = () => {
    startQuiz(questionCount[0]);
  };

  const handleNext = () => {
    if (!result) return;

    questionRef.current?.reset();
    nextQuestion();
  };

  const handleStartNewQuiz = () => {
    questionRef.current?.reset();
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

      <Question
        ref={questionRef}
        question={question}
        result={result}
        setResult={setResult}
        onNext={handleNext}
        onSubmit={answerQuestion}
      />

      {result && (
        <div className="flex justify-end">
          <Button variant="default" className="ml-auto" onClick={handleNext}>
            Next
            <ArrowRight />
          </Button>
        </div>
      )}
    </div>
  );
}
