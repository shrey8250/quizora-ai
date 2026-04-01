export default function WaitingLobby({
  quizId,
  players,
  handleStartGameFromLobby
}: {
  quizId: string;
  players: string[];
  handleStartGameFromLobby: () => void;
}) {

  return (
    <div className="w-full h-full flex flex-col gap-4 lg:gap-6 animate-fade-in min-h-0">
      
      {/* 1. TOP INVITE BANNER */}
      <div className="shrink-0 bg-[#72D177] rounded-[2.5rem] p-6 md:p-10 shadow-sm relative overflow-hidden flex flex-col items-center text-center border border-black/5">
        <div className="absolute -top-10 -left-10 w-40 h-40 bg-white opacity-20 rounded-full blur-2xl pointer-events-none"></div>
        <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-[#E5F156] opacity-40 rounded-full blur-2xl pointer-events-none"></div>

        <span className="bg-black/10 text-black px-4 py-1.5 rounded-full font-bold text-xs uppercase tracking-widest mb-4 flex items-center gap-2 backdrop-blur-sm relative z-10">
          <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
          Lobby is Open
        </span>

        <h2 className="text-4xl md:text-5xl font-black text-black tracking-tight mb-2 relative z-10">
          Ready to Play?
        </h2>
        <p className="text-black/70 font-bold text-base md:text-lg mb-6 relative z-10">
          Ask players to join using this Room PIN:
        </p>

        {/* Game PIN Container - Adjusted text sizing for the long ID */}
        <div className="bg-white px-6 py-4 md:px-10 md:py-6 rounded-3xl shadow-xl w-full max-w-2xl flex flex-col items-center justify-center border border-black/5 relative z-10">
          <span className="text-2xl md:text-3xl lg:text-4xl font-black tracking-wider text-black text-center uppercase break-all leading-tight">
            {quizId}
          </span>
        </div>
      </div>

      {/* 2. PLAYERS + LAUNCH SECTION */}
      <div className="flex-1 grid md:grid-cols-3 gap-4 lg:gap-6 min-h-0">
        
        {/* 2A. PLAYERS PANEL */}
        <div className="md:col-span-2 bg-white p-6 md:p-8 rounded-[2.5rem] shadow-xl shadow-black/5 border border-black/5 flex flex-col min-h-0">
          <div className="shrink-0 flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
            <div className="flex items-center gap-3">
              <span className="text-3xl bg-[#F7F7F7] p-2 rounded-full">👥</span>
              <h3 className="text-2xl font-black text-black">Competitors</h3>
            </div>
            <div className="bg-gray-50 border border-gray-100 px-5 py-2 rounded-full font-bold text-sm text-gray-500">
              {players.length} Joined
            </div>
          </div>

          <div className="flex-1 overflow-y-auto pr-2">
            {players.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center opacity-60">
                <span className="text-6xl mb-4 animate-bounce-slow">👀</span>
                <p className="font-bold text-xl text-gray-400">Waiting for challengers...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 auto-rows-max">
                {players.map((p, i) => (
                  <div
                    key={i}
                    className="bg-gray-50 border border-gray-100 rounded-2xl p-2 pr-5 flex items-center gap-3 shadow-sm hover:border-gray-300 hover:shadow-md transition-all"
                  >
                    <div className="w-10 h-10 bg-[#72D177]/20 border-2 border-[#72D177] rounded-xl flex items-center justify-center font-black text-xs text-[#2E7D32] flex-shrink-0 uppercase">
                      {p.substring(0, 2)}
                    </div>
                    <span className="font-bold text-gray-800 truncate text-base">{p}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 2B. LAUNCH PANEL */}
        <div className="md:col-span-1 bg-[#E5F156] p-6 md:p-8 rounded-[2.5rem] shadow-xl shadow-black/5 border border-black/5 flex flex-col justify-center items-center text-center relative overflow-hidden min-h-0">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-20 rounded-bl-full pointer-events-none"></div>

          <h3 className="text-3xl font-black text-black mb-2 relative z-10">Launch Game</h3>
          <p className="text-black/70 font-bold text-sm mb-8 leading-relaxed max-w-[200px] relative z-10">
            Wait for everyone to join before clicking start.
          </p>

          <button
            onClick={handleStartGameFromLobby}
            disabled={players.length === 0}
            className={`w-full py-5 rounded-2xl font-black text-xl transition-all flex items-center justify-center gap-2 relative z-10 ${
              players.length > 0
                ? "bg-black text-white hover:scale-[1.02] shadow-xl shadow-black/10"
                : "bg-black/10 text-black/40 cursor-not-allowed border-2 border-black/5"
            }`}
          >
            Start Quiz
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}