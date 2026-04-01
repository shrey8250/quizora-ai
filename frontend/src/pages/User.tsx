import { useEffect, useState, useRef } from "react";
import UserLoginForm from "../components/UserLoginForm";
import UserWaitingRoom from "../components/UserWaitingRoom";
import UserLiveQuiz from "../components/UserLiveQuiz";
import UserLeaderboard from "../components/UserLeaderboard";

const WS_URL = import.meta.env.VITE_WS_URL || "ws://localhost:8080";

export default function User() {
  const socketRef = useRef<WebSocket | null>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const roomIdRef = useRef<HTMLInputElement>(null);

  const [isConnected, setIsConnected] = useState(false);
  const [hasJoined, setHasJoined] = useState(false);
  const [error, setError] = useState<string | null>(null); // Error state
  
  const [currentQuestion, setCurrentQuestion] = useState<any>(null);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [leaderboard, setLeaderboard] = useState<any[] | null>(null);

  const [deadline, setDeadline] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(10);

  useEffect(() => {
    const ws = new WebSocket(WS_URL);

    ws.onopen = () => {
      setIsConnected(true);
      socketRef.current = ws;
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      if (data.type === "NEXT_QUESTION") {
        console.log("Got a new question!", data.payload.question);

        // Shuffling options (same as your old logic)
        const incomingQuestion = data.payload.question;
        incomingQuestion.options = [...incomingQuestion.options].sort(() => Math.random() - 0.5);
        
        setCurrentQuestion(incomingQuestion); // Save shuffled question
        setSelectedOption(null); 
        setLeaderboard(null);    
        setDeadline(data.payload.deadline); 
      }

      if (data.type === "LEADERBOARD") {
        setLeaderboard(data.payload.leaderboard);
        setCurrentQuestion(null); 
        setDeadline(null);        
      }
    };

    ws.onclose = () => {
      setIsConnected(false);
      socketRef.current = null;
    };

    return () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    };
  }, []);

  // The Synchronous Timer Logic (same as your original)
  useEffect(() => {
    if (!deadline) return;

    const interval = setInterval(() => {
      const now = Date.now();
      const remaining = Math.max(0, Math.floor((deadline - now) / 1000));
      setTimeLeft(remaining);

      if (remaining === 0) {
        clearInterval(interval);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [deadline]);

  const handleJoinRoom = () => {
    setError(null); // Reset error

    const name = nameRef.current?.value.trim();
    const roomId = roomIdRef.current?.value.trim();

    if (!name || !roomId) {
      // Updated text (Gemini change)
      setError("Please enter both a Nickname and a Room PIN");
      return;
    }
    
    if (socketRef.current && isConnected) {
      const message = {
        type: "JOIN_ROOM",
        payload: { roomId, name }
      };
      
      socketRef.current.send(JSON.stringify(message));
      setHasJoined(true);
    } else {
      setError("Still connecting to server... please wait.");
    }
  };

  const handleAnswerClick = (option: any) => {
    // Prevent multiple answers or answering after timeout
    if (selectedOption || timeLeft === 0) return; 

    setSelectedOption(option._id || option.text);

    if (socketRef.current && isConnected) {
      socketRef.current.send(JSON.stringify({
        type: "SUBMIT_ANSWER",
        payload: { answerText: option.text } // Send actual answer text
      }));
    }
  };

  return (
    // ✨ Updated UI (light theme + modern styling)
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#F7F7F7] text-gray-900 font-sans p-4 selection:bg-[#E5F156] selection:text-black relative">
      
      {/* ✨ Logo (new addition from Gemini UI) */}
      {!hasJoined && (
        <div 
          className="absolute top-6 left-6 md:top-8 md:left-8 flex items-center gap-2 cursor-pointer" 
          onClick={() => window.location.href = '/'}
        >
          <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center">
            <div className="w-3 h-3 bg-[#72D177] rounded-full animate-pulse"></div>
          </div>
          <span className="text-2xl font-extrabold tracking-tighter text-black">
            QUIZORA
          </span>
        </div>
      )}

      {/* Routing logic (UNCHANGED) */}
      {!hasJoined ? (
        <UserLoginForm 
          nameRef={nameRef} 
          roomIdRef={roomIdRef} 
          isConnected={isConnected} 
          handleJoinRoom={handleJoinRoom} 
          error={error}
        />
      ) : leaderboard ? (
        <UserLeaderboard leaderboard={leaderboard} />
      ) : !currentQuestion ? (
        <UserWaitingRoom playerName={nameRef.current?.value || "Player"} />
      ) : (
        <UserLiveQuiz 
          currentQuestion={currentQuestion} 
          timeLeft={timeLeft} 
          selectedOption={selectedOption} 
          handleAnswerClick={handleAnswerClick} 
        />
      )}
    </div>
  );
}