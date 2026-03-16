import civics from "@/lib/civics";
import { create } from "zustand";

type QuizStore = {
  currentQuestion: number;
  questions?: number[];
  results?: Record<number, boolean | undefined>;
  availableQuestions: number[];
  startQuiz: (questionCount: number) => void;
  nextQuestion: () => void;
  answerQuestion: (correct: boolean) => void;
  reset: () => void;
};

const useQuizStore = create<QuizStore>((set, get) => ({
  currentQuestion: 0,
  questions: undefined,
  availableQuestions: [],
  startQuiz: (questionCount: number) => {
    const { availableQuestions } = get()

    const pendingQuestions = []
    if (availableQuestions.length < questionCount) {
      pendingQuestions.push(...availableQuestions)
      const newAvailableQuestions = Array.from({ length: civics.length }, (_, i) => i)

      for (let i = newAvailableQuestions.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newAvailableQuestions[i], newAvailableQuestions[j]] = [newAvailableQuestions[j], newAvailableQuestions[i]];
      }

      const morePendingQuestions = newAvailableQuestions.splice(0, questionCount - pendingQuestions.length)
      set({ questions: [...morePendingQuestions, ...pendingQuestions], availableQuestions: newAvailableQuestions })
    } else {

      const questions = availableQuestions.splice(0, questionCount)
      set({ questions, availableQuestions })
    }
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
