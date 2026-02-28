import { useState } from 'react'
import type { Entry, DateCount } from '../types'

interface ContextPanelProps {
  entries: Entry[]
  dates: DateCount[]
  onFilterDate: (date: string | null) => void
  onFilterTag: (tag: string | null) => void
  activeTag: string | null
  activeDate: string | null
}

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate()
}

function getFirstDayOfWeek(year: number, month: number) {
  return new Date(year, month, 1).getDay()
}

const WEEKDAYS = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S']

export function ContextPanel({
  entries,
  dates,
  onFilterDate,
  onFilterTag,
  activeTag,
  activeDate,
}: ContextPanelProps) {
  const today = new Date()
  const [calYear, setCalYear] = useState(today.getFullYear())
  const [calMonth, setCalMonth] = useState(today.getMonth())

  const daysInMonth = getDaysInMonth(calYear, calMonth)
  const firstDay = getFirstDayOfWeek(calYear, calMonth)
  const dateSet = new Set(dates.map(d => d.date))

  const toDateStr = (day: number) => {
    const m = String(calMonth + 1).padStart(2, '0')
    const d = String(day).padStart(2, '0')
    return `${calYear}-${m}-${d}`
  }

  const isToday = (day: number) =>
    day === today.getDate() && calMonth === today.getMonth() && calYear === today.getFullYear()

  // Tag frequency
  const tagFreq: Record<string, number> = {}
  for (const e of entries) {
    for (const t of e.tags) {
      tagFreq[t] = (tagFreq[t] ?? 0) + 1
    }
  }
  const sortedTags = Object.entries(tagFreq).sort((a, b) => b[1] - a[1])

  const monthName = new Date(calYear, calMonth).toLocaleString('pt-BR', { month: 'long' })
  const yearStr = String(calYear)

  return (
    <aside
      className="shrink-0 flex flex-col h-screen overflow-y-auto"
      style={{ width: 240, background: 'var(--c-surface)', borderRight: '1px solid var(--c-border)' }}
    >
      {/* ── Calendar ── */}
      <div className="p-4" style={{ borderBottom: '1px solid var(--c-border)' }}>
        {/* Month header */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => { if (calMonth === 0) { setCalMonth(11); setCalYear(y => y - 1) } else setCalMonth(m => m - 1) }}
            className="nav-btn flex items-center justify-center w-6 h-6 rounded"
            style={{ color: 'var(--c-text-3)', fontSize: 16 }}
          >‹</button>

          <div className="text-center">
            <div
              className="font-mono-j capitalize"
              style={{ color: 'var(--c-text)', fontSize: 13, fontWeight: 600, letterSpacing: '0.01em' }}
            >
              {monthName}
            </div>
            <div style={{ color: 'var(--c-text-3)', fontSize: 10, marginTop: 1 }}>{yearStr}</div>
          </div>

          <button
            onClick={() => { if (calMonth === 11) { setCalMonth(0); setCalYear(y => y + 1) } else setCalMonth(m => m + 1) }}
            className="nav-btn flex items-center justify-center w-6 h-6 rounded"
            style={{ color: 'var(--c-text-3)', fontSize: 16 }}
          >›</button>
        </div>

        {/* Weekday labels */}
        <div className="grid grid-cols-7 mb-1">
          {WEEKDAYS.map((d, i) => (
            <div
              key={i}
              className="text-center py-0.5 font-mono-j"
              style={{ fontSize: 9, color: 'var(--c-text-3)', fontWeight: 500 }}
            >
              {d}
            </div>
          ))}
        </div>

        {/* Day grid */}
        <div className="grid grid-cols-7 gap-y-0.5">
          {Array.from({ length: firstDay }).map((_, i) => <div key={`e-${i}`} />)}
          {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
            const dateStr = toDateStr(day)
            const hasEntries = dateSet.has(dateStr)
            const isSelected = activeDate === dateStr
            const isTodayDay = isToday(day)

            return (
              <button
                key={day}
                onClick={() => onFilterDate(isSelected ? null : dateStr)}
                className="relative w-full aspect-square flex items-center justify-center rounded font-mono-j"
                style={{
                  fontSize: 10,
                  fontWeight: isTodayDay ? 700 : 400,
                  color: isSelected
                    ? '#090909'
                    : isTodayDay
                    ? 'var(--c-accent)'
                    : hasEntries
                    ? 'var(--c-text-2)'
                    : 'var(--c-text-3)',
                  background: isSelected
                    ? 'var(--c-accent)'
                    : isTodayDay
                    ? 'var(--c-accent-dim)'
                    : 'transparent',
                  transition: 'background 0.12s, color 0.12s',
                }}
              >
                {day}
                {hasEntries && !isSelected && (
                  <span
                    style={{
                      position: 'absolute', bottom: 2, left: '50%',
                      transform: 'translateX(-50%)',
                      width: 3, height: 3, borderRadius: '50%',
                      background: 'var(--c-accent)',
                      opacity: isTodayDay ? 0.4 : 0.6,
                    }}
                  />
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* ── Tags ── */}
      <div className="p-4 flex-1">
        <div className="flex items-center justify-between mb-3">
          <span
            className="font-mono-j uppercase tracking-widest"
            style={{ fontSize: 9, color: 'var(--c-text-3)', fontWeight: 500 }}
          >
            Tags
          </span>
          {sortedTags.length > 0 && (
            <span className="font-mono-j" style={{ fontSize: 9, color: 'var(--c-text-3)' }}>
              {sortedTags.length}
            </span>
          )}
        </div>

        {sortedTags.length === 0 ? (
          <p style={{ color: 'var(--c-text-3)', fontSize: 12, lineHeight: 1.6 }}>
            Nenhuma tag ainda.
          </p>
        ) : (
          <div className="flex flex-wrap gap-1.5">
            {sortedTags.map(([tag, count]) => (
              <button
                key={tag}
                onClick={() => onFilterTag(activeTag === tag ? null : tag)}
                className="font-mono-j transition-all"
                style={{
                  fontSize: 10,
                  padding: '2px 8px',
                  borderRadius: 9999,
                  border: `1px solid ${activeTag === tag ? 'var(--c-accent)' : 'var(--c-border-hi)'}`,
                  background: activeTag === tag ? 'var(--c-accent-dim)' : 'transparent',
                  color: activeTag === tag ? 'var(--c-accent)' : 'var(--c-text-3)',
                  cursor: 'pointer',
                }}
              >
                #{tag} <span style={{ opacity: 0.5 }}>{count}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── Footer ── */}
      <div
        className="p-3 text-center font-mono-j"
        style={{ borderTop: '1px solid var(--c-border)', color: 'var(--c-text-3)', fontSize: 10 }}
      >
        {entries.length} {entries.length === 1 ? 'anotação' : 'anotações'}
      </div>
    </aside>
  )
}
