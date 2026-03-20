"use client"

import { Transaction } from "@/lib/accounting-data"

interface FallingReceiptProps {
  transaction: Transaction
  positionY: number
  positionX: number
  isCorrect: boolean | null
  isActive: boolean
}

export function FallingReceipt({ 
  transaction, 
  positionY, 
  positionX, 
  isCorrect,
  isActive 
}: FallingReceiptProps) {
  const getReceiptStyle = () => {
    if (isCorrect === true) return "ring-2 ring-emerald-500 bg-emerald-50"
    if (isCorrect === false) return "ring-2 ring-red-500 bg-red-50"
    if (isActive) return "ring-2 ring-amber-400 bg-amber-50"
    return "bg-[#fffef5]"
  }

  return (
    <div
      className={`absolute will-change-transform ${getReceiptStyle()}`}
      style={{
        transform: `translate(-50%, 0) translateY(${positionY}px)`,
        left: `${positionX}%`,
        top: 0,
        width: '280px',
      }}
    >
      {/* Receipt paper effect */}
      <div className="relative">
        {/* Zigzag top edge */}
        <div 
          className="absolute -top-2 left-0 right-0 h-2 bg-[#fffef5]"
          style={{
            clipPath: 'polygon(0% 100%, 5% 50%, 10% 100%, 15% 50%, 20% 100%, 25% 50%, 30% 100%, 35% 50%, 40% 100%, 45% 50%, 50% 100%, 55% 50%, 60% 100%, 65% 50%, 70% 100%, 75% 50%, 80% 100%, 85% 50%, 90% 100%, 95% 50%, 100% 100%)'
          }}
        />
        
        {/* Receipt content */}
        <div className="p-4 shadow-lg border border-stone-200">
          {/* Header */}
          <div className="text-center border-b border-dashed border-stone-300 pb-2 mb-3">
            <p className="text-xs text-stone-500 font-mono">{transaction.date}</p>
            <p className="text-sm font-semibold text-stone-700 truncate">{transaction.company}</p>
          </div>
          
          {/* Transaction details */}
          <div className="space-y-2">
            <p className="text-sm text-stone-600 leading-snug">
              {transaction.description}
            </p>
            <div className="flex justify-between items-center border-t border-dashed border-stone-300 pt-2">
              <span className="text-xs text-stone-500">Beløp:</span>
              <span className="text-lg font-bold font-mono text-stone-800">
                kr {transaction.amount.toLocaleString('nb-NO')}
              </span>
            </div>
          </div>
          
          {/* Account hint */}
          <div className="mt-3 pt-2 border-t border-dashed border-stone-300">
            <p className="text-xs text-center text-stone-400">
              Tast inn kontokode
            </p>
          </div>
        </div>
        
        {/* Zigzag bottom edge */}
        <div 
          className="absolute -bottom-2 left-0 right-0 h-2 bg-[#fffef5]"
          style={{
            clipPath: 'polygon(0% 0%, 5% 50%, 10% 0%, 15% 50%, 20% 0%, 25% 50%, 30% 0%, 35% 50%, 40% 0%, 45% 50%, 50% 0%, 55% 50%, 60% 0%, 65% 50%, 70% 0%, 75% 50%, 80% 0%, 85% 50%, 90% 0%, 95% 50%, 100% 0%)'
          }}
        />
      </div>
      
      {/* Feedback overlay */}
      {isCorrect !== null && (
        <div className={`absolute inset-0 flex items-center justify-center ${isCorrect ? 'bg-emerald-500/20' : 'bg-red-500/20'}`}>
          <span className={`text-4xl font-bold ${isCorrect ? 'text-emerald-600' : 'text-red-600'}`}>
            {isCorrect ? '✓' : '✗'}
          </span>
        </div>
      )}
    </div>
  )
}
