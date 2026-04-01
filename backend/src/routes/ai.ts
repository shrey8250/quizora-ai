import { Router } from "express";
import { aiQueue } from "../queues/aiQueue";
import { validate } from "../middleware/validate";
import { generateAISchema } from "../schemas/quizSchema";

export const aiRouter = Router();

aiRouter.post("/generate",validate(generateAISchema), async (req, res) => {
  try {
    const { quizId, pdfUrl, topic } = req.body;
    
    console.log(`Pinning AI job to Redis for Quiz: ${quizId}...`);

    
    await aiQueue.add("generate-quiz", {
      quizId,
      pdfUrl,
      topic
    });

    res.status(202).json({ 
        message: "AI Generation started in the background! Please wait...",
        status: "processing"
    });

  } catch (error) {
    console.error("AI Queue Error:", error);
    res.status(500).json({ error: "Failed to queue AI job" });
  }
});