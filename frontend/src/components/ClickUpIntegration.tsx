import { useState, useEffect } from 'react'
import * as clickupService from '../services/clickup'

interface ClickUpIntegrationProps {
  onListSelected?: (listId: string) => void
}

export function ClickUpIntegration({ onListSelected }: ClickUpIntegrationProps) {
  const [isConnected, setIsConnected] = useState(false)
  const [workspaces, setWorkspaces] = useState<clickupService.ClickUpWorkspace[]>([])
  const [spaces, setSpaces] = useState<clickupService.ClickUpSpace[]>([])
  const [lists, setLists] = useState<clickupService.ClickUpList[]>([])
  const [selectedWorkspace, setSelectedWorkspace] = useState<string>('')
  const [selectedSpace, setSelectedSpace] = useState<string>('')
  const [selectedList, setSelectedList] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>('')

  const checkAuthentication = async () => {
    try {
      const workspaces = await clickupService.getClickUpWorkspaces()
      if (workspaces && workspaces.length > 0) {
        setIsConnected(true)
        setWorkspaces(workspaces)
        setLoading(false)
        return true
      }
      setLoading(false)
      return false
    } catch (err) {
      setLoading(false)
      return false
    }
  }

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const clickupStatus = params.get('clickup')
    if (clickupStatus === 'success') {
      setLoading(true)
      window.location.replace(window.location.pathname)
      setTimeout(() => {
        checkAuthentication()
      }, 800)
    } else if (clickupStatus === 'error') {
      setError('Authorization failed. Please try again.')
      window.location.replace(window.location.pathname)
    } else {
      checkAuthentication()
    }
  }, [])

  const handleConnect = async () => {
    try {
      setLoading(true)
      setError('')
      const authUrl = await clickupService.getClickUpAuthUrl(window.location.href)
      window.location.href = authUrl
    } catch (err: any) {
      setError(err.message || 'Failed to connect to ClickUp')
      setLoading(false)
    }
  }

  const handleWorkspaceChange = async (workspaceId: string) => {
    setSelectedWorkspace(workspaceId)
    setSelectedSpace('')
    setSelectedList('')
    setSpaces([])
    setLists([])
    
    if (workspaceId) {
      try {
        setLoading(true)
        setError('')
        const spaces = await clickupService.getClickUpSpaces(workspaceId)
        setSpaces(spaces)
        setLoading(false)
      } catch (err: any) {
        setError(err.message || 'Failed to load spaces')
        setLoading(false)
      }
    }
  }

  const handleSpaceChange = async (spaceId: string) => {
    setSelectedSpace(spaceId)
    setSelectedList('')
    setLists([])
    
    if (spaceId) {
      try {
        setLoading(true)
        setError('')
        const lists = await clickupService.getClickUpLists(spaceId)
        setLists(lists)
        setLoading(false)
      } catch (err: any) {
        setError(err.message || 'Failed to load lists')
        setLoading(false)
      }
    }
  }

  const handleListChange = (listId: string) => {
    setSelectedList(listId)
    if (onListSelected) {
      onListSelected(listId)
    }
  }

  const cardStyle = {
    padding: '20px',
    border: '1px solid #111',
    borderRadius: '12px',
    background: 'linear-gradient(135deg, rgba(255,255,255,0.02), rgba(0,0,0,0.4))',
    boxShadow: '0 20px 50px rgba(0,0,0,0.35)',
    marginBottom: '24px'
  } as const

  const labelStyle = {
    display: 'block',
    marginBottom: '6px',
    fontWeight: 700,
    fontSize: '11px',
    letterSpacing: '0.5px',
    textTransform: 'uppercase',
    color: '#777'
  } as const

  const selectStyle = {
    width: '100%',
    padding: '10px 12px',
    borderRadius: '8px',
    border: '1px solid #222',
    background: '#0a0a0a',
    color: '#e0e0e0',
    fontFamily: 'inherit',
    outline: 'none'
  } as const

  if (!isConnected) {
    return (
      <div style={cardStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <h3 style={{ margin: 0, color: '#fff' }}>ClickUp</h3>
          <span style={{ color: '#666', fontSize: '12px' }}>Sync to your list</span>
        </div>
        <p style={{ color: '#888', marginTop: 0 }}>Connect ClickUp to push claimed/completed tasks to your workspace.</p>
        <button 
          onClick={handleConnect}
          disabled={loading}
          style={{
            padding: '10px 20px',
            background: loading ? '#111' : '#00ff88',
            color: loading ? '#666' : '#000',
            border: 'none',
            borderRadius: '8px',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontSize: '13px',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
          }}
        >
          {loading ? 'Connecting...' : 'Connect ClickUp'}
        </button>
        {error && <p style={{ color: '#ff3333', marginTop: '10px' }}>{error}</p>}
      </div>
    )
  }

  return (
    <div style={cardStyle}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
        <h3 style={{ margin: 0, color: '#fff' }}>ClickUp Connected</h3>
        <span style={{ color: '#00ff88', fontSize: '12px' }}>Synced</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <div>
          <label style={labelStyle}>Workspace</label>
          <select
            value={selectedWorkspace}
            onChange={(e) => handleWorkspaceChange(e.target.value)}
            disabled={loading}
            style={selectStyle}
          >
            <option value="">Select</option>
            {workspaces.map((workspace) => (
              <option key={workspace.id} value={workspace.id}>
                {workspace.name}
              </option>
            ))}
          </select>
        </div>

        {spaces.length > 0 && (
          <div>
            <label style={labelStyle}>Space</label>
            <select
              value={selectedSpace}
              onChange={(e) => handleSpaceChange(e.target.value)}
              disabled={loading}
              style={selectStyle}
            >
              <option value="">Select</option>
              {spaces.map((space) => (
                <option key={space.id} value={space.id}>
                  {space.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {lists.length > 0 && (
          <div>
            <label style={labelStyle}>List</label>
            <select
              value={selectedList}
              onChange={(e) => handleListChange(e.target.value)}
              disabled={loading}
              style={selectStyle}
            >
              <option value="">Select</option>
              {lists.map((list) => (
                <option key={list.id} value={list.id}>
                  {list.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {selectedList && (
          <div style={{
            padding: '10px',
            background: 'rgba(0,255,136,0.08)',
            borderRadius: '8px',
            border: '1px solid #00ff88',
            color: '#00ff88',
            fontWeight: 700,
            fontSize: '12px',
          }}>
            Connected to ClickUp list
          </div>
        )}

        {loading && <p style={{ color: '#7B68EE' }}>Loading...</p>}
        {error && <p style={{ color: '#ff3333' }}>{error}</p>}
      </div>
    </div>
  )
}
