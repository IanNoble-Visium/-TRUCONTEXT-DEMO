import { NextApiRequest, NextApiResponse } from 'next'
import { SOCAction } from '../../../types/threatPath'

// Define ActionStatus locally
type ActionStatus = 'Pending' | 'In Progress' | 'Completed' | 'Verified' | 'Failed' | 'Running'
type WorkflowExecution = {
  id: string
  name: string
  status: 'Pending' | 'Running' | 'Completed' | 'Failed'
  steps: any[]
  startedAt?: string
  completedAt?: string
}

// Mock database for demo purposes
let mockActions: SOCAction[] = []
let mockWorkflows: WorkflowExecution[] = []
let mockNotifications: any[] = []

// Mock team members
const mockTeamMembers = [
  { id: '1', name: 'Sarah Chen', role: 'SOC Analyst L2', email: 'sarah.chen@company.com', status: 'online' },
  { id: '2', name: 'Mike Rodriguez', role: 'SOC Analyst L3', email: 'mike.rodriguez@company.com', status: 'online' },
  { id: '3', name: 'Dr. Emily Watson', role: 'CISO', email: 'emily.watson@company.com', status: 'away' },
  { id: '4', name: 'James Park', role: 'Incident Response', email: 'james.park@company.com', status: 'online' },
  { id: '5', name: 'Lisa Thompson', role: 'Threat Hunter', email: 'lisa.thompson@company.com', status: 'busy' }
]

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req

  try {
    switch (method) {
      case 'GET':
        return handleGetActions(req, res)
      case 'POST':
        return handleCreateAction(req, res)
      case 'PUT':
        return handleUpdateAction(req, res)
      case 'DELETE':
        return handleDeleteAction(req, res)
      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE'])
        return res.status(405).json({ error: 'Method not allowed' })
    }
  } catch (error) {
    console.error('API Error:', error)
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}

async function handleGetActions(req: NextApiRequest, res: NextApiResponse) {
  const { threatPathId, status, assignedTo, type } = req.query

  let filteredActions = [...mockActions]

  // Apply filters
  if (threatPathId) {
    filteredActions = filteredActions.filter(action => action.threatPathId === threatPathId)
  }
  if (status) {
    filteredActions = filteredActions.filter(action => action.status === status)
  }
  if (assignedTo) {
    filteredActions = filteredActions.filter(action => action.assignedTo === assignedTo)
  }
  if (type) {
    filteredActions = filteredActions.filter(action => action.type === type)
  }

  // Sort by creation date (newest first)
  filteredActions.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  return res.status(200).json({
    success: true,
    data: {
      actions: filteredActions,
      summary: {
        total: filteredActions.length,
        pending: filteredActions.filter(a => a.status === 'Pending').length,
        inProgress: filteredActions.filter(a => a.status === 'In Progress').length,
        completed: filteredActions.filter(a => a.status === 'Completed').length,
        failed: filteredActions.filter(a => a.status === 'Failed').length
      },
      teamMembers: mockTeamMembers
    }
  })
}

async function handleCreateAction(req: NextApiRequest, res: NextApiResponse) {
  const actionData = req.body as Partial<SOCAction>

  // Validate required fields
  if (!actionData.type || !actionData.name || !actionData.description) {
    return res.status(400).json({
      error: 'Missing required fields',
      required: ['type', 'name', 'description']
    })
  }

  const newAction: SOCAction = {
    id: `action-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    threatPathId: 'default-threat-path',
    type: actionData.type!,
    category: 'Security Response',
    name: actionData.name!,
    description: actionData.description!,
    priority: 'Medium',
    status: 'Pending',
    estimatedTime: '30 minutes',
    automationAvailable: false,
    approvalRequired: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }

  mockActions.push(newAction)

  // Send notification if assigned
  if (actionData.assignedTo) {
    const notification = {
      id: `notif-${Date.now()}`,
      type: 'action_assigned',
      actionId: newAction.id,
      threatPathId: newAction.threatPathId,
      message: `New ${newAction.type} action assigned: ${newAction.name}`,
      recipient: newAction.assignedTo,
      timestamp: new Date().toISOString(),
      read: false
    }
    mockNotifications.push(notification)
  }

  // Auto-execute if automated and no approval required
  if (newAction.automationAvailable && !newAction.approvalRequired) {
    setTimeout(() => {
      executeAutomatedAction(newAction.id)
    }, 2000) // Simulate 2-second execution delay
  }

  return res.status(201).json({
    success: true,
    data: newAction,
    message: 'Action created successfully'
  })
}

async function handleUpdateAction(req: NextApiRequest, res: NextApiResponse) {
  const { actionId } = req.query
  const updates = req.body

  const actionIndex = mockActions.findIndex(action => action.id === actionId)
  if (actionIndex === -1) {
    return res.status(404).json({
      error: 'Action not found',
      actionId
    })
  }

  const originalAction = mockActions[actionIndex]
  const updatedAction = { ...originalAction, ...updates }

  // Update timestamps based on status changes
  if (updates.status && updates.status !== originalAction.status) {
    switch (updates.status) {
      case 'In Progress':
        updatedAction.startedAt = new Date().toISOString()
        break
      case 'Completed':
        updatedAction.completedAt = new Date().toISOString()
        break
      case 'Failed':
        updatedAction.failedAt = new Date().toISOString()
        break
    }

    // Send status update notification
    const notification = {
      id: `notif-${Date.now()}`,
      type: 'action_status_update',
      actionId: updatedAction.id,
      threatPathId: updatedAction.threatPathId,
      message: `Action "${updatedAction.title}" status changed to ${updates.status}`,
      recipient: updatedAction.assignedTo,
      timestamp: new Date().toISOString(),
      read: false
    }
    mockNotifications.push(notification)
  }

  mockActions[actionIndex] = updatedAction

  return res.status(200).json({
    success: true,
    data: updatedAction,
    message: 'Action updated successfully'
  })
}

async function handleDeleteAction(req: NextApiRequest, res: NextApiResponse) {
  const { actionId } = req.query

  const actionIndex = mockActions.findIndex(action => action.id === actionId)
  if (actionIndex === -1) {
    return res.status(404).json({
      error: 'Action not found',
      actionId
    })
  }

  const deletedAction = mockActions.splice(actionIndex, 1)[0]

  return res.status(200).json({
    success: true,
    data: deletedAction,
    message: 'Action deleted successfully'
  })
}

async function executeAutomatedAction(actionId: string) {
  const actionIndex = mockActions.findIndex(action => action.id === actionId)
  if (actionIndex === -1) return

  const action = mockActions[actionIndex]

  // Simulate automated execution
  const updatedAction = {
    ...action,
    status: 'In Progress' as const,
    updatedAt: new Date().toISOString()
  }
  
  mockActions[actionIndex] = updatedAction

  // Simulate execution time
  setTimeout(() => {
    const success = Math.random() > 0.1 // 90% success rate

    mockActions[actionIndex] = {
      ...mockActions[actionIndex],
      status: success ? 'Completed' : 'Failed',
      completedAt: success ? new Date().toISOString() : undefined,
      updatedAt: new Date().toISOString()
    }

    // Send completion notification
    const notification = {
      id: `notif-${Date.now()}`,
      type: 'action_completed',
      actionId: action.id,
      threatPathId: action.threatPathId,
      message: `Automated action "${action.name}" ${success ? 'completed successfully' : 'Failed'}`,
      recipient: action.assignedTo,
      timestamp: new Date().toISOString(),
      read: false
    }
    mockNotifications.push(notification)
  }, 3000) // 3-second execution time
}

