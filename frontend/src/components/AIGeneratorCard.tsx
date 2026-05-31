import { useEffect, useRef, useState } from "react";
import axios from "axios";
import type {
  CloudinaryUploadResponse,
  FieldErrors,
  QuizResponse,
  StatusMessage,
} from "../types/quiz";
import { getApiErrorMessage, mapValidationErrors, isUnauthorized } from "../utils/apiErrors"; 

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

type AIGeneratorCardProps = {
  quizId: string;
  token: string;
  onSessionExpired: () => void; 
};

export default function AIGeneratorCard({
  quizId,
  token,
  onSessionExpired,
}: AIGeneratorCardProps) {
  const pdfFileRef = useRef<HTMLInputElement>(null);
  const topicRef = useRef<HTMLInputElement>(null);
  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [statusMsg, setStatusMsg] = useState<StatusMessage | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  useEffect(() => {
    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, []);

  const handleAIGenerate = async () => {
    setStatusMsg(null);
    setFieldErrors({});

    const file = pdfFileRef.current?.files?.[0];
    const topic = topicRef.current?.value.trim() || "";

    if (!file || !topic) {
      setStatusMsg({
        type: "error",
        text: "Please select a PDF and enter a topic.",
      });
      return;
    }

    const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;

    if (!uploadPreset || !cloudName) {
      setStatusMsg({
        type: "error",
        text: "Cloudinary environment variables are missing.",
      });
      return;
    }

    setIsGenerating(true);

    try {
      const initialQuizRes = await axios.get<QuizResponse>(
        `${API_URL}/api/quiz/${quizId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const initialCount = initialQuizRes.data.questions.length;

      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", uploadPreset);

      const cloudRes = await axios.post<CloudinaryUploadResponse>(
        `https://api.cloudinary.com/v1_1/${cloudName}/raw/upload`,
        formData
      );

      const securePdfUrl = cloudRes.data.secure_url;

      await axios.post(
        `${API_URL}/api/ai/generate`,
        { quizId, pdfUrl: securePdfUrl, topic },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      let attempts = 0;
      const maxAttempts = 40;

      pollIntervalRef.current = setInterval(async () => {
        attempts += 1;

        try {
          const checkRes = await axios.get<QuizResponse>(
            `${API_URL}/api/quiz/${quizId}`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );

          const currentCount = checkRes.data.questions.length;

          if (currentCount > initialCount) {
            if (pollIntervalRef.current) {
              clearInterval(pollIntervalRef.current);
              pollIntervalRef.current = null;
            }

            setIsGenerating(false);

            setStatusMsg({
              type: "success",
              text: `Generated ${currentCount - initialCount} questions!`,
            });

            if (pdfFileRef.current) pdfFileRef.current.value = "";
            if (topicRef.current) topicRef.current.value = "";
          }

          if (attempts >= maxAttempts) {
            if (pollIntervalRef.current) {
              clearInterval(pollIntervalRef.current);
              pollIntervalRef.current = null;
            }

            setIsGenerating(false);

            setStatusMsg({
              type: "error",
              text: "AI generation timed out. Please try again.",
            });
          }
        } catch (error: unknown) {
          if (isUnauthorized(error)) return onSessionExpired(); 
          console.error("Error checking quiz status", error);
        }
      }, 3000);
    } catch (error: unknown) {
      if (isUnauthorized(error)) return onSessionExpired(); 

      console.error(error);

      const mappedErrors = mapValidationErrors(error);

      if (mappedErrors) {
        setFieldErrors(mappedErrors);
        setStatusMsg({
          type: "error",
          text: "Please fix the highlighted fields.",
        });
      } else {
        setStatusMsg({
          type: "error",
          text: getApiErrorMessage(error, "AI Generation failed."),
        });
      }

      setIsGenerating(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {statusMsg && (
        <div
          className={`p-3 rounded-xl text-sm font-bold border ${
            statusMsg.type === "error"
              ? "bg-red-50 text-red-600 border-red-200"
              : "bg-[#72D177]/10 text-[#2E7D32] border-[#72D177]/30"
          }`}
        >
          {statusMsg.text}
        </div>
      )}

      <input
        type="file"
        accept="application/pdf"
        ref={pdfFileRef}
        title=""
        className="w-full text-sm text-gray-500 file:mr-4 file:py-3 file:px-6 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-[#72D177]/20 file:text-[#2E7D32] hover:file:bg-[#72D177]/30 cursor-pointer outline-none transition-colors"
      />

      <div>
        <input
          type="text"
          placeholder="Topic (e.g. React Hooks)"
          ref={topicRef}
          className={`w-full p-4 rounded-xl bg-gray-50 border-2 font-medium text-gray-900 placeholder-gray-400 outline-none transition-all focus:bg-white ${
            fieldErrors.topic
              ? "border-red-400"
              : "border-transparent focus:border-black"
          }`}
        />
        {fieldErrors.topic && (
          <p className="text-red-500 text-xs mt-1 font-bold">
            {fieldErrors.topic}
          </p>
        )}
      </div>

      <button
        onClick={handleAIGenerate}
        disabled={isGenerating}
        className={`w-full py-4 rounded-full font-bold transition-all flex justify-center items-center gap-2 ${
          isGenerating
            ? "bg-gray-200 text-gray-500 cursor-not-allowed"
            : "bg-black text-white hover:bg-[#72D177] hover:text-black hover:scale-[1.02] shadow-md"
        }`}
      >
        {isGenerating ? "Reading PDF..." : "Generate Questions"}
      </button>
    </div>
  );
}