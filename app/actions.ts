"use server";

import { GoogleGenAI } from "@google/genai";

const API_KEY = process.env.GEMENI_API_KEY;

if (!API_KEY) throw new Error("API key not set");

const ai = new GoogleGenAI({ apiKey: API_KEY });

export type GradeResult = {
  correct: boolean | null;
  input: string;
};

const systemInstruction = `You are an evaluator for U.S. civics test answers. You will be given a question, the correct answers, and a user's answer. You must determine if the user's answer is correct.

Guidelines:
- The user's answer must not contain any incorrect information. If the user provides a list of items, all items in that list must be correct.
- The answer doesn't need to match exactly - understand what the user means from context
- For names of people: accept minor misspellings, different name orders (FirstName LastName vs LastName FirstName), and partial matches if the person is clearly identifiable
- For questions about representatives/senators/governors: if the user names a correct person for ANY state/district, mark it correct (since the question asks about "your" state)
- Be lenient with spelling variations but strict about the actual content being correct
- The answer can't be too vague or generic
- You should only compare the users answer to the Actual answers
- You should judge in what cases the user provided enough information for the answer to be considered correct, and when it's not enough
- You should judge the answer the same way an average officer on the naturalization interview would judge it

Reply only with the word "Correct" for a correct user's answer or the word "Incorrect" for an incorrect user's answer.`;

export async function gradeAnswer(
  answer: string,
  question: string,
  acceptableAnswers: string[],
): Promise<GradeResult> {
  const prompt = `Question: ${question}
    Actual answers: ${acceptableAnswers}
    User's answer: ${answer}`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-lite",
    contents: prompt,
    config: {
      systemInstruction,
    },
  });

  return {
    correct: response.candidates?.[0].content?.parts?.[0].text === "Correct",
    input: answer,
  };
}
