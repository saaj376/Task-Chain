import axios from 'axios'

const CLICKUP_API_BASE = 'https://api.clickup.com/api/v2'

interface ClickUpToken {
  access_token: string
  token_type: string
}

// Store tokens in memory (use a database in production)
const tokens = new Map<string, string>()

export async function exchangeCodeForToken(code: string): Promise<string> {
  try {
    const response = await axios.post('https://api.clickup.com/api/v2/oauth/token', {
      client_id: process.env.CLICKUP_CLIENT_ID,
      client_secret: process.env.CLICKUP_CLIENT_SECRET,
      code: code,
      redirect_uri: process.env.CLICKUP_REDIRECT_URI
    })

    const { access_token } = response.data as ClickUpToken
    return access_token
  } catch (error: any) {
    console.error('ClickUp token exchange error:', error.response?.data || error.message)
    throw new Error(`Failed to exchange code for token: ${error.response?.data?.err || error.message}`)
  }
}

export function storeToken(userId: string, token: string) {
  tokens.set(userId, token)
}

export function getToken(userId: string): string | undefined {
  return tokens.get(userId)
}

export async function getClickUpWorkspaces(accessToken: string) {
  try {
    const response = await axios.get(`${CLICKUP_API_BASE}/team`, {
      headers: {
        Authorization: accessToken
      }
    })
    return response.data.teams
  } catch (error: any) {
    console.error('ClickUp workspaces error:', error.response?.data || error.message)
    throw new Error(`Failed to fetch workspaces: ${error.response?.data?.err || error.message}`)
  }
}

export async function getClickUpSpaces(accessToken: string, teamId: string) {
  try {
    const response = await axios.get(`${CLICKUP_API_BASE}/team/${teamId}/space`, {
      headers: {
        Authorization: accessToken
      }
    })
    return response.data.spaces
  } catch (error: any) {
    throw new Error(`Failed to fetch spaces: ${error.message}`)
  }
}

export async function getClickUpLists(accessToken: string, spaceId: string) {
  try {
    const response = await axios.get(`${CLICKUP_API_BASE}/space/${spaceId}/list`, {
      headers: {
        Authorization: accessToken
      }
    })
    return response.data.lists
  } catch (error: any) {
    throw new Error(`Failed to fetch lists: ${error.message}`)
  }
}

export async function getClickUpTasks(accessToken: string, listId: string) {
  try {
    const response = await axios.get(`${CLICKUP_API_BASE}/list/${listId}/task`, {
      headers: {
        Authorization: accessToken
      }
    })
    return response.data.tasks
  } catch (error: any) {
    throw new Error(`Failed to fetch tasks: ${error.message}`)
  }
}

export async function createClickUpTask(
  accessToken: string,
  listId: string,
  taskData: {
    name: string
    description?: string
    priority?: number
    due_date?: number
    status?: string
  }
) {
  try {
    const response = await axios.post(
      `${CLICKUP_API_BASE}/list/${listId}/task`,
      taskData,
      {
        headers: {
          Authorization: accessToken,
          'Content-Type': 'application/json'
        }
      }
    )
    return response.data
  } catch (error: any) {
    throw new Error(`Failed to create task: ${error.message}`)
  }
}

export async function updateClickUpTask(
  accessToken: string,
  taskId: string,
  updates: {
    name?: string
    description?: string
    status?: string
    priority?: number
  }
) {
  try {
    const response = await axios.put(
      `${CLICKUP_API_BASE}/task/${taskId}`,
      updates,
      {
        headers: {
          Authorization: accessToken,
          'Content-Type': 'application/json'
        }
      }
    )
    return response.data
  } catch (error: any) {
    throw new Error(`Failed to update task: ${error.message}`)
  }
}

export async function syncTaskToClickUp(
  accessToken: string,
  listId: string,
  blockchainTask: any
) {
  // Map priority (blockchain 0-10 to ClickUp 1-4)
  let clickupPriority = 3 // Default to normal
  if (blockchainTask.priority >= 8) clickupPriority = 1 // Urgent
  else if (blockchainTask.priority >= 5) clickupPriority = 2 // High
  else if (blockchainTask.priority >= 3) clickupPriority = 3 // Normal
  else clickupPriority = 4 // Low

  const taskData: any = {
    name: blockchainTask.title || `Task #${blockchainTask.id}`,
    description: blockchainTask.description || ''
  }

  // Add optional fields only if they have values
  if (clickupPriority) taskData.priority = clickupPriority
  if (blockchainTask.deadline) {
    const deadlineMs = typeof blockchainTask.deadline === 'string' 
      ? new Date(blockchainTask.deadline).getTime()
      : blockchainTask.deadline
    taskData.due_date = deadlineMs
  }

  console.log('Syncing task to ClickUp:', taskData)
  return await createClickUpTask(accessToken, listId, taskData)
}

