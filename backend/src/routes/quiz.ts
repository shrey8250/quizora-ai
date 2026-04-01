import { Router } from "express";
import { Quiz, Question } from "../models/index";
import { validate } from "../middleware/validate";
import { createQuizSchema, addQuestionSchema } from "../schemas/quizSchema";

const router = Router();

// Route 1: Create a new Quiz (Admin clicks "Create Quiz")
router.post("/",validate(createQuizSchema), async (req, res, next) => {
  try {
    const { title, description } = req.body;

    const newQuiz = await Quiz.create({
      title,
      description
    });

    res.status(201).json({ message: "Quiz created!", quizId: newQuiz._id });
  } catch (error) {
    next(error); // Pass the error to the Global Error Handler
  }
});

// Route 2: Add a Question to an existing Quiz (Admin clicks "Add Problem")
router.post("/:quizId/question", validate(addQuestionSchema), async (req, res, next) => {
  try {
    const { quizId } = req.params;
    const { text, options } = req.body;

    const newQuestion = await Question.create({
      quizId,
      text,
      options
    });

    res.status(201).json({ message: "Question added!", questionId: newQuestion._id });
  } catch (error) {
    next(error);
  }
});

// Route 3: Fetch a complete Quiz with all its Questions (When game starts)
router.get("/:quizId", async (req, res, next) => {
  try {
    const { quizId } = req.params;
    
    // 1. Find the quiz
    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({ error: "Quiz not found" });
    }

    // 2. Find all questions linked to this quiz
    const questions = await Question.find({ quizId });

    // 3. Send them both back together
    res.status(200).json({ quiz, questions });
  } catch (error) {
    next(error);
  }
});

export default router;