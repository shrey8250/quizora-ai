export default function UserLeaderboard({
  leaderboard,
  currentPlayerName
}: {
  leaderboard: { name: string; score: number }[];
  currentPlayerName?: string;
}) {
  // Ensure the leaderboard is sorted by score (highest first)
  const sortedLeaderboard = [...leaderboard].sort((a, b) => b.score - a.score);

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8 md:py-12 flex flex-col items-center animate-fade-in min-h-[80vh]">
      
      {/* 1. MAIN LEADERBOARD CARD */}
      <div className="w-full bg-white rounded-[3rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.08)] border border-gray-100 flex flex-col overflow-hidden">

        {/* 2. CELEBRATORY HEADER */}
        <div className="bg-[#72D177] px-8 py-12 md:py-16 flex flex-col items-center text-center relative overflow-hidden">
          
          {/* Decorative glow accents */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/20 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-40 h-40 bg-[#E5F156]/30 rounded-full blur-2xl -ml-10 -mb-10 pointer-events-none"></div>

          <div className="relative z-10 w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-xl border-4 border-white/50 mb-6 animate-bounce">
            <span className="text-4xl">🏆</span>
          </div>

          <h1 className="relative z-10 text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 tracking-tight mb-3">
            Final Standings
          </h1>
          <p className="relative z-10 font-bold text-sm md:text-base text-gray-800/80 uppercase tracking-widest">
            The results are in. Let's see who dominated.
          </p>
        </div>

        {/* 3. LEADERBOARD LIST */}
        <div className="p-6 md:p-12 bg-white flex flex-col gap-4 relative z-20 -mt-6 rounded-t-[3rem]">
          {sortedLeaderboard.map((player, index) => {
            const isFirst = index === 0;
            const isSecond = index === 1;
            const isThird = index === 2;
            const isCurrentPlayer = player.name === currentPlayerName;

            return (
              <div
                key={index}
                className={`flex items-center justify-between p-4 md:p-5 rounded-[1.5rem] border-2 transition-all hover:-translate-y-1 hover:shadow-lg ${
                  isFirst
                    ? "bg-[#E5F156]/10 border-[#E5F156] shadow-sm"
                    : isCurrentPlayer
                    ? "bg-gray-900 border-gray-900 text-white shadow-md"
                    : "bg-white border-gray-100 text-gray-900"
                }`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {/* Left Side: Rank + Name */}
                <div className="flex items-center gap-4 md:gap-6">
                  <div
                    className={`w-12 h-12 md:w-14 md:h-14 flex-shrink-0 flex items-center justify-center rounded-xl font-black text-xl md:text-2xl shadow-sm ${
                      isFirst
                        ? "bg-[#E5F156] text-black"
                        : isSecond
                        ? "bg-gray-200 text-gray-700"
                        : isThird
                        ? "bg-orange-100 text-orange-800"
                        : isCurrentPlayer
                        ? "bg-white/20 text-white"
                        : "bg-gray-50 text-gray-400"
                    }`}
                  >
                    {isFirst ? "1" : isSecond ? "2" : isThird ? "3" : index + 1}
                  </div>

                  <div className="flex flex-col">
                    <span
                      className={`font-black text-xl md:text-2xl leading-none truncate max-w-[150px] md:max-w-[300px] ${
                        isCurrentPlayer ? "text-white" : "text-gray-900"
                      }`}
                    >
                      {player.name}
                    </span>
                    {isCurrentPlayer && (
                      <span className="font-bold text-[10px] uppercase tracking-widest text-gray-400 mt-1">
                        That's You!
                      </span>
                    )}
                  </div>
                </div>

                {/* Right Side: Score */}
                <div className="flex flex-col items-end">
                  <span
                    className={`font-black text-2xl md:text-3xl tracking-tighter ${
                      isCurrentPlayer ? "text-white" : "text-gray-900"
                    }`}
                  >
                    {player.score}
                  </span>
                  <span className="font-bold text-[10px] uppercase tracking-widest text-gray-400">
                    Points
                  </span>
                </div>
              </div>
            );
          })}

          {/* 4. EMPTY STATE */}
          {sortedLeaderboard.length === 0 && (
            <div className="text-center py-12">
              <span className="text-4xl mb-4 block">👻</span>
              <h3 className="text-xl font-black text-gray-900">No scores yet!</h3>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}