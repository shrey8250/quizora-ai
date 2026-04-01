export default function UserLiveQuiz({
  currentQuestion,
  timeLeft,
  selectedOption,
  handleAnswerClick
}: {
  currentQuestion: any;
  timeLeft: number;
  selectedOption: string | null;
  handleAnswerClick: (option: any) => void;
}) {
  const totalTime = 10;
  const progressPercentage = (timeLeft / totalTime) * 100;

  const isTimeCritical = timeLeft <= 3 && timeLeft > 0;
  const isTimeUp = timeLeft === 0;
  const hasAnswered = selectedOption !== null;

  return (
    // ✨ Restored max-w-4xl constraint, but forced it to respect 100vh
    <div className="w-full max-w-4xl mx-auto h-full max-h-full flex flex-col justify-center animate-fade-in py-4">
      
      {/* 1. MAIN QUIZ STAGE (Flex column that cannot exceed its parent) */}
      <div className="w-full bg-white rounded-[2.5rem] shadow-2xl shadow-black/5 border border-black/5 flex flex-col overflow-hidden max-h-full min-h-0">

        {/* 2. HEADER + TIMER AREA (Pinned) */}
        <div className="shrink-0 px-6 py-5 md:px-10 md:py-6 flex items-center justify-between transition-colors duration-500 bg-[#72D177] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 pointer-events-none"></div>

          <div className="flex items-center gap-3 relative z-10">
            {isTimeUp ? (
              <div className="flex items-center gap-2 bg-black/10 px-4 py-2 rounded-full backdrop-blur-md">
                <span className="text-sm">🔒</span>
                <span className="font-black text-xs text-black uppercase tracking-widest">Round Closed</span>
              </div>
            ) : hasAnswered ? (
              <div className="flex items-center gap-2 bg-white/30 px-4 py-2 rounded-full backdrop-blur-md">
                <div className="flex gap-1">
                  <span className="w-1.5 h-1.5 bg-black rounded-full animate-bounce"></span>
                  <span className="w-1.5 h-1.5 bg-black rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></span>
                </div>
                <span className="font-black text-xs text-black uppercase tracking-widest">Secured</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 bg-black/10 px-4 py-2 rounded-full backdrop-blur-md">
                <span className={`w-2 h-2 rounded-full bg-white ${isTimeCritical ? "animate-ping" : "animate-pulse"}`}></span>
                <span className="font-black text-xs text-black uppercase tracking-widest">Live</span>
              </div>
            )}
          </div>

          <div className="relative z-10">
            {isTimeUp ? (
              <span className="font-bold text-[10px] text-black/60 uppercase tracking-widest">
                Check Host Screen
              </span>
            ) : (
              <div className="flex items-center gap-3 bg-white/90 px-4 py-1.5 rounded-2xl shadow-sm border border-black/5">
                <span className="font-bold text-[10px] text-gray-400 uppercase tracking-widest">Time</span>
                <span className={`font-mono font-black text-2xl tracking-tighter ${isTimeCritical ? "text-red-500 animate-pulse" : "text-black"}`}>
                  {timeLeft}s
                </span>
              </div>
            )}
          </div>
        </div>

        {/* 3. TIMER PROGRESS BAR (Pinned) */}
        {!isTimeUp && (
          <div className="shrink-0 w-full h-1.5 bg-[#72D177]/20 relative">
            <div
              className={`absolute top-0 left-0 h-full rounded-r-full transition-all duration-1000 ease-linear ${isTimeCritical ? "bg-red-500" : "bg-black"}`}
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
        )}

        {/* ✨ 4. QUESTION AREA (Flex-1 makes it stretch, overflow-y-auto enables scrolling for long text) */}
        <div className="flex-1 flex flex-col items-center justify-center px-6 py-6 md:px-12 text-center bg-white border-b border-gray-50 overflow-y-auto min-h-0">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-black text-black leading-snug tracking-tight max-w-3xl mx-auto break-words py-2">
            {currentQuestion?.text}
          </h2>
        </div>

        {/* 5. ANSWER OPTIONS (Pinned) */}
        <div className="shrink-0 px-6 pb-8 pt-4 md:px-12 md:pb-12 md:pt-6 bg-white">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5 w-full max-w-4xl mx-auto">
            {currentQuestion?.options?.map((option: any, i: number) => {
              const optionIdentifier = option._id || option.text;
              const isSelected = selectedOption === optionIdentifier;
              const isDisabled = hasAnswered || isTimeUp;

              return (
                <button
                  key={optionIdentifier}
                  disabled={isDisabled}
                  onClick={() => handleAnswerClick(option)}
                  className={`
                    group relative w-full p-4 md:p-5 rounded-[1.5rem] border-2 flex items-center gap-4 transition-all duration-200 text-left overflow-hidden
                    ${
                      isSelected
                        ? "border-black bg-gray-50 scale-[0.98] shadow-inner"
                        : isDisabled
                        ? "border-gray-100 bg-white opacity-50 cursor-not-allowed"
                        : "border-gray-200 bg-white hover:border-black hover:-translate-y-0.5 hover:shadow-lg cursor-pointer"
                    }
                  `}
                >
                  {isSelected && (
                    <div className="absolute top-0 right-0 w-12 h-12 bg-black rounded-bl-[1.5rem] flex items-center justify-center -mr-1 -mt-1">
                      <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}

                  <div className={`w-12 h-12 flex-shrink-0 flex items-center justify-center rounded-xl font-black text-lg transition-colors ${
                    isSelected ? "bg-black text-white" : "bg-gray-100 text-gray-400 group-hover:bg-gray-200 group-hover:text-black"
                  }`}>
                    {String.fromCharCode(65 + i)}
                  </div>

                  <span className={`font-bold text-lg md:text-xl break-words pr-6 leading-snug ${
                    isSelected ? "text-black" : isDisabled ? "text-gray-400" : "text-gray-900"
                  }`}>
                    {option.text}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
        
      </div>
    </div>
  );
}