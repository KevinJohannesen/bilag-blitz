"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { FallingReceipt } from "./falling-receipt"
import { AccountPanel } from "./account-panel"
import { GameStats } from "./game-stats"
import { 
  generateTransaction, 
  Transaction, 
  DIFFICULTY_LEVELS, 
  DifficultySettings,
  ACCOUNTS 
} from "@/lib/accounting-data"

interface FallingTransaction extends Transaction {
  positionY: number
  positionX: number
  isCorrect: boolean | null
  spawnTime: number
}

type GameState = 'menu' | 'playing' | 'paused' | 'gameover'

const GAME_HEIGHT = 500
const RECEIPT_HEIGHT = 180

export function AccountingGame() {
  // Game state
  const [gameState, setGameState] = useState<GameState>('menu')
  const [difficulty, setDifficulty] = useState<string>('medium')
  const [score, setScore] = useState(0)
  const [highScore, setHighScore] = useState(0)
  const [lives, setLives] = useState(4)
  const [streak, setStreak] = useState(0)
  const [level, setLevel] = useState(1)
  const [timeElapsed, setTimeElapsed] = useState(0)
  const [showHints, setShowHints] = useState(true)
  
  // Transactions
  const [fallingTransactions, setFallingTransactions] = useState<FallingTransaction[]>([])
  const [inputValue, setInputValue] = useState('')
  const [lastResult, setLastResult] = useState<{ correct: boolean; account: string; expected: string } | null>(null)
  
  // Refs for game loop
  const gameLoopRef = useRef<number | null>(null)
  const lastTimeRef = useRef<number>(0)
  const spawnTimerRef = useRef<number>(0)
  const isFirstFrameRef = useRef<boolean>(true)
  
  // Get current difficulty settings with level scaling
  const getSettings = useCallback((): DifficultySettings => {
    const base = DIFFICULTY_LEVELS[difficulty]
    const levelMultiplier = 1 + (level - 1) * 0.1
    return {
      ...base,
      fallSpeed: base.fallSpeed * levelMultiplier,
      spawnInterval: Math.max(1500, base.spawnInterval / levelMultiplier),
    }
  }, [difficulty, level])
  
  // Load high score from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('regnskapsmann-highscore')
    if (saved) {
      setHighScore(parseInt(saved, 10))
    }
  }, [])
  
  // Save high score
  useEffect(() => {
    if (score > highScore) {
      setHighScore(score)
      localStorage.setItem('regnskapsmann-highscore', score.toString())
    }
  }, [score, highScore])
  
  // Level up based on score
  useEffect(() => {
    const newLevel = Math.floor(score / 1000) + 1
    if (newLevel > level) {
      setLevel(newLevel)
    }
  }, [score, level])
  
  // Timer
  useEffect(() => {
    if (gameState !== 'playing') return
    
    const timer = setInterval(() => {
      setTimeElapsed(t => t + 1)
    }, 1000)
    
    return () => clearInterval(timer)
  }, [gameState])
  
  // Spawn new transaction
  const spawnTransaction = useCallback(() => {
    const tx = generateTransaction()
    const newTx: FallingTransaction = {
      ...tx,
      positionY: -RECEIPT_HEIGHT,
      positionX: 20 + Math.random() * 60, // Random horizontal position (20-80%)
      isCorrect: null,
      spawnTime: Date.now(),
    }
    setFallingTransactions(prev => [...prev, newTx])
  }, [])
  
  // Game loop
  useEffect(() => {
    if (gameState !== 'playing') {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current)
      }
      return
    }
    
    const settings = getSettings()
    const FIXED_TIMESTEP = 16.667 // Target 60fps timestep
    const MAX_DELTA = 100 // Cap delta to prevent huge jumps after tab switch
    
    const gameLoop = (timestamp: number) => {
      // Handle first frame - don't accumulate time
      if (isFirstFrameRef.current) {
        lastTimeRef.current = timestamp
        isFirstFrameRef.current = false
        gameLoopRef.current = requestAnimationFrame(gameLoop)
        return
      }
      
      // Calculate capped delta time for smooth animation
      const rawDelta = timestamp - lastTimeRef.current
      const deltaTime = Math.min(rawDelta, MAX_DELTA)
      lastTimeRef.current = timestamp
      
      // Normalized time factor (1.0 at 60fps)
      const timeFactor = deltaTime / FIXED_TIMESTEP
      
      // Spawn logic with consistent intervals
      spawnTimerRef.current += deltaTime
      if (spawnTimerRef.current >= settings.spawnInterval) {
        spawnTransaction()
        spawnTimerRef.current = 0
      }
      
      // Update positions with consistent velocity
      setFallingTransactions(prev => {
        const updated = prev.map(tx => ({
          ...tx,
          positionY: tx.positionY + settings.fallSpeed * timeFactor,
        }))
        
        // Check for transactions that hit the bottom
        const stillFalling: FallingTransaction[] = []
        let livesLost = 0
        
        for (const tx of updated) {
          if (tx.positionY >= GAME_HEIGHT - 20) {
            if (tx.isCorrect === null) {
              // Missed - lose a life
              livesLost++
            }
            // Remove after animation
            if (tx.positionY < GAME_HEIGHT + 100) {
              stillFalling.push({ ...tx, isCorrect: tx.isCorrect ?? false })
            }
          } else {
            stillFalling.push(tx)
          }
        }
        
        if (livesLost > 0) {
          setLives(l => {
            const newLives = l - livesLost
            if (newLives <= 0) {
              setGameState('gameover')
            }
            return Math.max(0, newLives)
          })
          setStreak(0)
        }
        
        return stillFalling.filter(tx => tx.positionY < GAME_HEIGHT + 100)
      })
      
      gameLoopRef.current = requestAnimationFrame(gameLoop)
    }
    
    lastTimeRef.current = performance.now()
    gameLoopRef.current = requestAnimationFrame(gameLoop)
    
    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current)
        gameLoopRef.current = null
      }
    }
  }, [gameState, getSettings, spawnTransaction])
  
  // Handle answer submission
  const handleSubmit = useCallback(() => {
    if (!inputValue || gameState !== 'playing') return
    
    const settings = getSettings()
    
    // Find the lowest (closest to bottom) unanswered transaction
    const activeTransactions = fallingTransactions
      .filter(tx => tx.isCorrect === null)
      .sort((a, b) => b.positionY - a.positionY)
    
    if (activeTransactions.length === 0) return
    
    const target = activeTransactions[0]
    const isCorrect = inputValue === target.correctAccount
    
    setFallingTransactions(prev => 
      prev.map(tx => 
        tx.id === target.id ? { ...tx, isCorrect } : tx
      )
    )
    
    if (isCorrect) {
      // Calculate bonus for speed
      const responseTime = (Date.now() - target.spawnTime) / 1000
      const timeBonus = responseTime < settings.bonusTimeThreshold 
        ? Math.floor((settings.bonusTimeThreshold - responseTime) * 20)
        : 0
      const streakBonus = streak * 10
      const totalPoints = settings.pointsPerCorrect + timeBonus + streakBonus
      
      setScore(s => s + totalPoints)
      setStreak(s => s + 1)
    } else {
      // Wrong answer - lose a life!
      setStreak(0)
      setLives(l => {
        const newLives = l - 1
        if (newLives <= 0) {
          setGameState('gameover')
        }
        return Math.max(0, newLives)
      })
    }
    
    setLastResult({
      correct: isCorrect,
      account: inputValue,
      expected: target.correctAccount,
    })
    
    setInputValue('')
    
    // Clear result after 2 seconds
    setTimeout(() => setLastResult(null), 2000)
  }, [inputValue, fallingTransactions, gameState, streak, getSettings])
  
  // Start game
  const startGame = () => {
    setGameState('playing')
    setScore(0)
    setLives(DIFFICULTY_LEVELS[difficulty].lives)
    setStreak(0)
    setLevel(1)
    setTimeElapsed(0)
    setFallingTransactions([])
    setLastResult(null)
    setInputValue('')
    // Reset timing refs for clean start
    isFirstFrameRef.current = true
    spawnTimerRef.current = DIFFICULTY_LEVELS[difficulty].spawnInterval - 500 // Spawn after brief delay
  }
  
  // Pause/Resume
  const togglePause = () => {
    setGameState(prev => prev === 'playing' ? 'paused' : 'playing')
  }
  
  // Get the active (lowest) transaction for highlighting
  const activeTransactionId = fallingTransactions
    .filter(tx => tx.isCorrect === null)
    .sort((a, b) => b.positionY - a.positionY)[0]?.id

  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-100 to-stone-200 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <header className="text-center mb-4">
          <h1 className="text-3xl font-bold text-stone-800">Regnskapsmann-simulator</h1>
          <p className="text-stone-500">Bokfør bilagene før de faller ned!</p>
        </header>
        
        {/* Menu Screen */}
        {gameState === 'menu' && (
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <div className="mb-8">
              <div className="text-6xl mb-4">📊</div>
              <h2 className="text-2xl font-bold text-stone-800 mb-2">Velkommen, Regnskapsmann!</h2>
              <p className="text-stone-600 max-w-md mx-auto">
                Bilag faller ned fra himmelen. Tast inn riktig kontokode fra Norsk Standard Kontoplan 
                for de treffer bunnen. Jo raskere du svarer, jo flere poeng far du!
              </p>
              <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-3 max-w-sm mx-auto">
                <p className="text-sm text-red-700 font-medium">
                  Du mister et liv hvis:
                </p>
                <ul className="text-sm text-red-600 mt-1">
                  <li>- Et bilag faller forbi den rode linjen</li>
                  <li>- Du taster feil kontokode</li>
                </ul>
              </div>
            </div>
            
            <div className="mb-6">
              <p className="text-sm text-stone-500 mb-2">Velg vanskelighetsgrad:</p>
              <div className="flex justify-center gap-2">
                {Object.keys(DIFFICULTY_LEVELS).map(level => (
                  <button
                    key={level}
                    onClick={() => setDifficulty(level)}
                    className={`px-4 py-2 rounded-lg font-medium capitalize transition-colors ${
                      difficulty === level
                        ? 'bg-amber-600 text-white'
                        : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                    }`}
                  >
                    {level === 'easy' ? 'Lett' : level === 'medium' ? 'Medium' : level === 'hard' ? 'Vanskelig' : 'Ekspert'}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="mb-6">
              <label className="flex items-center justify-center gap-2 text-sm text-stone-600">
                <input
                  type="checkbox"
                  checked={showHints}
                  onChange={e => setShowHints(e.target.checked)}
                  className="w-4 h-4 rounded"
                />
                Vis kontooversikt (anbefalt for nybegynnere)
              </label>
            </div>
            
            <button
              onClick={startGame}
              className="px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xl rounded-lg transition-colors shadow-lg"
            >
              Start Spill
            </button>
            
            {highScore > 0 && (
              <p className="mt-4 text-stone-500">
                Din rekord: <span className="font-bold text-amber-600">{highScore.toLocaleString()}</span> poeng
              </p>
            )}
            
            {/* Quick reference */}
            <div className="mt-8 pt-6 border-t border-stone-200">
              <p className="text-sm text-stone-500 mb-3">Eksempel på kontoer du vil møte:</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                {ACCOUNTS.slice(0, 8).map(acc => (
                  <div key={acc.code} className="bg-stone-50 rounded p-2">
                    <span className="font-mono text-amber-600">{acc.code}</span>
                    <span className="text-stone-500 ml-2">{acc.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        
        {/* Game Screen */}
        {(gameState === 'playing' || gameState === 'paused') && (
          <div className="space-y-4">
            {/* Stats bar */}
            <GameStats
              score={score}
              highScore={highScore}
              lives={lives}
              maxLives={DIFFICULTY_LEVELS[difficulty].lives}
              streak={streak}
              level={level}
              timeElapsed={timeElapsed}
            />
            
            {/* Pause button */}
            <div className="flex justify-end">
              <button
                onClick={togglePause}
                className="px-4 py-2 bg-stone-600 hover:bg-stone-500 text-white rounded-lg text-sm transition-colors"
              >
                {gameState === 'paused' ? 'Fortsett' : 'Pause'}
              </button>
            </div>
            
            {/* Game area */}
            <div 
              className="relative bg-gradient-to-b from-blue-100 to-blue-200 rounded-xl overflow-hidden border-4 border-stone-300"
              style={{ height: `${GAME_HEIGHT}px` }}
            >
              {/* Grid lines for visual reference */}
              <div className="absolute inset-0 opacity-10">
                {Array.from({ length: 10 }).map((_, i) => (
                  <div
                    key={i}
                    className="absolute w-full border-b border-stone-400"
                    style={{ top: `${(i + 1) * 10}%` }}
                  />
                ))}
              </div>
              
              {/* Danger zone */}
              <div className="absolute bottom-0 left-0 right-0 h-8 bg-red-500/20 border-t-2 border-red-400 border-dashed" />
              
              {/* Falling receipts */}
              {fallingTransactions.map(tx => (
                <FallingReceipt
                  key={tx.id}
                  transaction={tx}
                  positionY={tx.positionY}
                  positionX={tx.positionX}
                  isCorrect={tx.isCorrect}
                  isActive={tx.id === activeTransactionId}
                />
              ))}
              
              {/* Pause overlay */}
              {gameState === 'paused' && (
                <div className="absolute inset-0 bg-stone-900/80 flex items-center justify-center">
                  <div className="text-center text-white">
                    <p className="text-3xl font-bold mb-2">PAUSE</p>
                    <p className="text-stone-300">Trykk på "Fortsett" for å spille videre</p>
                  </div>
                </div>
              )}
            </div>
            
            {/* Input panel */}
            <AccountPanel
              inputValue={inputValue}
              onInputChange={setInputValue}
              onSubmit={handleSubmit}
              lastResult={lastResult}
              showHints={showHints}
            />
          </div>
        )}
        
        {/* Game Over Screen */}
        {gameState === 'gameover' && (
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <div className="text-6xl mb-4">📉</div>
            <h2 className="text-3xl font-bold text-stone-800 mb-2">Spill Over!</h2>
            <p className="text-stone-600 mb-6">Regnskapet ditt har gått i balanse... negativt!</p>
            
            <div className="grid grid-cols-3 gap-4 mb-8 max-w-md mx-auto">
              <div className="bg-stone-50 rounded-lg p-4">
                <p className="text-sm text-stone-500">Poeng</p>
                <p className="text-2xl font-bold text-amber-600">{score.toLocaleString()}</p>
              </div>
              <div className="bg-stone-50 rounded-lg p-4">
                <p className="text-sm text-stone-500">Nivå</p>
                <p className="text-2xl font-bold text-blue-600">{level}</p>
              </div>
              <div className="bg-stone-50 rounded-lg p-4">
                <p className="text-sm text-stone-500">Tid</p>
                <p className="text-2xl font-bold text-stone-600">
                  {Math.floor(timeElapsed / 60)}:{(timeElapsed % 60).toString().padStart(2, '0')}
                </p>
              </div>
            </div>
            
            {score >= highScore && score > 0 && (
              <div className="bg-amber-100 text-amber-800 rounded-lg p-4 mb-6">
                <p className="font-bold">Ny rekord!</p>
              </div>
            )}
            
            <div className="flex justify-center gap-4">
              <button
                onClick={startGame}
                className="px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg transition-colors"
              >
                Spill Igjen
              </button>
              <button
                onClick={() => setGameState('menu')}
                className="px-8 py-4 bg-stone-200 hover:bg-stone-300 text-stone-700 font-bold rounded-lg transition-colors"
              >
                Hovedmeny
              </button>
            </div>
          </div>
        )}
        
        {/* Footer */}
        <footer className="mt-6 text-center text-sm text-stone-500">
          <p>Basert på Norsk Standard Kontoplan (NS 4102)</p>
        </footer>
      </div>
    </div>
  )
}
