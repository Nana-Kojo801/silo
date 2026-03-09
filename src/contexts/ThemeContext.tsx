import { createContext, useContext, useEffect, useState } from 'react'

export const THEMES = [
  { id: 'midnight',   label: 'Midnight',          dark: true,  accent: '#6366F1', bg: '#09090B' },
  { id: 'graphite',   label: 'Graphite',          dark: true,  accent: '#3B82F6', bg: '#0C0C0C' },
  { id: 'carbon',     label: 'Carbon',            dark: true,  accent: '#94A3B8', bg: '#050505' },
  { id: 'obsidian',   label: 'Obsidian',          dark: true,  accent: '#F97316', bg: '#0C0A08' },
  { id: 'slate',      label: 'Slate',             dark: true,  accent: '#38BDF8', bg: '#0A0D12' },
  { id: 'aurora',     label: 'Aurora',            dark: true,  accent: '#A78BFA', bg: '#08100E' },
  { id: 'ember',      label: 'Ember',             dark: true,  accent: '#FBBF24', bg: '#0D0A06' },
  { id: 'ocean',      label: 'Ocean',             dark: true,  accent: '#22D3EE', bg: '#05080F' },
  { id: 'dusk',       label: 'Dusk',              dark: true,  accent: '#F472B6', bg: '#090610' },
  { id: 'monochrome', label: 'Monochrome',        dark: true,  accent: '#FFFFFF', bg: '#000000' },
  { id: 'light',      label: 'Light',             dark: false, accent: '#4F46E5', bg: '#F6F6F8' },
  { id: 'ivory',      label: 'Ivory',             dark: false, accent: '#1D4ED8', bg: '#FAF8F4' },
  { id: 'arctic',     label: 'Arctic',            dark: false, accent: '#0369A1', bg: '#EEF3F8' },
  { id: 'sage',       label: 'Sage',              dark: false, accent: '#059669', bg: '#EEF2EE' },
  { id: 'neon',       label: 'Neon',              dark: true,  accent: '#39FF14', bg: '#010101' },
] as const

export type ThemeId = typeof THEMES[number]['id']

interface ThemeContextValue {
  theme: ThemeId
  setTheme: (id: ThemeId) => void
  themes: typeof THEMES
  isDark: boolean
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: 'midnight',
  setTheme: () => {},
  themes: THEMES,
  isDark: true,
})

const STORAGE_KEY = 'silo:theme'

function getInitialTheme(): ThemeId {
  try {
    const stored = localStorage.getItem(STORAGE_KEY) as ThemeId | null
    if (stored && THEMES.find((t) => t.id === stored)) return stored
  } catch {}
  return 'midnight'
}

// Apply theme synchronously before first render to avoid flash
const initial = getInitialTheme()
document.documentElement.setAttribute('data-theme', initial)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeId>(initial)

  const setTheme = (id: ThemeId) => {
    setThemeState(id)
    document.documentElement.setAttribute('data-theme', id)
    try { localStorage.setItem(STORAGE_KEY, id) } catch {}
  }

  const isDark = THEMES.find((t) => t.id === theme)?.dark ?? true

  return (
    <ThemeContext.Provider value={{ theme, setTheme, themes: THEMES, isDark }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  return useContext(ThemeContext)
}
