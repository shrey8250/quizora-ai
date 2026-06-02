import { Router } from "express";
import { aiQueue } from "../queues/aiQueue";
import { validate } from "../middleware/validate";
import { generateAISchema } from "../schemas/quizSchema";

export const aiRouter = Router();

aiRouter.post("/generate",validate(generateAISchema), async (req, res) => {
  try {
    const { quizId, pdfUrl, topic } = req.body;
    
    console.log(`Pinning AI job to Redis for Quiz: ${quizId}...`);

    
    await aiQueue.add("generate-quiz",
     { quizId, pdfUrl, topic },
    {
    attempts: 3, // Retry up to 3 times if it fails
    backoff: {
      type: "exponential", // Wait longer between each retry
      delay: 5000, // Wait 5s, then 10s, then 20s and so on..
       },
    removeOnComplete: true, // Clean up Redis memory on success
    removeOnFail: false,    // Keep failed jobs in Redis for debugging
  }
);

    res.status(202).json({ 
        message: "AI Generation started in the background! Please wait...",
        status: "processing"
    });

  } catch (error) {
    console.error("AI Queue Error:", error);
    res.status(500).json({ error: "Failed to queue AI job" });
  }
});