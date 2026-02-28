import { useState } from 'react'
import type { Entry, DateCount } from '../types'

interface ContextPanelProps {
  entries: Entry[]
  dates: DateCount[]
  activeFilter: string | null
  onFilterType: (type: string | null) => void
  onFilterDate: (date: string | null) => void
  onFilterTag: (tag: string | null) => void
  activeTag: string | null
  activeDate: string | null
}

const TYPE_FILTERS = [
  { id: 'note',  label: 'Notas',    icon: '📝' },
  { id: 'task',  label: 'Tarefas',  icon: '✅' },
  { id: 'code',  label: 'Código',   icon: '💻' },
  { id: 'link',  label: 'Links',    icon: '🔗' },
]

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
  activeFilter,
  onFilterType,
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

  const isToday = (day: number) => {
    return (
      day === today.getDate() &&
      calMonth === today.getMonth() &&
      calYear === today.getFullYear()
    )
  }

  // Compute tag frequency
  const tagFreq: Record<string, number> = {}
  for (const e of entries) {
    for (const t of e.tags) {
      tagFreq[t] = (tagFreq[t] ?? 0) + 1
    }
  }
  const sortedTags = Object.entries(tagFreq).sort((a, b) => b[1] - a[1])

  const monthName = new Date(calYear, calMonth).toLocaleString('pt-BR', { month: 'long', year: 'numeric' })

  return (
    <aside className="w-64 shrink-0 bg-[#18181b] border-r border-[#2a2a2e] flex flex-col h-screen overflow-y-auto">

      {/* Calendário */}
      <div className="p-4 border-b border-[#2a2a2e]">
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={() => { if (calMonth === 0) { setCalMonth(11); setCalYear(y => y - 1) } else setCalMonth(m => m - 1) }}
            className="text-zinc-500 hover:text-zinc-300 text-sm px-1"
          >‹</button>
          <span className="text-zinc-300 text-xs font-medium capitalize">{monthName}</span>
          <button
            onClick={() => { if (calMonth === 11) { setCalMonth(0); setCalYear(y => y + 1) } else setCalMonth(m => m + 1) }}
            className="text-zinc-500 hover:text-zinc-300 text-sm px-1"
          >›</button>
        </div>

        {/* Weekday headers */}
        <div className="grid grid-cols-7 mb-1">
          {WEEKDAYS.map((d, i) => (
            <div key={i} className="text-center text-[10px] text-zinc-600 font-medium py-0.5">{d}</div>
          ))}
        </div>

        {/* Days grid */}
        <div className="grid grid-cols-7 gap-y-0.5">
          {Array.from({ length: firstDay }).map((_, i) => <div key={`empty-${i}`} />)}
          {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
            const dateStr = toDateStr(day)
            const hasEntries = dateSet.has(dateStr)
            const isSelected = activeDate === dateStr
            const isTodayDay = isToday(day)

            return (
              <button
                key={day}
                onClick={() => onFilterDate(isSelected ? null : dateStr)}
                className={`relative text-[11px] w-full aspect-square flex items-center justify-center rounded transition-colors
                  ${isSelected ? 'bg-indigo-600 text-white' :
                    isTodayDay ? 'bg-indigo-600/20 text-indigo-400 font-bold' :
                    'text-zinc-400 hover:bg-[#27272a]'}
                `}
              >
                {day}
                {hasEntries && !isSelected && (
                  <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-indigo-500" />
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Filtros de tipo */}
      <div className="p-4 border-b border-[#2a2a2e]">
        <p className="text-[10px] text-zinc-600 uppercase tracking-wider font-semibold mb-2">Tipo</p>
        <div className="flex flex-col gap-1">
          {TYPE_FILTERS.map(({ id, label, icon }) => (
            <button
              key={id}
              onClick={() => onFilterType(activeFilter === id ? null : id)}
              className={`flex items-center gap-2 px-2 py-1.5 rounded text-sm transition-colors text-left
                ${activeFilter === id
                  ? 'bg-indigo-600/20 text-indigo-400'
                  : 'text-zinc-400 hover:bg-[#27272a] hover:text-zinc-200'}`}
            >
              <span>{icon}</span>
              <span>{label}</span>
              <span className="ml-auto text-[10px] text-zinc-600">
                {entries.filter(e => e.type === id).length}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Nuvem de tags */}
      <div className="p-4 flex-1">
        <p className="text-[10px] text-zinc-600 uppercase tracking-wider font-semibold mb-3">Tags</p>
        {sortedTags.length === 0 ? (
          <p className="text-zinc-600 text-xs">Nenhuma tag ainda</p>
        ) : (
          <div className="flex flex-wrap gap-1.5">
            {sortedTags.map(([tag, count]) => (
              <button
                key={tag}
                onClick={() => onFilterTag(activeTag === tag ? null : tag)}
                className={`text-[11px] px-2 py-0.5 rounded-full transition-colors
                  ${activeTag === tag
                    ? 'bg-indigo-600 text-white'
                    : 'bg-[#27272a] text-zinc-400 hover:bg-[#3f3f46] hover:text-zinc-200'}`}
              >
                #{tag} <span className="opacity-60">{count}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </aside>
  )
}
