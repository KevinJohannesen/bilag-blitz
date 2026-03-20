"use client"

import { ACCOUNTS } from "@/lib/accounting-data"

interface AccountPanelProps {
  inputValue: string
  onInputChange: (value: string) => void
  onSubmit: () => void
  lastResult: { correct: boolean; account: string; expected: string } | null
  showHints: boolean
}

export function AccountPanel({ 
  inputValue, 
  onInputChange, 
  onSubmit, 
  lastResult,
  showHints 
}: AccountPanelProps) {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onSubmit()
    }
  }

  // Group accounts by category
  const accountsByCategory = ACCOUNTS.reduce((acc, account) => {
    if (!acc[account.category]) {
      acc[account.category] = []
    }
    acc[account.category].push(account)
    return acc
  }, {} as Record<string, typeof ACCOUNTS>)

  return (
    <div className="bg-stone-900 text-stone-100 p-4 rounded-lg">
      {/* Input area */}
      <div className="mb-4">
        <label className="block text-sm text-stone-400 mb-2">
          Skriv inn kontokode:
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => onInputChange(e.target.value.replace(/\D/g, '').slice(0, 4))}
            onKeyDown={handleKeyDown}
            placeholder="f.eks. 1920"
            className="flex-1 px-4 py-3 text-2xl font-mono bg-stone-800 border border-stone-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-center tracking-widest"
            autoFocus
          />
          <button
            onClick={onSubmit}
            className="px-6 py-3 bg-amber-600 hover:bg-amber-500 text-stone-900 font-bold rounded-lg transition-colors"
          >
            Bokfør
          </button>
        </div>
        
        {/* Last result feedback */}
        {lastResult && (
          <div className={`mt-2 p-3 rounded-lg text-sm font-medium ${
            lastResult.correct 
              ? 'bg-emerald-900/50 text-emerald-300 border border-emerald-700' 
              : 'bg-red-900/50 text-red-300 border border-red-700 animate-pulse'
          }`}>
            {lastResult.correct ? (
              <span>Riktig! Konto {lastResult.account}</span>
            ) : (
              <div>
                <span className="block text-red-200 font-bold">-1 Liv! Feil kontokode!</span>
                <span className="block mt-1">
                  Du skrev: <span className="font-mono">{lastResult.account}</span> | 
                  Riktig: <span className="font-mono text-amber-300">{lastResult.expected}</span> ({ACCOUNTS.find(a => a.code === lastResult.expected)?.name})
                </span>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Account reference (collapsible) */}
      {showHints && (
        <div className="border-t border-stone-700 pt-3">
          <p className="text-xs text-stone-500 mb-2">Kontooversikt:</p>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs max-h-40 overflow-y-auto">
            {Object.entries(accountsByCategory).map(([category, accounts]) => (
              <div key={category} className="col-span-2 mb-2">
                <p className="text-stone-400 font-semibold mb-1">{category}</p>
                <div className="grid grid-cols-2 gap-x-4 gap-y-0.5 pl-2">
                  {accounts.map(account => (
                    <div key={account.code} className="flex gap-2">
                      <span className="font-mono text-amber-400">{account.code}</span>
                      <span className="text-stone-400 truncate">{account.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
