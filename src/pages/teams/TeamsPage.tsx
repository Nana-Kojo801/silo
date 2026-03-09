import { useState } from 'react'
import { TEAMS, getMyTeamIds, joinTeam, leaveTeam, getCurrentTeam, setCurrentTeam } from '@/lib/teams'
import { Users, Check } from 'lucide-react'

export function TeamsPage() {
  const [memberIds, setMemberIds] = useState(getMyTeamIds)
  const [currentTeamId, setCurrentTeamId] = useState(getCurrentTeam)

  function handleToggle(id: string) {
    if (memberIds.includes(id)) {
      leaveTeam(id)
      setMemberIds(prev => prev.filter(t => t !== id))
      if (currentTeamId === id) {
        setCurrentTeam(null)
        setCurrentTeamId(null)
      }
    } else {
      joinTeam(id)
      setMemberIds(prev => [...prev, id])
    }
  }

  function handleSetCurrent(id: string) {
    if (!memberIds.includes(id)) {
      joinTeam(id)
      setMemberIds(prev => [...prev, id])
    }
    const next = currentTeamId === id ? null : id
    setCurrentTeam(next)
    setCurrentTeamId(next)
  }

  return (
    <div className="space-y-5 animate-fade-in">
      <div>
        <h1 className="text-base font-semibold" style={{ color: 'var(--text-1)' }}>Teams</h1>
        <p className="text-xs mt-0.5" style={{ color: 'var(--text-3)' }}>Join teams to filter your feed context</p>
      </div>

      {/* Current team */}
      {currentTeamId && (
        <div
          className="panel p-4 flex items-center gap-3"
          style={{ borderColor: 'var(--accent-border)', background: 'var(--accent-subtle)' }}
        >
          <div
            className="w-8 h-8 rounded flex items-center justify-center text-white text-xs font-bold shrink-0"
            style={{ background: TEAMS.find(t => t.id === currentTeamId)?.color ?? 'var(--accent)' }}
          >
            {TEAMS.find(t => t.id === currentTeamId)?.shortName[0]}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold" style={{ color: 'var(--accent-muted)' }}>Current team</p>
            <p className="text-sm font-medium" style={{ color: 'var(--text-1)' }}>
              {TEAMS.find(t => t.id === currentTeamId)?.name}
            </p>
          </div>
          <button
            onClick={() => handleSetCurrent(currentTeamId)}
            className="btn btn-ghost text-xs"
            style={{ color: 'var(--text-3)' }}
          >
            Clear
          </button>
        </div>
      )}

      {/* All teams */}
      <div className="feed-list">
        {TEAMS.map(team => {
          const isMember = memberIds.includes(team.id)
          const isCurrent = currentTeamId === team.id
          return (
            <div key={team.id} className="feed-item flex items-center gap-3">
              <div
                className="w-9 h-9 rounded flex items-center justify-center text-white text-sm font-bold shrink-0"
                style={{ background: team.color }}
              >
                {team.shortName[0]}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium" style={{ color: 'var(--text-1)' }}>{team.name}</span>
                  <span className="text-[10px] mono-text" style={{ color: 'var(--text-4)' }}>{team.shortName}</span>
                  {isCurrent && (
                    <span
                      className="text-[10px] font-semibold px-1.5 py-0.5 rounded"
                      style={{ background: 'var(--accent-subtle)', color: 'var(--accent-muted)', border: '1px solid var(--accent-border)' }}
                    >
                      Active
                    </span>
                  )}
                </div>
                <p className="text-xs mt-0.5" style={{ color: 'var(--text-3)' }}>{team.description}</p>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                {isMember && (
                  <button
                    onClick={() => handleSetCurrent(team.id)}
                    className="btn btn-ghost text-xs px-2 py-1"
                    style={isCurrent ? { color: 'var(--accent-muted)' } : {}}
                  >
                    <Users size={12} />
                    {isCurrent ? 'Active' : 'Set active'}
                  </button>
                )}
                <button
                  onClick={() => handleToggle(team.id)}
                  className="btn text-xs px-2.5 py-1"
                  style={isMember ? {
                    background: 'var(--surface-3)',
                    color: 'var(--text-2)',
                    border: '1px solid var(--border-2)',
                  } : {
                    background: 'var(--accent)',
                    color: 'var(--accent-text)',
                    border: 'none',
                  }}
                >
                  {isMember ? (
                    <><Check size={11} /> Joined</>
                  ) : 'Join'}
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
