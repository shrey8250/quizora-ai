import { useState, useRef } from "react";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

export default function AIGeneratorCard({ quizId, token }: { quizId: string, token: string }) {
  const pdfFileRef = useRef<HTMLInputElement>(null);
  const topicRef = useRef<HTMLInputElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // ✨ NEW: Added dynamic status + field validation state
  const [statusMsg, setStatusMsg] = useState<{ type: "error" | "success"; text: string } | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});

  // ✨ AI GENERATOR FUNCTION
  const handleAIGenerate = async () => {
    setStatusMsg(null); // Reset status
    setFieldErrors({}); // Reset field errors

    const file = pdfFileRef.current?.files?.[0];
    const topic = topicRef.current?.value;

    // ✨ UI Error instead of alert
    if (!file || !topic) {
      return setStatusMsg({ type: "error", text: "Please select a PDF and enter a topic." });
    }

    setIsGenerating(true);

    try {
      // Check how many questions we have BEFORE generating
      const initialQuizRes = await axios.get(`${API_URL}/api/quiz/${quizId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const initialCount = initialQuizRes.data.questions.length;

      // Upload PDF to Cloudinary
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET);

      const cloudRes = await axios.post(
        `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/raw/upload`,
        formData
      );

      const securePdfUrl = cloudRes.data.secure_url;

      // Send PDF URL + topic to AI backend
      await axios.post(
        `${API_URL}/api/ai/generate`,
        { quizId, pdfUrl: securePdfUrl, topic },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Poll the database every 3 seconds until the worker finishes
      const checkInterval = setInterval(async () => {
        try {
          const checkRes = await axios.get(`${API_URL}/api/quiz/${quizId}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          const currentCount = checkRes.data.questions.length;

          // If the count increased, the worker is done
          if (currentCount > initialCount) {
            clearInterval(checkInterval);
            setIsGenerating(false);

            setStatusMsg({
              type: "success",
              text: `Generated ${currentCount - initialCount} questions!`
            });

            // Clear the inputs using refs
            if (pdfFileRef.current) pdfFileRef.current.value = "";
            if (topicRef.current) topicRef.current.value = "";
          }
        } catch (err) {
          console.error("Error checking quiz status", err);
        }
      }, 3000);

    } catch (error: any) {
      console.error(error);

      // ✨ NEW: Map Zod details to our inputs
      if (error.response?.data?.details) {
        const mappedErrors: { [key: string]: string } = {};
        error.response.data.details.forEach((detail: any) => {
          mappedErrors[detail.field] = detail.message;
        });
        setFieldErrors(mappedErrors);
        setStatusMsg({ type: "error", text: "Please fix the highlighted fields." });
      } else {
        setStatusMsg({ type: "error", text: "AI Generation failed." });
      }

      setIsGenerating(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* ✨ Status Banner */}
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

      {/* PDF Upload */}
      <input
        type="file"
        accept="application/pdf"
        ref={pdfFileRef}
        title="" /* ✨ THIS LINE FIXES THE GHOST TOOLTIP ✨ */
        className="w-full text-sm text-gray-500 file:mr-4 file:py-3 file:px-6 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-[#72D177]/20 file:text-[#2E7D32] hover:file:bg-[#72D177]/30 cursor-pointer outline-none transition-colors"
      />

      {/* Topic Input with dynamic error styling */}
      <div>
        <input
          type="text"
          placeholder="Topic (e.g. React Hooks)"
          ref={topicRef}
          className={`w-full p-4 rounded-xl bg-gray-50 border-2 font-medium text-gray-900 placeholder-gray-400 outline-none transition-all focus:bg-white ${
            fieldErrors.topic ? "border-red-400" : "border-transparent focus:border-black"
          }`}
        />
        {fieldErrors.topic && (
          <p className="text-red-500 text-xs mt-1 font-bold">{fieldErrors.topic}</p>
        )}
      </div>

      {/* Generate Button */}
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