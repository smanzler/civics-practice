"use client";

import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import civics from "@/lib/civics";
import { CircleQuestionMark } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function Page() {
  const { id } = useParams();

  const question = civics[Number(id) - 1];

  if (!question) {
    return (
      <div className="flex justify-center items-center">
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <CircleQuestionMark />
            </EmptyMedia>
            <EmptyTitle>Question Not Found</EmptyTitle>
            <EmptyDescription>
              Could not find the question you are looking for
            </EmptyDescription>
          </EmptyHeader>
          <Button asChild>
            <Link href="/questions">Return To All Questions</Link>
          </Button>
        </Empty>
      </div>
    );
  }

  return (
    <div className="mx-auto space-y-8 max-w-sm">
      <h1 className="text-2xl font-bold">Question {question.id}</h1>

      <div className="space-y-8">
        <div className="space-y-3">
          <h2 className="font-bold">Question</h2>
          <p>{question.question}</p>
        </div>

        <div className="space-y-3">
          <h2 className="font-bold">Accepted Answers</h2>
          <ul className="list-disc list-inside space-y-2 line-height">
            {question.acceptableAnswers ? (
              question.acceptableAnswers.map((a) => (
                <li className="text-base/6" key={a}>
                  {a}
                </li>
              ))
            ) : (
              <p>No Accepted Answers</p>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
