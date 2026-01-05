import { Router, Request, Response } from 'express'
import * as clickupService from '../services/clickup'

const router = Router()

// OAuth authorization URL
router.get('/auth', (req: Request, res: Response) => {
  const clientId = process.env.CLICKUP_CLIENT_ID
  const redirectUri = encodeURIComponent(process.env.CLICKUP_REDIRECT_URI || '')
  const returnUrl = req.query.returnUrl as string || 'http://localhost:5173/member-dashboard'
  
  // Encode the return URL to pass as state
  const state = encodeURIComponent(returnUrl)
  
  const authUrl = `https://app.clickup.com/api?client_id=${clientId}&redirect_uri=${redirectUri}&state=${state}`
  
  console.log('ClickUp Auth URL:', authUrl)
  console.log('Return URL:', returnUrl)
  res.json({ authUrl })
})

// OAuth callback
router.get('/callback', async (req: Request, res: Response) => {
  try {
    const { code, error, state } = req.query

    // Decode the return URL from state
    const returnUrl = state ? decodeURIComponent(state as string) : 'http://localhost:5173/member-dashboard'

    if (error) {
      console.error('ClickUp OAuth error from ClickUp:', error)
      return res.redirect(`${returnUrl}${returnUrl.includes('?') ? '&' : '?'}clickup=error`)
    }

    if (!code || typeof code !== 'string') {
      return res.status(400).json({ error: 'Authorization code is required' })
    }

    console.log('Exchanging code for token...')
    const accessToken = await clickupService.exchangeCodeForToken(code)
    console.log('Token received successfully')
    
    // Store token with default user
    const userId = 'default_user'
    clickupService.storeToken(userId, accessToken)

    // Redirect to original page with success
    console.log('Redirecting back to:', returnUrl)
    res.redirect(`${returnUrl}${returnUrl.includes('?') ? '&' : '?'}clickup=success`)
  } catch (error: any) {
    console.error('ClickUp OAuth error:', error)
    const returnUrl = req.query.state ? decodeURIComponent(req.query.state as string) : 'http://localhost:5173/member-dashboard'
    res.redirect(`${returnUrl}${returnUrl.includes('?') ? '&' : '?'}clickup=error`)
  }
})

// Get workspaces/teams
router.get('/workspaces', async (req: Request, res: Response) => {
  try {
    const userId = req.query.userId as string || 'default_user'
    const token = clickupService.getToken(userId)

    if (!token) {
      return res.status(401).json({ error: 'Not authenticated with ClickUp' })
    }

    const workspaces = await clickupService.getClickUpWorkspaces(token)
    res.json({ workspaces })
  } catch (error: any) {
    console.error('Error fetching workspaces:', error)
    res.status(500).json({ error: error.message })
  }
})

// Get spaces in a workspace
router.get('/spaces/:teamId', async (req: Request, res: Response) => {
  try {
    const { teamId } = req.params
    const userId = req.query.userId as string || 'default_user'
    const token = clickupService.getToken(userId)

    if (!token) {
      return res.status(401).json({ error: 'Not authenticated with ClickUp' })
    }

    const spaces = await clickupService.getClickUpSpaces(token, teamId)
    res.json({ spaces })
  } catch (error: any) {
    console.error('Error fetching spaces:', error)
    res.status(500).json({ error: error.message })
  }
})

// Get lists in a space
router.get('/lists/:spaceId', async (req: Request, res: Response) => {
  try {
    const { spaceId } = req.params
    const userId = req.query.userId as string || 'default_user'
    const token = clickupService.getToken(userId)

    if (!token) {
      return res.status(401).json({ error: 'Not authenticated with ClickUp' })
    }

    const lists = await clickupService.getClickUpLists(token, spaceId)
    res.json({ lists })
  } catch (error: any) {
    console.error('Error fetching lists:', error)
    res.status(500).json({ error: error.message })
  }
})

// Get tasks in a list
router.get('/tasks/:listId', async (req: Request, res: Response) => {
  try {
    const { listId } = req.params
    const userId = req.query.userId as string || 'default_user'
    const token = clickupService.getToken(userId)

    if (!token) {
      return res.status(401).json({ error: 'Not authenticated with ClickUp' })
    }

    const tasks = await clickupService.getClickUpTasks(token, listId)
    res.json({ tasks })
  } catch (error: any) {
    console.error('Error fetching tasks:', error)
    res.status(500).json({ error: error.message })
  }
})

// Create a task in ClickUp
router.post('/tasks/:listId', async (req: Request, res: Response) => {
  try {
    const { listId } = req.params
    const userId = req.query.userId as string || 'default_user'
    const token = clickupService.getToken(userId)

    if (!token) {
      return res.status(401).json({ error: 'Not authenticated with ClickUp' })
    }

    const task = await clickupService.createClickUpTask(token, listId, req.body)
    res.json({ task })
  } catch (error: any) {
    console.error('Error creating task:', error)
    res.status(500).json({ error: error.message })
  }
})

// Sync blockchain task to ClickUp
router.post('/sync/:listId', async (req: Request, res: Response) => {
  try {
    const { listId } = req.params
    const userId = req.query.userId as string || 'default_user'
    const token = clickupService.getToken(userId)

    if (!token) {
      return res.status(401).json({ error: 'Not authenticated with ClickUp' })
    }

    const task = await clickupService.syncTaskToClickUp(token, listId, req.body)
    res.json({ task })
  } catch (error: any) {
    console.error('Error syncing task:', error)
    res.status(500).json({ error: error.message })
  }
})

// Update a task in ClickUp
router.put('/tasks/:taskId', async (req: Request, res: Response) => {
  try {
    const { taskId } = req.params
    const userId = req.query.userId as string || 'default_user'
    const token = clickupService.getToken(userId)

    if (!token) {
      return res.status(401).json({ error: 'Not authenticated with ClickUp' })
    }

    const task = await clickupService.updateClickUpTask(token, taskId, req.body)
    res.json({ task })
  } catch (error: any) {
    console.error('Error updating task:', error)
    res.status(500).json({ error: error.message })
  }
})

export default router
