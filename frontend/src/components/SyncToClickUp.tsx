import { useState } from 'react'
import * as clickupService from '../services/clickup'

interface SyncToClickUpProps {
  task: any
  listId?: string
}

export function SyncToClickUp({ task, listId }: SyncToClickUpProps) {
  const [syncing, setSyncing] = useState(false)
  const [synced, setSynced] = useState(false)
  const [error, setError] = useState<string>('')

  const handleSync = async () => {
    if (!listId) {
      setError('Select ClickUp list first')
      return
    }

    try {
      setSyncing(true)
      setError('')
      
      await clickupService.syncTaskToClickUp(listId, task)
      
      setSynced(true)
      setSyncing(false)
      
      setTimeout(() => {
        setSynced(false)
      }, 3000)
    } catch (err: any) {
      setError(err.message || 'Sync failed')
      setSyncing(false)
    }
  }

  if (synced) {
    return (
      <button
        disabled
        style={{
          background: 'rgba(0, 255, 136, 0.1)',
          border: '1px solid #00ff88',
          color: '#00ff88',
          padding: '8px 20px',
          borderRadius: '6px',
          fontSize: '13px',
          fontWeight: '600',
          cursor: 'default',
          textTransform: 'uppercase',
          fontFamily: 'inherit'
        }}
      >
        √ SYNCED
      </button>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
      <button
        onClick={handleSync}
        disabled={syncing || !listId}
        style={{
          background: listId ? 'transparent' : '#111',
          border: `1px solid ${listId ? '#00ff88' : '#333'}`,
          color: listId ? '#00ff88' : '#666',
          padding: '8px 20px',
          borderRadius: '6px',
          fontSize: '13px',
          fontWeight: '600',
          cursor: syncing || !listId ? 'not-allowed' : 'pointer',
          textTransform: 'uppercase',
          opacity: syncing || !listId ? 0.5 : 1,
          fontFamily: 'inherit'
        }}
        title={!listId ? 'Connect ClickUp first' : 'Sync to ClickUp'}
      >
        {syncing ? 'SYNCING...' : '↗ CLICKUP'}
      </button>
      {error && <span style={{ color: '#ff3333', fontSize: '10px', fontFamily: 'monospace' }}>{error}</span>}
    </div>
  )
}
