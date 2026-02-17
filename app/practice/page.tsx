"use client";

import { useEffect, useState } from "react";
import civics, { CivicsQuestion } from "@/lib/civics";
import { Spinner } from "@/components/ui/spinner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { gradeAnswer, GradeResult } from "@/lib/grade";

export default function Page() {
  const [question, setQuestion] = useState<CivicsQuestion>();
  const [answer, setAnswer] = useState<string>();
  const [result, setResult] = useState<GradeResult>();

  const getQuestion = () => {
    const randomIndex = Math.floor(Math.random() * civics.length);
    setQuestion(civics[randomIndex]);
  };

  useEffect(() => {
    getQuestion();
  }, []);

  const handleSubmit = () => {
    if (!answer || !question) return;
    const gradeResult = gradeAnswer(answer, question);

    setResult(gradeResult);
  };

  if (!question)
    return (
      <div className="flex items-center justify-center">
        <Spinner />
      </div>
    );

  return (
    <div>
      <h1>Practice</h1>
      <h2>Question {question?.id}</h2>
      <p>{question.question}</p>
      <Input />
      <Button onClick={handleSubmit}>Submit</Button>
    </div>
  );
}
