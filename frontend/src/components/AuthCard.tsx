import React, { useState, useRef } from "react";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

export default function AuthCard({ setToken }: { setToken: (token: string) => void }) {
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});

  const usernameRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null); // Reset error
    setFieldErrors({}); // Reset field errors

    const username = usernameRef.current?.value;
    const password = passwordRef.current?.value;

    if (!username || !password) return setError("Please enter both username and password.");

    const endpoint = isLogin ? "login" : "signup";

    try {
      const res = await axios.post(`${API_URL}/api/admin/${endpoint}`, {
        username,
        password
      });

      if (res.data.token) {
        setToken(res.data.token);
        localStorage.setItem("adminToken", res.data.token);
      }
    } catch (error: any) {
      console.error("Auth failed", error);

      // Map Zod details to our inputs
      if (error.response?.data?.details) {
        const mappedErrors: { [key: string]: string } = {};
        error.response.data.details.forEach((detail: any) => {
          mappedErrors[detail.field] = detail.message;
        });
        setFieldErrors(mappedErrors);
        setError("Please fix the highlighted fields below.");
      } else {
        setError(error.response?.data?.error || "Authentication failed. Please try again.");
      }
    }
  };

  return (
    <div className="w-full bg-white rounded-[2.5rem] shadow-2xl shadow-black/10 flex flex-col md:flex-row overflow-hidden border border-black/5 min-h-[500px]">
      
      {/* 1. LEFT BRAND PANEL */}
      <div className="w-full md:w-5/12 bg-[#72D177] p-10 md:p-12 flex flex-col items-center justify-center text-center relative overflow-hidden">
        
        {/* Decorative background shapes */}
        <div className="absolute top-[-10%] right-[-10%] w-64 h-64 bg-white/20 blur-3xl rounded-full pointer-events-none"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-40 h-40 bg-black/10 blur-2xl rounded-full pointer-events-none"></div>

        <h2 className="text-4xl md:text-5xl font-black text-black tracking-tight mb-4 relative z-10">
          {isLogin ? "Welcome Back!" : "Join Quizora!"}
        </h2>

        <p className="text-black/80 font-medium text-base md:text-lg max-w-[250px] leading-relaxed relative z-10">
          {isLogin
            ? "To keep connected with us please login with your admin info."
            : "Set up your admin profile to start hosting live AI quizzes."}
        </p>

        {/* Toggle Button */}
        <button
          type="button"
          onClick={() => {
            setIsLogin(!isLogin);
            setError(null);
            setFieldErrors({});
          }}
          className="mt-8 px-10 py-3 rounded-full border-2 border-black text-black font-bold tracking-wide hover:bg-black hover:text-white transition-colors relative z-10 uppercase text-sm"
        >
          {isLogin ? "Sign Up" : "Sign In"}
        </button>
      </div>

      {/* 2. RIGHT AUTH FORM */}
      <div className="w-full md:w-7/12 bg-white p-10 md:p-16 flex flex-col justify-center items-center">
        <h3 className="text-3xl md:text-4xl font-black text-[#72D177] mb-8 text-center">
          {isLogin ? "Sign In to Workspace" : "Create Account"}
        </h3>

        {/* Global Error Message */}
        {error && (
          <div className="w-full max-w-sm mb-6 bg-red-50 border border-red-100 px-4 py-3 rounded-xl flex items-start gap-3">
            <span className="text-red-500 mt-0.5">⚠️</span>
            <p className="text-sm font-bold text-red-600 leading-snug">{error}</p>
          </div>
        )}

        <form onSubmit={handleAuth} className="flex flex-col gap-4 w-full max-w-sm">
          
          {/* Username Input */}
          <div className="flex flex-col">
            <div
              className={`flex items-center bg-gray-50 border-2 rounded-xl px-4 py-3 transition-colors ${
                fieldErrors.username
                  ? "border-red-400 bg-red-50/50"
                  : "border-gray-100 focus-within:bg-white focus-within:border-[#72D177]"
              }`}
            >
              {/* User Icon */}
              <svg className="w-5 h-5 text-gray-400 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <input
                type="text"
                ref={usernameRef}
                placeholder="Username or Email"
                className="w-full bg-transparent outline-none font-medium text-gray-900 placeholder:text-gray-400"
              />
            </div>
            {fieldErrors.username && (
              <span className="text-red-500 text-xs font-bold pl-2 mt-1 animate-fade-in">
                {fieldErrors.username}
              </span>
            )}
          </div>

          {/* Password Input */}
          <div className="flex flex-col">
            <div
              className={`flex items-center bg-gray-50 border-2 rounded-xl px-4 py-3 transition-colors ${
                fieldErrors.password
                  ? "border-red-400 bg-red-50/50"
                  : "border-gray-100 focus-within:bg-white focus-within:border-[#72D177]"
              }`}
            >
              {/* Lock Icon */}
              <svg className="w-5 h-5 text-gray-400 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <input
                type="password"
                ref={passwordRef}
                placeholder="Password"
                className="w-full bg-transparent outline-none font-medium text-gray-900 placeholder:text-gray-400"
              />
            </div>
            {fieldErrors.password && (
              <span className="text-red-500 text-xs font-bold pl-2 mt-1 animate-fade-in">
                {fieldErrors.password}
              </span>
            )}
          </div>

          {/* Action Button */}
          <button
            type="submit"
            className="w-full mt-4 py-4 rounded-full bg-[#72D177] text-white font-black uppercase tracking-widest text-sm hover:bg-[#5eb663] hover:shadow-lg hover:-translate-y-0.5 transition-all"
          >
            {isLogin ? "Sign In" : "Sign Up"}
          </button>
        </form>
      </div>
    </div>
  );
}