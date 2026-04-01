export default function LiveDashboard({
  quizId,
  currentQuestionIndex,
  liveQuestions,
  handleNextQuestion,
  handleShowLeaderboard
}: {
  quizId: string;
  currentQuestionIndex: number;
  liveQuestions: any[];
  handleNextQuestion: () => void;
  handleShowLeaderboard: () => void;
}) {
  const currentQuestion = liveQuestions[currentQuestionIndex];
  const progressPercentage = ((currentQuestionIndex + 1) / liveQuestions.length) * 100;
  const isLastQuestion = currentQuestionIndex === liveQuestions.length - 1;

  return (
    // ✨ 100vh Constraint Wrapper
    <div className="w-full h-full flex flex-col animate-fade-in min-h-0 px-2 md:px-0 pb-4">
      
      {/* Main Application Card */}
      <div className="flex-1 bg-white rounded-[2.5rem] shadow-2xl shadow-black/5 border border-black/5 flex flex-col overflow-hidden min-h-0">

        {/* 1. TOP HEADER (Pinned) */}
        <div className="shrink-0 bg-[#72D177] px-6 py-5 md:px-10 flex items-center justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-white/20 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
          
          <div className="flex items-center gap-4 relative z-10">
            <div className="flex items-center gap-2 bg-black/10 px-4 py-1.5 rounded-full backdrop-blur-md border border-black/5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-600 shadow-[0_0_8px_rgba(220,38,38,0.8)]"></span>
              </span>
              <span className="font-black text-[10px] uppercase tracking-widest text-black">Live</span>
            </div>
            <span className="font-bold text-xs uppercase tracking-widest text-black/70">
              Round {currentQuestionIndex + 1} of {liveQuestions.length}
            </span>
          </div>

          <div className="flex items-center gap-3 relative z-10">
            <span className="font-bold text-[10px] uppercase tracking-widest text-black/60 hidden sm:block">
              Access Code
            </span>
            <div className="bg-white px-4 py-1.5 rounded-xl shadow-sm border border-black/5">
              <span className="font-black text-sm md:text-base tracking-widest text-black uppercase">
                {quizId}
              </span>
            </div>
          </div>
        </div>

        {/* 2. ELEGANT PROGRESS BAR */}
        <div className="shrink-0 w-full h-1.5 bg-gray-100 relative">
          <div 
            className="absolute top-0 left-0 h-full bg-black rounded-r-full transition-all duration-700 ease-out"
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>

        {/* ✨ 3. QUESTION AREA (Fixed layout constraints + smarter typography) */}
        <div className="flex-1 flex flex-col items-center justify-center p-6 md:p-10 text-center bg-gray-50/30 overflow-y-auto min-h-0">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-black text-black leading-snug tracking-tight max-w-4xl mx-auto break-words py-2">
            {currentQuestion?.text}
          </h2>
        </div>

        {/* 4. OPTIONS & CONTROL FOOTER */}
        <div className="shrink-0 bg-white border-t border-gray-100 p-6 md:p-8 flex flex-col gap-6 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.03)] z-10">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-5xl mx-auto w-full">
            {currentQuestion?.options.map((opt: any, i: number) => (
              <div 
                key={i} 
                className={`flex items-center p-3 md:p-4 rounded-[1.5rem] border-2 transition-all ${
                  opt.isCorrect 
                    ? 'bg-[#72D177]/10 border-[#72D177] shadow-sm' 
                    : 'bg-white border-gray-100 opacity-60'
                }`}
              >
                <div className={`w-10 h-10 md:w-12 md:h-12 shrink-0 flex items-center justify-center rounded-xl font-black text-lg mr-4 ${
                  opt.isCorrect ? 'bg-[#72D177] text-white shadow-md' : 'bg-gray-100 text-gray-400'
                }`}>
                  {String.fromCharCode(65 + i)}
                </div>
                <span className={`font-bold text-base md:text-lg flex-1 leading-snug break-words pr-2 ${
                  opt.isCorrect ? 'text-black' : 'text-gray-500'
                }`}>
                  {opt.text}
                </span>
                {opt.isCorrect && (
                  <span className="shrink-0 bg-[#72D177]/20 text-[#2E7D32] border border-[#72D177]/30 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ml-2">
                    Correct
                  </span>
                )}
              </div>
            ))}
          </div>

          <div className="flex flex-col md:flex-row items-center justify-between max-w-5xl mx-auto w-full pt-4 border-t border-gray-50 gap-4">
            <div className="text-center md:text-left">
              <h3 className="text-xl md:text-2xl font-black tracking-tight text-black mb-1">
                {isLastQuestion ? "Final Round Complete" : "Round Active"}
              </h3>
              <p className="text-xs md:text-sm font-bold text-gray-400">
                {isLastQuestion 
                  ? "All rounds finished. Reveal the winner when ready." 
                  : "Push the next challenge to competitors' devices."}
              </p>
            </div>
            
            <div className="w-full md:w-auto shrink-0">
              {!isLastQuestion ? (
                <button
                  onClick={handleNextQuestion}
                  className="w-full md:w-auto py-4 px-8 bg-black text-white rounded-2xl font-black text-lg hover:bg-[#72D177] hover:text-black transition-all flex items-center justify-center gap-3 shadow-xl shadow-black/10 hover:-translate-y-1 active:scale-95 group"
                >
                  Launch Next Round
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </button>
              ) : (
                <button
                  onClick={handleShowLeaderboard}
                  className="w-full md:w-auto py-4 px-8 bg-[#E5F156] text-black rounded-2xl font-black text-lg hover:bg-[#d4df43] transition-all flex items-center justify-center gap-3 shadow-xl shadow-[#E5F156]/20 hover:-translate-y-1 active:scale-95"
                >
                  Final Leaderboard
                  <span className="text-xl animate-bounce-slow">🏆</span>
                </button>
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}