import { z } from "zod";

export const joinAdminSchema = z.object({
  roomId: z.string().min(1, "Room ID is required")
});

export const joinRoomSchema = z.object({
  roomId: z.string().min(1, "Room ID is required"),
  name: z.string().min(1, "Name is required")
});

export const nextQuestionSchema = z.object({
  roomId: z.string().min(1, "Room ID is required"),
  question: z.any(), // We use any() here to seamlessly pass the question object through
  deadline: z.number().optional() 
});

export const submitAnswerSchema = z.object({
  answerText: z.string()
});

export const showLeaderboardSchema = z.object({
  roomId: z.string().min(1, "Room ID is required")
});