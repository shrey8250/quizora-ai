import { z } from "zod";

export const createQuizSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().optional(),
});

export const addQuestionSchema = z.object({
  text: z.string().min(5, "Question text must be at least 5 characters"),
  options: z.array(
    z.object({
      text: z.string().min(1, "Option text cannot be empty"),
      isCorrect: z.boolean(),
    })
  ).length(4, "A question must exactly have 4 options"), 
});

// Validates the incoming request from the Admin frontend
export const generateAISchema = z.object({
  quizId: z.string().min(1, "Quiz ID is required"),
  pdfUrl: z.string().url("Must be a valid Cloudinary URL"),
  topic: z.string().min(3, "Topic must be at least 3 characters"),
});

// Validates the raw JSON output coming back from Groq
export const aiGeneratedQuestionsSchema = z.array(
  z.object({
    text: z.string().min(5, "Question text must be at least 5 characters"),
    options: z.array(
      z.object({
        text: z.string().min(1, "Option text cannot be empty"),
        isCorrect: z.boolean(),
      })
    ).length(4, "AI must generate exactly 4 options per question"),
  })
);