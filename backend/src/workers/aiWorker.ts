import { Worker, Job } from "bullmq";
import IORedis from "ioredis";
import dotenv from "dotenv";
import mongoose from "mongoose";
import { Question } from "../models";
import { ChatGroq } from "@langchain/groq";
import { Embeddings } from "@langchain/core/embeddings";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { MongoDBAtlasVectorSearch } from "@langchain/mongodb";
import axios from "axios";
import { aiGeneratedQuestionsSchema } from "../schemas/quizSchema";

const pdfParse = require("pdf-parse/lib/pdf-parse.js");

dotenv.config();

mongoose.connect(process.env.MONGO_URL as string);

class GeminiEmbeddings extends Embeddings {
  private apiKey: string;
  constructor() {
    super({});
    this.apiKey = process.env.GOOGLE_API_KEY as string;
  }
  async embedDocuments(texts: string[]) {
    return Promise.all(texts.map(t => this.embedQuery(t)));
  }
  async embedQuery(text: string) {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:embedContent?key=${this.apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: { parts: [{ text }] }, outputDimensionality: 768 }),
      }
    );
    const data = await res.json();
    return data.embedding.values;
  }
}

const connection = new IORedis(process.env.REDIS_URL || "redis://127.0.0.1:6379", {
  maxRetriesPerRequest: null
});

export const worker = new Worker("ai-generation-queue", async (job: Job) => {
  const { quizId, pdfUrl, topic } = job.data;

  // 1. Check Redis to see if we have processed this PDF before
  const isCached = await connection.get(`pdf:${pdfUrl}`);
  
  // 2. Connect to a dedicated MongoDB collection for vectors
  const vectorCollection = mongoose.connection.collection("pdf_vectors");
  const embeddings = new GeminiEmbeddings();
  
  let vectorStore: MongoDBAtlasVectorSearch;

  if (!isCached) {
    console.log("Downloading and Embedding PDF for the first time....");
    
    const response = await axios.get(pdfUrl, { responseType: "arraybuffer" });
    const buffer = Buffer.from(response.data);
    const pdfData = await pdfParse(buffer);
    
    const splitter = new RecursiveCharacterTextSplitter({ chunkSize: 2000, chunkOverlap: 300 });
    const docs = await splitter.createDocuments([pdfData.text]);

    // Tag each chunk with the PDF URL so we can filter searches later
    const docsWithMetadata = docs.map((doc: any) => ({
      ...doc,
      metadata: { ...doc.metadata, pdfUrl }
    }));

    // Store vectors permanently in MongoDB
    vectorStore = await MongoDBAtlasVectorSearch.fromDocuments(docsWithMetadata, embeddings, {
      collection: vectorCollection as any,
      indexName: "vector_index", 
      textKey: "text",
      embeddingKey: "embedding",
    });

    // Save to Redis Cache (Expires in 7 days to save space)
    await connection.set(`pdf:${pdfUrl}`, "processed", "EX", 60 * 60 * 24 * 7);

  } else {
    console.log("IN REDIS CACHE! Skipping download and embedding.");
    
    //Connect directly to existing MongoDB vectors
    vectorStore = new MongoDBAtlasVectorSearch(embeddings, {
      collection: vectorCollection as any,
      indexName: "vector_index",
      textKey: "text",
      embeddingKey: "embedding",
    });
  }

  console.log(`Searching for chunks related to: ${topic}`);
  
  // Only search chunks that belong to THIS specific PDF
  const relevantDocs = await vectorStore.similaritySearch(topic, 5, {
    preFilter: { pdfUrl: { $eq: pdfUrl } }
  }); 
  
  const context = relevantDocs.map((doc: any)=> doc.pageContent).join("\n\n");

  console.log("Sending to Gemini...");
  const llm = new ChatGroq({ 
      model: "llama-3.3-70b-versatile", 
      temperature: 0.2,
      apiKey: process.env.GROQ_API_KEY 
    });

  const prompt = `
    You are an expert quiz generator. Based ONLY on the provided context, generate 3 multiple-choice questions about "${topic}".
    
    Context:
    ${context}

    You MUST respond with a raw JSON array. Do not include markdown formatting like \`\`\`json. 
    Use exactly this schema for each object in the array:
    {
      "text": "The question text",
      "options": [
        { "text": "Correct Answer", "isCorrect": true },
        { "text": "Wrong Answer", "isCorrect": false },
        { "text": "Wrong Answer", "isCorrect": false },
        { "text": "Wrong Answer", "isCorrect": false }
      ]
    }
  `;

  const aiResponse = await llm.invoke(prompt);
  const cleanJsonString = aiResponse.content.toString().replace(/```json/g, "").replace(/```/g, "").trim();

  let generatedQuestions;
  try {
    const rawJson = JSON.parse(cleanJsonString);
    generatedQuestions = aiGeneratedQuestionsSchema.parse(rawJson);
  } catch (error) {
    console.error("AI hallucinated invalid JSON or schema mismatch:", error);
    throw new Error("Worker failed.. AI returned malformed or invalid JSON structure.");
  }

  const questionsToSave = generatedQuestions.map((q: any) => ({
    quizId,
    text: q.text,
    options: q.options
  }));

  await Question.insertMany(questionsToSave);
  console.log("Quiz successfully generated and saved to database!");

}, { connection: connection as any });