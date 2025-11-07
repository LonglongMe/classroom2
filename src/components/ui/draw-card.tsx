"use client"

import React from "react"

export function DrawCard({
  disabled,
  onClick,
  emptyTitle,
  selectedPrimary,
  selectedSecondary,
  secondaryLines,
  hint,
  primarySizeClass = "text-2xl",
  isSpinning = false,
  spinItems,
  spinDurationMs = 2000,
  variant = "default",
}: {
  disabled: boolean
  onClick: () => void
  emptyTitle: string
  selectedPrimary?: string
  selectedSecondary?: string
  secondaryLines?: string[]
  hint?: string
  primarySizeClass?: string
  isSpinning?: boolean
  spinItems?: string[]
  spinDurationMs?: number
  variant?: "default" | "green" | "yellow"
}) {
  const handleKey = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (disabled) return
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      onClick()
    }
  }
  const clickable = !disabled
  
  // 根据 variant 设置背景颜色（低饱和度）
  const getBgColor = () => {
    if (disabled) {
      if (variant === "green") return "bg-green-50/40 border-green-100/50"
      if (variant === "yellow") return "bg-yellow-50/40 border-yellow-100/50"
      return "bg-muted/40"
    }
    if (variant === "green") return "bg-green-50/60 hover:bg-green-50/80 border-green-200"
    if (variant === "yellow") return "bg-yellow-50/60 hover:bg-yellow-50/80 border-yellow-200"
    return "bg-muted/30 hover:bg-muted/50"
  }
  
  return (
    <div
      role="button"
      tabIndex={0}
      aria-disabled={disabled}
      onClick={() => clickable && onClick()}
      onKeyDown={handleKey}
      className={`rounded-lg border p-4 outline-none transition-colors min-h-[120px] ${getBgColor()} ${clickable ? 'cursor-pointer' : 'cursor-not-allowed'}`}
    >
      {isSpinning ? (
        <div className="grid h-full grid-cols-2">
          {/* 左侧：滚动视图 */}
          <div className="flex items-center justify-center">
            <div className="roller-viewport h-16 w-full overflow-hidden">
              <div
                className="roller-list"
                style={{
                  // @ts-expect-error css var
                  "--spin-duration": `${spinDurationMs}ms`,
                  // @ts-expect-error css var
                  "--final-offset": `-${Math.max(0, (spinItems?.length || 1) - 1) * 64}px`,
                }}
              >
                {(spinItems && spinItems.length > 0 ? spinItems : ["……", "……", "……", "……"]).map((txt, idx) => (
                  <div key={idx} className="h-16 flex items-center justify-center text-xl font-semibold text-foreground/80">
                    {txt}
                  </div>
                ))}
              </div>
            </div>
          </div>
          {/* 右侧：空占位，保持版式一致 */}
          <div />
        </div>
      ) : !selectedPrimary ? (
        <div className="flex h-full w-full items-center justify-center">
          <div className="text-center text-sm text-muted-foreground">{emptyTitle}</div>
        </div>
      ) : (
        <div className="grid h-full grid-cols-2">
          {/* 左侧居中显示大号主文本 */}
          <div className="flex items-center justify-center">
            <div className={`${primarySizeClass} font-bold leading-none`}>{selectedPrimary}</div>
          </div>
          {/* 右侧底部显示副文本 */}
          <div className="flex items-end justify-end pr-1 pb-1 text-right">
            <div className="flex flex-col gap-0.5">
              {secondaryLines && secondaryLines.length > 0 ? (
                secondaryLines.map((line, i) => (
                  <div key={i} className="text-xs text-muted-foreground">{line}</div>
                ))
              ) : selectedSecondary ? (
                <div className="text-sm text-muted-foreground">{selectedSecondary}</div>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}


