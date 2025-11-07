"use client"

import React from "react"

export interface SegmentedItem {
  id: string
  label: string
}

export function SegmentedSwitcher({
  items,
  activeId,
  onChange,
  className = "",
}: {
  items: SegmentedItem[]
  activeId?: string
  onChange: (id: string) => void
  className?: string
}) {
  const baseItem = "px-3 h-7 inline-flex items-center justify-center text-center text-sm rounded-[7px] transition-colors min-w-[50px]"
  const active = "bg-white text-black"
  const inactive = "text-muted-foreground hover:text-foreground"
  return (
    <div className={`inline-flex h-9 items-center gap-1 rounded-md border bg-muted/30 p-1 ${className}`}>
      {items.map((it) => (
        <button
          key={it.id}
          type="button"
          className={`${baseItem} ${activeId === it.id ? active : inactive}`}
          onClick={() => onChange(it.id)}
          aria-pressed={activeId === it.id}
        >
          {it.label}
        </button>
      ))}
    </div>
  )
}


