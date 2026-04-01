export default function UserWaitingRoom({ playerName }: { playerName: string }) {
  return (
    <div className="w-full max-w-2xl mx-auto animate-fade-in px-4">
      
      {/* 1. MAIN WAITING ROOM CARD */}
      <div className="bg-white rounded-[2.5rem] shadow-xl shadow-black/5 border border-gray-100 overflow-hidden flex flex-col">

        {/* 2. TOP SUCCESS BANNER */}
        <div className="bg-[#72D177] px-10 py-12 flex flex-col items-center justify-center relative overflow-hidden text-center">
          
          {/* Decorative glow accents */}
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/20 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-[#E5F156]/20 rounded-full blur-3xl pointer-events-none"></div>

          {/* Connection Status Pill */}
          <span className="relative z-10 inline-flex items-center gap-2 bg-white/20 px-5 py-2 rounded-full mb-6 backdrop-blur-sm border border-white/30 shadow-sm">
            <span className="w-2.5 h-2.5 bg-white rounded-full animate-pulse shadow-sm"></span>
            <span className="text-gray-900 font-bold text-xs uppercase tracking-widest">
              Successfully Connected
            </span>
          </span>

          <h2 className="relative z-10 text-4xl md:text-5xl font-black text-gray-900 tracking-tight">
            You're in the Lobby!
          </h2>
        </div>

        {/* 3. PLAYER PROFILE + WAITING STATUS */}
        <div className="p-8 md:p-12 bg-white flex flex-col gap-6">
          
          {/* 3A. PLAYER PROFILE */}
          <div className="flex items-center gap-6 bg-gray-50 border border-gray-100 p-6 rounded-3xl shadow-sm">
            <div className="w-20 h-20 bg-[#E5F156] rounded-[1.5rem] flex items-center justify-center shadow-inner border border-black/5 flex-shrink-0">
              <span className="text-3xl font-black text-gray-900 uppercase tracking-tighter">
                {playerName.substring(0, 2)}
              </span>
            </div>
            
            <div className="flex flex-col justify-center overflow-hidden">
              <span className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">
                Player Profile
              </span>
              <p className="text-2xl md:text-3xl font-black text-gray-900 truncate">
                {playerName}
              </p>
            </div>
          </div>

          {/* 3B. WAITING STATUS */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 bg-gray-900 rounded-3xl p-8 shadow-xl border border-gray-800">
            <div className="text-center md:text-left">
              <h3 className="text-2xl font-black text-white mb-2">Waiting for Host...</h3>
              <p className="text-sm font-bold text-gray-400">
                The quiz will begin automatically.
              </p>
            </div>

            {/* Loading Indicator */}
            <div className="flex gap-2 bg-black/50 px-6 py-4 rounded-2xl border border-white/5 shadow-inner">
              <div className="w-3 h-3 bg-[#72D177] rounded-full animate-bounce"></div>
              <div
                className="w-3 h-3 bg-[#E5F156] rounded-full animate-bounce"
                style={{ animationDelay: "0.15s" }}
              ></div>
              <div
                className="w-3 h-3 bg-white rounded-full animate-bounce"
                style={{ animationDelay: "0.3s" }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}