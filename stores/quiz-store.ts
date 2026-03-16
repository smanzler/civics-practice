import civics from "@/lib/civics";
import { create } from "zustand";

type QuizStore = {
  currentQuestion: number;
  questions?: number[];
  results?: Record<number, boolean | undefined>;
  previousQuestions: number[];
  startQuiz: (questionCount: number) => void;
  nextQuestion: () => void;
  answerQuestion: (correct: boolean) => void;
  reset: () => void;
};

const useQuizStore = create<QuizStore>((set, get) => ({
  currentQuestion: 0,
  questions: undefined,
  previousQuestions: [],
  startQuiz: (questionCount: number) => {
    if (questionCount > civics.length - get().previousQuestions.length) {
      console.log("not enough questions to get random")
      console.log("getting new questions")
      set({ previousQuestions: [] })
    }

    const { previousQuestions } = get();
    const questions = Array.from({ length: civics.length }, (_, i) => i).filter(value => !previousQuestions.includes(value))

    for (let i = questions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [questions[i], questions[j]] = [questions[j], questions[i]];
    }

    const selectedQuestions = questions.slice(0, questionCount);

    set(state => ({
      questions: selectedQuestions,
      results: {},
      previousQuestions: [...state.previousQuestions, ...selectedQuestions],
      currentQuestion: 0,
    }));
  },
  nextQuestion: () => {
    if (!get().questions) {
      return;
    }

    set((state) => ({
      currentQuestion: state.currentQuestion + 1,
    }));
  },
  answerQuestion: (correct: boolean) => {
    const { currentQuestion, results } = get();

    if (!results) return;

    results[currentQuestion] = correct;
  },
  reset: () => {
    set({ questions: undefined, results: undefined, currentQuestion: 0 });
  },
}));

export default useQuizStore;
