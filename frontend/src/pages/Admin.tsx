import { useState, useRef } from "react";
import axios from "axios";

import AuthCard from "../components/AuthCard";
import AIGeneratorCard from "../components/AIGeneratorCard";
import WaitingLobby from "../components/WaitingLobby";
import LiveDashboard from "../components/LiveDashboard";
import UserLeaderboard from "../components/UserLeaderboard"; 

import type {
  AdminClientMessage,
  AdminServerMessage,
  CreateQuizResponse,
  FieldErrors,
  LeaderboardEntry,
  QuizOption,
  QuizQuestion,
  QuizResponse,
  StatusMessage,
} from "../types/quiz";
import { mapValidationErrors, isUnauthorized } from "../utils/apiErrors"; 
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";
const WS_URL = import.meta.env.VITE_WS_URL || "ws://localhost:8080";

const createEmptyOptions = (): QuizOption[] => [
  { text: "", isCorrect: true },
  { text: "", isCorrect: false },
  { text: "", isCorrect: false },
  { text: "", isCorrect: false },
];

export default function Admin() {
const [token, setToken] = useState<string>(localStorage.getItem("adminToken") || "");

const [statusMsg, setStatusMsg] = useState<StatusMessage | null>(null);
const [sessionExpiredMsg, setSessionExpiredMsg] = useState<string | null>(null); 
const [quizFieldErrors, setQuizFieldErrors] = useState<FieldErrors>({});
const [questionFieldErrors, setQuestionFieldErrors] = useState<FieldErrors>({});

const titleRef = useRef<HTMLInputElement>(null);
const descriptionRef = useRef<HTMLInputElement>(null);
const questionTextRef = useRef<HTMLInputElement>(null);
const socketRef = useRef<WebSocket | null>(null);

const [quizId, setQuizId] = useState<string>("");
const [options, setOptions] = useState<QuizOption[]>(createEmptyOptions());

const [isLobby, setIsLobby] = useState<boolean>(false);
const [players, setPlayers] = useState<string[]>([]);
const [isLive, setIsLive] = useState<boolean>(false);
const [isSocketReady, setIsSocketReady] = useState<boolean>(false);
const [liveQuestions, setLiveQuestions] = useState<QuizQuestion[]>([]);
const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[] | null>(null);


const resetDashboardState = () => {
  socketRef.current?.close();
  socketRef.current = null;
  setIsSocketReady(false);
  setToken("");
  localStorage.removeItem("adminToken");
  setQuizId("");
  setIsLobby(false);
  setIsLive(false);
  setStatusMsg(null);
  setLeaderboard(null);
  setPlayers([]);
  setLiveQuestions([]);
  setCurrentQuestionIndex(0);
};

const handleLogout = () => {
  resetDashboardState();
  setSessionExpiredMsg(null); // Clear message on voluntary logout
};


const handleSessionExpired = () => {
  resetDashboardState();
  setSessionExpiredMsg("Your session has expired. Please log in again.");
};

const handleCreateQuiz = async () => {
  setStatusMsg(null);
  setQuizFieldErrors({});

  const title = titleRef.current?.value.trim() || "";
  const description = descriptionRef.current?.value.trim() || "";

  if (!title) {
    setStatusMsg({ type: "error", text: "Please enter a title." });
    return;
  }

  try {
    const response = await axios.post<CreateQuizResponse>(
      `${API_URL}/api/quiz`,
      { title, description },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    if (response.data.quizId) {
      setQuizId(response.data.quizId);
      setStatusMsg({ type: "success", text: "Room ready. Add some questions!" });
    }
  } catch (error: unknown) {
    if (isUnauthorized(error)) return handleSessionExpired(); 

    console.error("Failed to create quiz:", error);
    const mappedErrors = mapValidationErrors(error);

    if (mappedErrors) {
      setQuizFieldErrors(mappedErrors);
      setStatusMsg({ type: "error", text: "Check the fields below." });
    } else {
      setStatusMsg({ type: "error", text: "Failed to create quiz." });
    }
  }
};

const handleAddQuestion = async () => {
  setStatusMsg(null);
  setQuestionFieldErrors({});

  const text = questionTextRef.current?.value.trim() || "";

  if (!text) {
    setStatusMsg({ type: "error", text: "Question text is required." });
    return;
  }

  try {
    const response = await axios.post<QuizResponse>(
      `${API_URL}/api/quiz/${quizId}/question`,
      { text, options },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    if (response.status === 201) {
      setStatusMsg({ type: "success", text: "Saved to bank!" });
      if (questionTextRef.current) questionTextRef.current.value = "";
      setOptions(createEmptyOptions());
    }
  } catch (error: unknown) {
    if (isUnauthorized(error)) return handleSessionExpired(); 

    console.error("Failed to add question:", error);
    const mappedErrors = mapValidationErrors(error);

    if (mappedErrors) {
      setQuestionFieldErrors(mappedErrors);
      setStatusMsg({ type: "error", text: "Check the fields below." });
    } else {
      setStatusMsg({ type: "error", text: "Failed to add question." });
    }
  }
};

const updateOptionText = (index: number, text: string) => {
  setOptions((prevOptions) =>
    prevOptions.map((option, currentIndex) =>
      currentIndex === index ? { ...option, text } : option
    )
  );
};


const handleOpenLobby = async () => {
  setStatusMsg(null);
  setIsSocketReady(false);

  try {
    const response = await axios.get<QuizResponse>(`${API_URL}/api/quiz/${quizId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = response.data;

    if (data.questions.length === 0) {
      setStatusMsg({ type: "error", text: "Add a question first!" });
      return;
    }

    setLiveQuestions(data.questions);
    setIsLobby(true);

    const ws = new WebSocket(WS_URL);

    ws.onopen = () => {
      socketRef.current = ws;
      setIsSocketReady(true);

      const message: AdminClientMessage = {
        type: "JOIN_ADMIN",
        payload: { roomId: quizId, token: token },
      };

      ws.send(JSON.stringify(message));
    };

    ws.onmessage = (event: MessageEvent<string>) => {
      const msg = JSON.parse(event.data) as AdminServerMessage;

      if (msg.type === "LOBBY_UPDATE") {
        setPlayers(msg.payload.players);
      } else if (msg.type === "LEADERBOARD") {
        setLeaderboard(msg.payload.leaderboard);
        setIsLive(false);
        setIsLobby(false);
      }
    };

    ws.onclose = () => {
      socketRef.current = null;
      setIsSocketReady(false);
    };

    ws.onerror = () => {
      setIsSocketReady(false);
      setStatusMsg({ type: "error", text: "Socket connection failed." });
    };
  } catch (error: unknown) {
    if (isUnauthorized(error)) return handleSessionExpired(); 

    console.error("Failed to open lobby", error);
    setStatusMsg({ type: "error", text: "Failed to open lobby." });
  }
};

const handleStartGameFromLobby = () => {
  if (!socketRef.current || !isSocketReady) {
    setStatusMsg({ type: "error", text: "Socket is not ready yet." });
    return;
  }

  if (liveQuestions.length === 0) {
    setStatusMsg({ type: "error", text: "No questions available." });
    return;
  }

  setCurrentQuestionIndex(0);
  setIsLobby(false);
  setIsLive(true);

  const message: AdminClientMessage = {
    type: "NEXT_QUESTION",
    payload: {
      roomId: quizId,
      question: liveQuestions[0],
      deadline: Date.now() + 10 * 1000,
    },
  };

  socketRef.current.send(JSON.stringify(message));
};


const handleNextQuestion = () => {
  const nextIndex = currentQuestionIndex + 1;

  if (!socketRef.current || !isSocketReady) {
    setStatusMsg({ type: "error", text: "Socket is not ready yet." });
    return;
  }

  if (nextIndex < liveQuestions.length) {
    setCurrentQuestionIndex(nextIndex);

    const message: AdminClientMessage = {
      type: "NEXT_QUESTION",
      payload: {
        roomId: quizId,
        question: liveQuestions[nextIndex],
        deadline: Date.now() + 10 * 1000,
      },
    };

    socketRef.current.send(JSON.stringify(message));
  } else {
    handleShowLeaderboard();
  }
};


const handleShowLeaderboard = () => {
  if (!socketRef.current || !isSocketReady) {
    setStatusMsg({ type: "error", text: "Socket is not ready yet." });
    return;
  }

  const message: AdminClientMessage = {
    type: "SHOW_LEADERBOARD",
    payload: { roomId: quizId },
  };

  socketRef.current.send(JSON.stringify(message));
};

return (
<div className="h-screen w-screen overflow-hidden flex flex-col bg-[#F7F7F7] text-gray-900 font-sans selection:bg-[#E5F156] selection:text-black">
{/* Navbar */}
<nav className="shrink-0 flex justify-between items-center w-full max-w-7xl mx-auto py-4 px-4 md:px-8">
<div className="flex items-center gap-2 cursor-pointer" onClick={() => (window.location.href = "/")}>
<div className="w-8 h-8 bg-black rounded-full flex items-center justify-center">
<div className="w-3 h-3 bg-[#72D177] rounded-full animate-pulse"></div>
</div>
<span className="text-2xl font-extrabold tracking-tighter text-black">
QUIZORA<span className="text-gray-400 font-medium ml-1">Host</span>
</span>
</div>

{token && (
<button
onClick={handleLogout}
className="px-6 py-2 bg-white border border-gray-200 text-gray-600 font-bold rounded-full hover:bg-red-50 hover:text-red-600 transition-all text-sm shadow-sm"
>
Exit Workspace
</button>
)}
</nav>

<div className="flex-1 w-full flex flex-col items-center px-4 overflow-hidden pb-4 min-h-0">
{/* 1. AUTH SCREEN */}
{!token ? (
<div className="my-auto w-full max-w-5xl animate-fade-in overflow-y-auto">
<AuthCard setToken={setToken} sessionExpiredMsg={sessionExpiredMsg} />
</div>
) : /*  2. FINAL LEADERBOARD DASHBOARD */
leaderboard ? (
<div className="w-full h-full max-w-4xl mt-4 animate-fade-in overflow-y-auto">
<UserLeaderboard leaderboard={leaderboard} />
</div>
) : /* 3. LIVE GAME HOST DASHBOARD */
isLive ? (
<div className="w-full h-full max-w-5xl py-4 animate-fade-in flex flex-col min-h-0">
<LiveDashboard
quizId={quizId}
currentQuestionIndex={currentQuestionIndex}
liveQuestions={liveQuestions}
handleNextQuestion={handleNextQuestion}
handleShowLeaderboard={handleShowLeaderboard}
/>
</div>
) : /* 4. WAITING LOBBY */
isLobby ? (
<div className="w-full h-full max-w-4xl mt-4 animate-fade-in overflow-y-auto">
<WaitingLobby
quizId={quizId}
players={players}
isSocketReady={isSocketReady}
handleStartGameFromLobby={handleStartGameFromLobby}
/>
</div>
) : /* 5. CREATION & AI GENERATOR DASHBOARD */
(
<div className="w-full h-full max-w-[1200px] animate-fade-in flex flex-col items-center min-h-0">
{/* Status Banner */}
{statusMsg && (
<div
className={`shrink-0 mb-3 px-5 py-2 rounded-full font-bold text-sm shadow-sm flex items-center gap-2 border ${
statusMsg.type === "error"
? "bg-red-50 text-red-600 border-red-200"
: "bg-[#72D177]/10 text-[#2E7D32] border-[#72D177]/30"
}`}
>
<span>{statusMsg.type === "error" ? "⚠️" : "✨"}</span> {statusMsg.text}
</div>
)}

{!quizId ? (
/* CREATE WORKSPACE */
<div className="my-auto flex flex-col md:flex-row bg-white rounded-[2rem] shadow-2xl shadow-black/5 w-full max-w-5xl overflow-y-auto border border-black/5 relative z-10 shrink-0">
<div className="md:w-1/2 bg-[#72D177] relative items-center justify-center p-10 lg:p-12 flex flex-col text-center">
<div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
<div className="absolute bottom-0 left-0 w-40 h-40 bg-[#E5F156]/30 rounded-full blur-2xl -ml-10 -mb-10 pointer-events-none"></div>
<div className="relative animate-bounce-slow max-w-[14rem] aspect-square bg-white/20 rounded-[2rem] backdrop-blur-sm border border-white/30 flex items-center justify-center overflow-hidden">
<div className="w-24 h-32 bg-white rounded-xl shadow-xl flex flex-col p-3 gap-2 relative">
<div className="w-full h-2 bg-[#E5F156] rounded-full"></div>
<div className="w-3/4 h-1.5 bg-gray-100 rounded-full"></div>
<div className="w-full h-1.5 bg-gray-100 rounded-full"></div>
<div className="mt-auto flex justify-between">
<div className="w-6 h-6 rounded-full bg-[#72D177]/20 border-2 border-[#72D177]"></div>
<div className="w-6 h-6 rounded-full bg-gray-100"></div>
</div>
</div>
</div>
<div className="mt-8 relative z-10">
<h3 className="text-3xl font-black text-black mb-1 tracking-tight">Host Setup.</h3>
<p className="text-black/70 font-bold text-sm max-w-[16rem] mx-auto">
Create a new room to add questions manually or via AI.
</p>
</div>
</div>

<div className="w-full md:w-1/2 p-8 lg:p-12 flex flex-col justify-center bg-white">
<div className="mb-8">
<h2 className="text-2xl font-black text-black tracking-tight mb-1">Room Details</h2>
<p className="text-gray-500 font-medium text-sm">
Name your session to get started.
</p>
</div>
<div className="space-y-5 mb-8">
<div className="group">
<label className="block text-xs font-black uppercase tracking-widest text-gray-800 mb-1.5 ml-1 group-focus-within:text-black transition-colors">
Quiz Title
</label>
<input
ref={titleRef}
type="text"
placeholder="e.g. JavaScript Basics"
className={`w-full p-4 rounded-xl bg-gray-50 border-2 font-bold text-base placeholder-gray-400 focus:ring-0 outline-none transition-all shadow-inner ${
quizFieldErrors.title
? "border-red-400 bg-red-50"
: "border-transparent focus:border-black focus:bg-white"
}`}
/>
</div>
<div className="group">
<label className="block text-xs font-black uppercase tracking-widest text-gray-800 mb-1.5 ml-1 group-focus-within:text-black transition-colors">
Description (Optional)
</label>
<input
ref={descriptionRef}
type="text"
placeholder="e.g. A quick test on core concepts"
className={`w-full p-4 rounded-xl bg-gray-50 border-2 font-medium text-base placeholder-gray-400 focus:ring-0 outline-none transition-all shadow-inner ${
quizFieldErrors.description
? "border-red-400 bg-red-50"
: "border-transparent focus:border-black focus:bg-white"
}`}
/>
</div>
</div>
<button
onClick={handleCreateQuiz}
className="w-full py-4 rounded-[1.2rem] font-bold transition-all text-base flex justify-center items-center gap-2 bg-black text-white hover:bg-[#72D177] hover:text-black active:scale-95 shadow-lg shadow-black/10"
>
Continue
</button>
</div>
</div>
) : (
/* ADD QUESTIONS WORKSPACE */
<div className="w-full h-full flex flex-col gap-3 min-h-0">
{/* Header Control Panel */}
<div className="shrink-0 flex justify-between items-center bg-white p-3 md:px-6 border border-black/5 shadow-sm rounded-full">
<div className="flex items-center gap-2">
<span className="relative flex h-2.5 w-2.5">
<span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#72D177] opacity-75"></span>
<span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#72D177]"></span>
</span>
<h2 className="text-base font-bold text-black">Room Active</h2>
</div>

<div className="flex items-center gap-2">
<span className="font-bold text-[10px] uppercase text-gray-400">PIN:</span>
<span className="text-lg font-black text-black">{quizId}</span>
</div>
</div>

{/* Grid Layout */}
<div className="flex-1 grid lg:grid-cols-3 gap-4 min-h-0">
{/* LEFT: Manual Builder */}
<div className="lg:col-span-2 bg-white p-5 lg:p-6 rounded-[2rem] border border-black/5 shadow-xl shadow-black/5 flex flex-col min-h-0">
<h3 className="shrink-0 text-xl font-black text-black mb-4">Write a Question</h3>

<div className="shrink-0 mb-4">
<label className="block text-[10px] font-bold uppercase text-gray-400 mb-1.5 ml-1">Question</label>
<input
type="text"
placeholder="e.g. What is the DOM?"
ref={questionTextRef}
className={`w-full p-3 rounded-xl bg-gray-50 border-2 font-bold text-base outline-none transition-all ${
questionFieldErrors.text
? "border-red-400"
: "border-transparent focus:border-black focus:bg-white"
}`}
/>
</div>

{/* Scrollable Answers Area */}
<div className="flex-1 flex flex-col min-h-0">
<label className="shrink-0 block text-[10px] font-bold uppercase text-gray-400 mb-1.5 ml-1">Answers</label>
<div className="flex-1 overflow-y-auto pr-1 space-y-2.5">
{options.map((opt, i) => (
<div key={i} className="flex gap-2.5 group">
<div
className={`w-10 flex-shrink-0 flex items-center justify-center rounded-xl font-bold text-base transition-colors ${
i === 0
? "bg-[#72D177]/20 text-[#2E7D32]"
: "bg-gray-100 text-gray-400 group-focus-within:bg-[#E5F156]/30 group-focus-within:text-black"
}`}
>
{String.fromCharCode(65 + i)}
</div>
<input
type="text"
placeholder={i === 0 ? "Correct Answer" : "Wrong Answer"}
value={opt.text}
onChange={(e) => updateOptionText(i, e.target.value)}
className={`w-full py-2.5 px-3 rounded-xl font-medium text-sm outline-none border-2 transition-all ${
i === 0
? "bg-[#72D177]/5 border-[#72D177]/30 focus:border-[#72D177] text-black"
: "bg-gray-50 border-transparent focus:border-black focus:bg-white"
}`}
/>
</div>
))}
</div>
</div>

<button
onClick={handleAddQuestion}
className="shrink-0 mt-4 w-full py-3 bg-white border-2 border-gray-200 rounded-full font-bold text-sm hover:border-black hover:bg-gray-50 transition-colors"
>
+ Add to Quiz
</button>
</div>

{/* RIGHT: AI Generator & Launch Panel */}
<div className="lg:col-span-1 flex flex-col gap-4 min-h-0">
{/* AI Block */}
<div className="bg-white p-5 lg:p-6 rounded-[2rem] border-2 border-[#72D177]/30 shadow-xl shadow-[#72D177]/10 flex-1 flex flex-col min-h-0">
<h3 className="shrink-0 text-lg font-black text-black mb-1">AI Magic</h3>
<p className="shrink-0 text-gray-500 font-medium text-[11px] mb-4">Drop a PDF. Get instant questions.</p>
<div className="flex-1 overflow-y-auto min-h-0">
<AIGeneratorCard quizId={quizId} token={token} onSessionExpired={handleSessionExpired} />
</div>
</div>

{/* Launch Block */}
<div className="shrink-0 bg-white p-5 lg:p-6 rounded-[2rem] border-2 border-[#E5F156]/50 shadow-xl shadow-[#E5F156]/10 text-center">
<h3 className="text-lg font-black text-black mb-1">Launch</h3>
<p className="text-gray-500 font-medium text-[11px] mb-4">Open the room to players.</p>
<button
onClick={handleOpenLobby}
className="w-full py-3 bg-black text-white rounded-full font-bold text-sm hover:scale-[1.02] shadow-md transition-transform"
>
Start Game
</button>
</div>
</div>
</div>
</div>
)}
</div>
)}
</div>
</div>
);
}