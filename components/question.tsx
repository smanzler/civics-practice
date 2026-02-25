import { CivicsQuestion } from "@/lib/civics";
import { Field, FieldLabel, FieldSet } from "./ui/field";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { ArrowRight, Check, X } from "lucide-react";
import { gradeAnswer, GradeResult } from "@/app/actions";
import {
  ChangeEvent,
  Dispatch,
  forwardRef,
  SetStateAction,
  useImperativeHandle,
  useState,
} from "react";
import { Spinner } from "./ui/spinner";

export interface QuestionRef {
  submit: () => void;
  reset: () => void;
}

interface Props {
  question: CivicsQuestion;
  result: GradeResult | undefined;
  setResult: Dispatch<SetStateAction<GradeResult | undefined>>;
  onNext: () => void;
  onSubmit?: (correct: boolean) => void;
}

const Question = forwardRef<QuestionRef, Props>(
  ({ question, result, setResult, onSubmit }, ref) => {
    const [answer, setAnswer] = useState<string>("");
    const [submitting, setSubmitting] = useState(false);

    useImperativeHandle(ref, () => ({
      submit: handleSubmit,
      reset: handleReset,
    }));

    const handleReset = () => {
      setResult(undefined);
      setAnswer("");
    };

    const handleSubmit = async () => {
      if (!answer) return;

      if (!question?.acceptableAnswers) {
        setResult({ correct: false, input: answer });
        onSubmit?.(false);
        return;
      }

      setSubmitting(true);
      try {
        const gradeResult = await gradeAnswer(
          answer,
          question.question,
          question.acceptableAnswers,
        );

        onSubmit?.(gradeResult.correct ?? false);

        setResult(gradeResult);
      } finally {
        setSubmitting(false);
      }
    };

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
      setAnswer(e.target.value);
    };

    return (
      <>
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
                <FieldLabel className="font-bold">
                  Acceptable answers
                </FieldLabel>
                {question.acceptableAnswers?.map((a) => (
                  <p key={a}>{a}</p>
                ))}
              </Field>
            </FieldSet>
          </>
        )}
      </>
    );
  },
);

export default Question;
