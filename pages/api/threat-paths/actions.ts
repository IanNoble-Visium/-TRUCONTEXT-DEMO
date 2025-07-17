import { NextApiRequest, NextApiResponse } from 'next'
import { SOCAction, ActionStatus, WorkflowExecution } from '../../../types/threatPath'

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
        pending: filteredActions.filter(a => a.status === 'pending').length,
        inProgress: filteredActions.filter(a => a.status === 'in_progress').length,
        completed: filteredActions.filter(a => a.status === 'completed').length,
        failed: filteredActions.filter(a => a.status === 'failed').length
      },
      teamMembers: mockTeamMembers
    }
  })
}

async function handleCreateAction(req: NextApiRequest, res: NextApiResponse) {
  const actionData = req.body as Partial<SOCAction>

  // Validate required fields
  if (!actionData.threatPathId || !actionData.type || !actionData.title || !actionData.description) {
    return res.status(400).json({
      error: 'Missing required fields',
      required: ['threatPathId', 'type', 'title', 'description']
    })
  }

  const newAction: SOCAction = {
    id: `action-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    threatPathId: actionData.threatPathId,
    type: actionData.type,
    title: actionData.title,
    description: actionData.description,
    status: 'pending',
    priority: actionData.priority || 'medium',
    assignedTo: actionData.assignedTo || '',
    createdAt: new Date().toISOString(),
    estimatedDuration: actionData.estimatedDuration || '30 minutes',
    targetNodes: actionData.targetNodes || [],
    targetIPs: actionData.targetIPs || [],
    targetDomains: actionData.targetDomains || [],
    targetAccounts: actionData.targetAccounts || [],
    notes: actionData.notes || '',
    approvalRequired: actionData.approvalRequired || false,
    automatedExecution: actionData.automatedExecution || false,
    scheduledTime: actionData.scheduledTime
  }

  mockActions.push(newAction)

  // Send notification if assigned
  if (newAction.assignedTo) {
    const notification = {
      id: `notif-${Date.now()}`,
      type: 'action_assigned',
      actionId: newAction.id,
      threatPathId: newAction.threatPathId,
      message: `New ${newAction.type} action assigned: ${newAction.title}`,
      recipient: newAction.assignedTo,
      timestamp: new Date().toISOString(),
      read: false
    }
    mockNotifications.push(notification)
  }

  // Auto-execute if automated and no approval required
  if (newAction.automatedExecution && !newAction.approvalRequired) {
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
      case 'in_progress':
        updatedAction.startedAt = new Date().toISOString()
        break
      case 'completed':
        updatedAction.completedAt = new Date().toISOString()
        break
      case 'failed':
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
  mockActions[actionIndex] = {
    ...action,
    status: 'in_progress',
    startedAt: new Date().toISOString()
  }

  // Simulate execution time
  setTimeout(() => {
    const success = Math.random() > 0.1 // 90% success rate

    mockActions[actionIndex] = {
      ...mockActions[actionIndex],
      status: success ? 'completed' : 'failed',
      completedAt: success ? new Date().toISOString() : undefined,
      failedAt: success ? undefined : new Date().toISOString(),
      executionResults: {
        success,
        message: success ? 'Automated execution completed successfully' : 'Automated execution failed',
        affectedSystems: action.targetNodes?.length || 0,
        executionTime: '2.3 seconds'
      }
    }

    // Send completion notification
    const notification = {
      id: `notif-${Date.now()}`,
      type: 'action_completed',
      actionId: action.id,
      threatPathId: action.threatPathId,
      message: `Automated action "${action.title}" ${success ? 'completed successfully' : 'failed'}`,
      recipient: action.assignedTo,
      timestamp: new Date().toISOString(),
      read: false
    }
    mockNotifications.push(notification)
  }, 3000) // 3-second execution time
}

