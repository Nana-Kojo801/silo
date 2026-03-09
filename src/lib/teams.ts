export interface Team {
  id: string
  name: string
  shortName: string
  description: string
  color: string
}

export const TEAMS: Team[] = [
  { id: 'engineering',     name: 'Engineering',     shortName: 'ENG', description: 'Software engineers building the product.',         color: '#3B82F6' },
  { id: 'product',         name: 'Product',         shortName: 'PM',  description: 'Product managers shaping the roadmap.',           color: '#8B5CF6' },
  { id: 'design',          name: 'Design',          shortName: 'DES', description: 'Designers crafting the user experience.',         color: '#EC4899' },
  { id: 'growth',          name: 'Growth',          shortName: 'GRW', description: 'Growth and acquisition.',                        color: '#10B981' },
  { id: 'marketing',       name: 'Marketing',       shortName: 'MKT', description: 'Brand, content, and campaigns.',                 color: '#F97316' },
  { id: 'operations',      name: 'Operations',      shortName: 'OPS', description: 'Keeping everything running smoothly.',           color: '#64748B' },
  { id: 'finance',         name: 'Finance',         shortName: 'FIN', description: 'Finance and accounting team.',                   color: '#22C55E' },
  { id: 'data',            name: 'Data',            shortName: 'DAT', description: 'Data science and analytics.',                    color: '#06B6D4' },
  { id: 'research',        name: 'Research',        shortName: 'RES', description: 'User research and market intelligence.',         color: '#A855F7' },
  { id: 'community',       name: 'Community',       shortName: 'COM', description: 'Community managers and advocates.',              color: '#EF4444' },
  { id: 'legal',           name: 'Legal',           shortName: 'LGL', description: 'Legal and compliance.',                         color: '#94A3B8' },
  { id: 'leadership',      name: 'Leadership',      shortName: 'LDR', description: 'Founders and senior leadership.',               color: '#1D4ED8' },
  { id: 'campus-media',    name: 'Campus Media',    shortName: 'MED', description: 'Campus journalists and content creators.',      color: '#FB923C' },
  { id: 'student-council', name: 'Student Council', shortName: 'SCA', description: 'Student government and campus reps.',           color: '#6366F1' },
  { id: 'events',          name: 'Events',          shortName: 'EVT', description: 'Event organizers and coordinators.',            color: '#14B8A6' },
]

export function getTeam(id: string): Team | undefined {
  return TEAMS.find((t) => t.id === id)
}

const MEMBERSHIP_KEY = 'silo:team-memberships'
const CURRENT_TEAM_KEY = 'silo:current-team'

export function getMyTeamIds(): string[] {
  try {
    return JSON.parse(localStorage.getItem(MEMBERSHIP_KEY) ?? '[]')
  } catch {
    return []
  }
}

export function getMyTeams(): Team[] {
  const ids = getMyTeamIds()
  return TEAMS.filter(t => ids.includes(t.id))
}

export function joinTeam(id: string): void {
  const current = getMyTeamIds()
  if (!current.includes(id)) {
    localStorage.setItem(MEMBERSHIP_KEY, JSON.stringify([...current, id]))
  }
}

export function leaveTeam(id: string): void {
  const current = getMyTeamIds().filter((t) => t !== id)
  localStorage.setItem(MEMBERSHIP_KEY, JSON.stringify(current))
  if (getCurrentTeam() === id) setCurrentTeam(null)
}

export function getCurrentTeam(): string | null {
  return localStorage.getItem(CURRENT_TEAM_KEY)
}

export function setCurrentTeam(id: string | null): void {
  if (id === null) {
    localStorage.removeItem(CURRENT_TEAM_KEY)
  } else {
    localStorage.setItem(CURRENT_TEAM_KEY, id)
  }
}
