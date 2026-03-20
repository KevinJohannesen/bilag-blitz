"use client"

import { useRef } from "react"
import { ACCOUNTS, GameMode } from "@/lib/accounting-data"

export interface SubmitResult {
  correct: boolean
  debitInput: string
  creditInput: string
  expectedDebit: string
  expectedCredit: string
}

interface AccountPanelProps {
  gameMode: GameMode
  debitValue: string
  creditValue: string
  onDebitChange: (value: string) => void
  onCreditChange: (value: string) => void
  onSubmit: () => void
  lastResult: SubmitResult | null
  showHints: boolean
}

export function AccountPanel({
  gameMode,
  debitValue,
  creditValue,
  onDebitChange,
  onCreditChange,
  onSubmit,
  lastResult,
  showHints
}: AccountPanelProps) {
  const creditRef = useRef<HTMLInputElement>(null)
  const isDouble = gameMode === 'dobbeltsidet'

  const handleDebitKeyDown = (e: React.KeyboardEvent) => {
    if (isDouble && (e.key === 'Enter' || (e.key === 'Tab' && !e.shiftKey))) {
      e.preventDefault()
      creditRef.current?.focus()
    } else if (!isDouble && e.key === 'Enter') {
      onSubmit()
    }
  }

  const handleCreditKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onSubmit()
    }
  }

  const accountsByCategory = ACCOUNTS.reduce((acc, account) => {
    if (!acc[account.category]) {
      acc[account.category] = []
    }
    acc[account.category].push(account)
    return acc
  }, {} as Record<string, typeof ACCOUNTS>)

  const debitCorrect = lastResult && lastResult.debitInput === lastResult.expectedDebit
  const creditCorrect = lastResult && lastResult.creditInput === lastResult.expectedCredit

  return (
    <div className="bg-stone-900 text-stone-100 p-4 rounded-lg">
      {/* Input area */}
      <div className="mb-4">
        <div className="flex gap-3">
          {/* Debit input */}
          <div className="flex-1">
            <label className="block text-xs text-stone-400 mb-1">
              {isDouble ? 'Debet (til)' : 'Kontokode'}
            </label>
            <input
              type="text"
              value={debitValue}
              onChange={(e) => onDebitChange(e.target.value.replace(/\D/g, '').slice(0, 4))}
              onKeyDown={handleDebitKeyDown}
              placeholder={isDouble ? 'f.eks. 6300' : 'f.eks. 1920'}
              className="w-full px-4 py-3 text-2xl font-mono bg-stone-800 border border-stone-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-center tracking-widest"
              autoFocus
            />
          </div>
          {/* Credit input (double-entry only) */}
          {isDouble && (
            <div className="flex-1">
              <label className="block text-xs text-stone-400 mb-1">
                Kredit (fra)
              </label>
              <input
                ref={creditRef}
                type="text"
                value={creditValue}
                onChange={(e) => onCreditChange(e.target.value.replace(/\D/g, '').slice(0, 4))}
                onKeyDown={handleCreditKeyDown}
                placeholder="f.eks. 1920"
                className="w-full px-4 py-3 text-2xl font-mono bg-stone-800 border border-stone-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-center tracking-widest"
              />
            </div>
          )}
          <div className="flex items-end">
            <button
              onClick={onSubmit}
              className="px-6 py-3 bg-amber-600 hover:bg-amber-500 text-stone-900 font-bold rounded-lg transition-colors"
            >
              Bokfør
            </button>
          </div>
        </div>

        {/* Last result feedback */}
        {lastResult && (
          <div className={`mt-2 p-3 rounded-lg text-sm font-medium ${
            lastResult.correct
              ? 'bg-emerald-900/50 text-emerald-300 border border-emerald-700'
              : 'bg-red-900/50 text-red-300 border border-red-700 animate-pulse'
          }`}>
            {lastResult.correct ? (
              <span>
                {isDouble
                  ? `Riktig! Debet ${lastResult.debitInput} / Kredit ${lastResult.creditInput}`
                  : `Riktig! Konto ${lastResult.debitInput}`}
              </span>
            ) : (
              <div>
                <span className="block text-red-200 font-bold">
                  -1 Liv! Feil {isDouble ? 'bokføring' : 'kontokode'}!
                </span>
                {isDouble ? (
                  <div className="flex gap-4 mt-1">
                    <span>
                      Debet: <span className={`font-mono ${debitCorrect ? 'text-emerald-300' : 'text-red-300'}`}>{lastResult.debitInput || '–'}</span>
                      {!debitCorrect && (
                        <> → <span className="font-mono text-amber-300">{lastResult.expectedDebit}</span> ({ACCOUNTS.find(a => a.code === lastResult.expectedDebit)?.name})</>
                      )}
                    </span>
                    <span>
                      Kredit: <span className={`font-mono ${creditCorrect ? 'text-emerald-300' : 'text-red-300'}`}>{lastResult.creditInput || '–'}</span>
                      {!creditCorrect && (
                        <> → <span className="font-mono text-amber-300">{lastResult.expectedCredit}</span> ({ACCOUNTS.find(a => a.code === lastResult.expectedCredit)?.name})</>
                      )}
                    </span>
                  </div>
                ) : (
                  <span className="block mt-1">
                    Du skrev: <span className="font-mono">{lastResult.debitInput}</span> |
                    Riktig: <span className="font-mono text-amber-300">{lastResult.expectedDebit}</span> ({ACCOUNTS.find(a => a.code === lastResult.expectedDebit)?.name})
                  </span>
                )}
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
