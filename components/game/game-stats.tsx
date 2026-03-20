"use client"

interface GameStatsProps {
  score: number
  highScore: number
  lives: number
  maxLives: number
  streak: number
  level: number
  timeElapsed: number
}

export function GameStats({ 
  score, 
  highScore, 
  lives, 
  maxLives, 
  streak, 
  level,
  timeElapsed 
}: GameStatsProps) {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="flex items-center justify-between bg-stone-800 text-stone-100 px-4 py-3 rounded-lg">
      {/* Score section */}
      <div className="flex items-center gap-6">
        <div>
          <p className="text-xs text-stone-400">Poeng</p>
          <p className="text-2xl font-bold font-mono text-amber-400">{score.toLocaleString()}</p>
        </div>
        <div>
          <p className="text-xs text-stone-400">Rekord</p>
          <p className="text-lg font-mono text-stone-300">{highScore.toLocaleString()}</p>
        </div>
      </div>
      
      {/* Center stats */}
      <div className="flex items-center gap-6">
        <div className="text-center">
          <p className="text-xs text-stone-400">Nivå</p>
          <p className="text-xl font-bold text-blue-400">{level}</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-stone-400">Streak</p>
          <div className="flex items-center gap-1">
            <p className="text-xl font-bold text-orange-400">{streak}</p>
            {streak >= 3 && <span className="text-orange-400">🔥</span>}
          </div>
        </div>
        <div className="text-center">
          <p className="text-xs text-stone-400">Tid</p>
          <p className="text-lg font-mono text-stone-300">{formatTime(timeElapsed)}</p>
        </div>
      </div>
      
      {/* Lives */}
      <div>
        <p className="text-xs text-stone-400 mb-1">Liv</p>
        <div className="flex gap-1">
          {Array.from({ length: maxLives }).map((_, i) => (
            <div
              key={i}
              className={`w-6 h-6 rounded-full flex items-center justify-center text-sm ${
                i < lives ? 'bg-red-500 text-white' : 'bg-stone-700 text-stone-500'
              }`}
            >
              ♥
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
