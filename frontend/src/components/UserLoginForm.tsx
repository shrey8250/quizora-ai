export default function UserLoginForm({
  nameRef,
  roomIdRef,
  isConnected,
  handleJoinRoom,
  error
}: {
  nameRef: any;
  roomIdRef: any;
  isConnected: boolean;
  handleJoinRoom: () => void;
  error?: string | null;
}) {
  return (
    // ✨ Updated: Split screen premium UI (left illustration + right form)
    <div className="flex flex-col md:flex-row bg-white rounded-[2.5rem] shadow-2xl shadow-black/5 w-full max-w-5xl overflow-hidden border border-black/5 animate-fade-in">
      
      {/* ✨ Left Side: Illustration Panel (pure UI, no logic) */}
      <div className="hidden md:flex md:w-1/2 bg-[#72D177] relative items-center justify-center p-12">
        
        {/* Card-style animated illustration */}
        <div className="relative w-full max-w-sm aspect-square bg-white/20 rounded-[3rem] backdrop-blur-sm border border-white/30 flex items-center justify-center overflow-hidden">
          <div className="relative animate-bounce-slow">
            <div className="w-32 h-40 bg-white rounded-xl shadow-xl flex flex-col p-4 gap-3">
              <div className="w-full h-3 bg-[#E5F156] rounded-full"></div>
              <div className="w-3/4 h-2 bg-gray-100 rounded-full"></div>
              <div className="w-full h-2 bg-gray-100 rounded-full"></div>
              <div className="mt-auto flex justify-between">
                <div className="w-8 h-8 rounded-full bg-[#72D177]/20 border-2 border-[#72D177]"></div>
                <div className="w-8 h-8 rounded-full bg-gray-100"></div>
              </div>
            </div>

            {/* Floating icons */}
            <div className="absolute -top-6 -right-6 text-4xl rotate-12">❓</div>
            <div className="absolute top-12 -left-10 text-3xl -rotate-12">💡</div>
          </div>
        </div>

        {/* Bottom text */}
        <div className="absolute bottom-12 text-center px-6">
          <h3 className="text-2xl font-black text-black mb-2">Ready for QUIZORA?</h3>
          <p className="text-black/60 font-bold text-sm">
            Join thousands of players in real-time challenges.
          </p>
        </div>
      </div>

      {/* ✨ Right Side: Login Form (same logic as your original) */}
      <div className="w-full md:w-1/2 p-8 md:p-16 flex flex-col justify-center bg-white">
        
        {/* Heading */}
        <div className="mb-10">
          <h2 className="text-4xl font-black text-black tracking-tighter mb-2">
            Welcome Back!
          </h2>
          <p className="text-gray-500 font-medium">
            Enter your details to step into the arena.
          </p>
        </div>

        {/* Server status indicator (same logic, improved UI) */}
        <div className="mb-8">
          {isConnected ? (
            <span className="inline-flex items-center gap-2 bg-[#72D177]/10 text-[#2E7D32] px-4 py-2 rounded-full font-bold text-xs uppercase border border-[#72D177]/30">
              <span className="w-2 h-2 bg-[#72D177] rounded-full animate-pulse"></span>
              System Online
            </span>
          ) : (
            <span className="inline-flex items-center gap-2 bg-red-50 text-red-600 px-4 py-2 rounded-full font-bold text-xs uppercase border border-red-200">
              <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
              Connecting to Hub...
            </span>
          )}
        </div>

        {/* Error display (same logic, enhanced UI) */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-r-xl mb-8 text-sm font-bold flex items-center gap-3 animate-shake">
            <span>⚠️</span> {error}
          </div>
        )}

        {/* Input fields */}
        <div className="space-y-5 mb-10">
          
          <div className="group">
            <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2 ml-1 group-focus-within:text-black transition-colors">
              Player Identity
            </label>
            <input
              ref={nameRef}
              type="text"
              placeholder="e.g. QuizMaster99"
              className="w-full p-5 rounded-2xl bg-gray-50 border-2 border-transparent text-black font-bold placeholder-gray-300 focus:border-black focus:bg-white focus:ring-0 outline-none transition-all text-lg shadow-inner"
            />
          </div>

          <div className="group">
            <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2 ml-1 group-focus-within:text-black transition-colors">
              Room Access Code
            </label>
            <input
              ref={roomIdRef}
              type="text"
              placeholder="000-000"
              className="w-full p-5 rounded-2xl bg-gray-50 border-2 border-transparent text-black font-black placeholder-gray-300 focus:border-black focus:bg-white focus:ring-0 outline-none transition-all text-center text-3xl tracking-[0.3em] uppercase shadow-inner"
            />
          </div>

        </div>

        {/* Join button */}
        <button
          onClick={handleJoinRoom}
          disabled={!isConnected}
          className={`w-full py-5 rounded-[1.5rem] font-black transition-all text-xl flex justify-center items-center gap-3 ${
            isConnected 
              ? 'bg-black text-white hover:bg-[#72D177] hover:text-black hover:-translate-y-1 active:scale-95 shadow-xl shadow-black/10' 
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
        >
          {isConnected ? (
            <>
              Get Started
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </>
          ) : "Linking Up..."}
        </button>
      </div>
    </div>
  );
}