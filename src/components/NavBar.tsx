type NavView = 'feed' | 'calendar' | 'tags' | 'settings'

interface NavBarProps {
  active: NavView
  onChange: (v: NavView) => void
}

const NAV_ITEMS: { id: NavView; icon: string; label: string }[] = [
  { id: 'feed',     icon: '⊞',  label: 'Feed'          },
  { id: 'calendar', icon: '📅', label: 'Calendário'    },
  { id: 'tags',     icon: '🏷️', label: 'Tags'          },
  { id: 'settings', icon: '⚙️', label: 'Configurações' },
]

export type { NavView }

export function NavBar({ active, onChange }: NavBarProps) {
  return (
    <nav className="w-14 bg-[#111113] border-r border-[#2a2a2e] flex flex-col items-center py-4 gap-1 h-screen shrink-0">
      {/* Logo */}
      <div className="mb-4 text-xl select-none" title="Work Journal">📓</div>

      <div className="flex-1 flex flex-col gap-1 w-full px-1">
        {NAV_ITEMS.map(({ id, icon, label }) => (
          <button
            key={id}
            onClick={() => onChange(id)}
            title={label}
            className={`w-full aspect-square flex items-center justify-center rounded-lg text-lg transition-colors
              ${active === id
                ? 'bg-indigo-600/20 text-indigo-400'
                : 'text-zinc-500 hover:text-zinc-300 hover:bg-[#1e1e22]'}`}
          >
            {icon}
          </button>
        ))}
      </div>
    </nav>
  )
}
