import { NextApiRequest, NextApiResponse } from 'next'

interface Notification {
  id: string
  type: 'action_assigned' | 'action_status_update' | 'action_completed' | 'workflow_started' | 'workflow_completed' | 'approval_required' | 'escalation'
  title: string
  message: string
  recipient: string
  sender?: string
  timestamp: string
  read: boolean
  priority: 'low' | 'medium' | 'high' | 'critical'
  actionId?: string
  threatPathId?: string
  workflowId?: string
  metadata?: any
}

interface TeamMember {
  id: string
  name: string
  role: string
  email: string
  phone?: string
  status: 'online' | 'away' | 'busy' | 'offline'
  preferences: {
    emailNotifications: boolean
    smsNotifications: boolean
    pushNotifications: boolean
    escalationThreshold: number // minutes
  }
}

// Mock data for demo
let mockNotifications: Notification[] = [
  {
    id: 'notif-1',
    type: 'action_assigned',
    title: 'New Action Assigned',
    message: 'Containment action "Isolate Affected Systems" has been assigned to you',
    recipient: '1',
    sender: 'system',
    timestamp: new Date(Date.now() - 300000).toISOString(), // 5 minutes ago
    read: false,
    priority: 'high',
    actionId: 'action-123',
    threatPathId: 'threat-path-456'
  },
  {
    id: 'notif-2',
    type: 'workflow_started',
    title: 'Workflow Started',
    message: 'Critical Incident Response workflow has been initiated for threat path "APT Campaign Detection"',
    recipient: '2',
    sender: '1',
    timestamp: new Date(Date.now() - 600000).toISOString(), // 10 minutes ago
    read: true,
    priority: 'critical',
    workflowId: 'workflow-789',
    threatPathId: 'threat-path-456'
  },
  {
    id: 'notif-3',
    type: 'approval_required',
    title: 'Approval Required',
    message: 'High-impact remediation action requires your approval before execution',
    recipient: '3',
    sender: '2',
    timestamp: new Date(Date.now() - 900000).toISOString(), // 15 minutes ago
    read: false,
    priority: 'high',
    actionId: 'action-456',
    threatPathId: 'threat-path-456'
  }
]

const mockTeamMembers: TeamMember[] = [
  {
    id: '1',
    name: 'Sarah Chen',
    role: 'SOC Analyst L2',
    email: 'sarah.chen@company.com',
    phone: '+1-555-0101',
    status: 'online',
    preferences: {
      emailNotifications: true,
      smsNotifications: false,
      pushNotifications: true,
      escalationThreshold: 30
    }
  },
  {
    id: '2',
    name: 'Mike Rodriguez',
    role: 'SOC Analyst L3',
    email: 'mike.rodriguez@company.com',
    phone: '+1-555-0102',
    status: 'online',
    preferences: {
      emailNotifications: true,
      smsNotifications: true,
      pushNotifications: true,
      escalationThreshold: 15
    }
  },
  {
    id: '3',
    name: 'Dr. Emily Watson',
    role: 'CISO',
    email: 'emily.watson@company.com',
    phone: '+1-555-0103',
    status: 'away',
    preferences: {
      emailNotifications: true,
      smsNotifications: true,
      pushNotifications: true,
      escalationThreshold: 60
    }
  },
  {
    id: '4',
    name: 'James Park',
    role: 'Incident Response',
    email: 'james.park@company.com',
    phone: '+1-555-0104',
    status: 'online',
    preferences: {
      emailNotifications: true,
      smsNotifications: false,
      pushNotifications: true,
      escalationThreshold: 20
    }
  },
  {
    id: '5',
    name: 'Lisa Thompson',
    role: 'Threat Hunter',
    email: 'lisa.thompson@company.com',
    phone: '+1-555-0105',
    status: 'busy',
    preferences: {
      emailNotifications: true,
      smsNotifications: false,
      pushNotifications: false,
      escalationThreshold: 45
    }
  }
]

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req

  try {
    switch (method) {
      case 'GET':
        return handleGetNotifications(req, res)
      case 'POST':
        return handleCreateNotification(req, res)
      case 'PUT':
        return handleUpdateNotification(req, res)
      case 'DELETE':
        return handleDeleteNotification(req, res)
      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE'])
        return res.status(405).json({ error: 'Method not allowed' })
    }
  } catch (error) {
    console.error('Notifications API Error:', error)
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}

async function handleGetNotifications(req: NextApiRequest, res: NextApiResponse) {
  const { recipient, unreadOnly, type, limit = '50' } = req.query

  let filteredNotifications = [...mockNotifications]

  // Apply filters
  if (recipient) {
    filteredNotifications = filteredNotifications.filter(notif => notif.recipient === recipient)
  }
  if (unreadOnly === 'true') {
    filteredNotifications = filteredNotifications.filter(notif => !notif.read)
  }
  if (type) {
    filteredNotifications = filteredNotifications.filter(notif => notif.type === type)
  }

  // Sort by timestamp (newest first)
  filteredNotifications.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

  // Apply limit
  const limitNum = parseInt(limit as string)
  if (limitNum > 0) {
    filteredNotifications = filteredNotifications.slice(0, limitNum)
  }

  // Get summary statistics
  const summary = {
    total: mockNotifications.filter(n => !recipient || n.recipient === recipient).length,
    unread: mockNotifications.filter(n => (!recipient || n.recipient === recipient) && !n.read).length,
    critical: mockNotifications.filter(n => (!recipient || n.recipient === recipient) && n.priority === 'critical').length,
    high: mockNotifications.filter(n => (!recipient || n.recipient === recipient) && n.priority === 'high').length
  }

  return res.status(200).json({
    success: true,
    data: {
      notifications: filteredNotifications,
      summary,
      teamMembers: mockTeamMembers
    }
  })
}

async function handleCreateNotification(req: NextApiRequest, res: NextApiResponse) {
  const notificationData = req.body as Partial<Notification>

  // Validate required fields
  if (!notificationData.type || !notificationData.message || !notificationData.recipient) {
    return res.status(400).json({
      error: 'Missing required fields',
      required: ['type', 'message', 'recipient']
    })
  }

  const newNotification: Notification = {
    id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    type: notificationData.type,
    title: notificationData.title || getDefaultTitle(notificationData.type),
    message: notificationData.message,
    recipient: notificationData.recipient,
    sender: notificationData.sender || 'system',
    timestamp: new Date().toISOString(),
    read: false,
    priority: notificationData.priority || 'medium',
    actionId: notificationData.actionId,
    threatPathId: notificationData.threatPathId,
    workflowId: notificationData.workflowId,
    metadata: notificationData.metadata
  }

  mockNotifications.push(newNotification)

  // Simulate sending notification via various channels
  await sendNotificationChannels(newNotification)

  return res.status(201).json({
    success: true,
    data: newNotification,
    message: 'Notification created and sent successfully'
  })
}

async function handleUpdateNotification(req: NextApiRequest, res: NextApiResponse) {
  const { notificationId } = req.query
  const updates = req.body

  const notificationIndex = mockNotifications.findIndex(notif => notif.id === notificationId)
  if (notificationIndex === -1) {
    return res.status(404).json({
      error: 'Notification not found',
      notificationId
    })
  }

  const updatedNotification = { ...mockNotifications[notificationIndex], ...updates }
  mockNotifications[notificationIndex] = updatedNotification

  return res.status(200).json({
    success: true,
    data: updatedNotification,
    message: 'Notification updated successfully'
  })
}

async function handleDeleteNotification(req: NextApiRequest, res: NextApiResponse) {
  const { notificationId } = req.query

  const notificationIndex = mockNotifications.findIndex(notif => notif.id === notificationId)
  if (notificationIndex === -1) {
    return res.status(404).json({
      error: 'Notification not found',
      notificationId
    })
  }

  const deletedNotification = mockNotifications.splice(notificationIndex, 1)[0]

  return res.status(200).json({
    success: true,
    data: deletedNotification,
    message: 'Notification deleted successfully'
  })
}

function getDefaultTitle(type: Notification['type']): string {
  const titles = {
    action_assigned: 'Action Assigned',
    action_status_update: 'Action Status Update',
    action_completed: 'Action Completed',
    workflow_started: 'Workflow Started',
    workflow_completed: 'Workflow Completed',
    approval_required: 'Approval Required',
    escalation: 'Escalation Notice'
  }
  return titles[type] || 'Notification'
}

async function sendNotificationChannels(notification: Notification) {
  const recipient = mockTeamMembers.find(member => member.id === notification.recipient)
  if (!recipient) return

  const channels = []

  // Email notification
  if (recipient.preferences.emailNotifications) {
    channels.push(sendEmailNotification(notification, recipient))
  }

  // SMS notification for high/critical priority
  if (recipient.preferences.smsNotifications && ['high', 'critical'].includes(notification.priority)) {
    channels.push(sendSMSNotification(notification, recipient))
  }

  // Push notification
  if (recipient.preferences.pushNotifications) {
    channels.push(sendPushNotification(notification, recipient))
  }

  // Wait for all channels to complete
  await Promise.all(channels)
}

async function sendEmailNotification(notification: Notification, recipient: TeamMember) {
  // Simulate email sending
  console.log(`📧 Email sent to ${recipient.email}: ${notification.title}`)
  return new Promise(resolve => setTimeout(resolve, 100))
}

async function sendSMSNotification(notification: Notification, recipient: TeamMember) {
  // Simulate SMS sending
  console.log(`📱 SMS sent to ${recipient.phone}: ${notification.message}`)
  return new Promise(resolve => setTimeout(resolve, 200))
}

async function sendPushNotification(notification: Notification, recipient: TeamMember) {
  // Simulate push notification
  console.log(`🔔 Push notification sent to ${recipient.name}: ${notification.title}`)
  return new Promise(resolve => setTimeout(resolve, 50))
}

// Bulk operations endpoint
export async function handleBulkNotifications(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { action, notificationIds, updates } = req.body

  switch (action) {
    case 'mark_read':
      notificationIds.forEach((id: string) => {
        const index = mockNotifications.findIndex(n => n.id === id)
        if (index !== -1) {
          mockNotifications[index].read = true
        }
      })
      break

    case 'mark_unread':
      notificationIds.forEach((id: string) => {
        const index = mockNotifications.findIndex(n => n.id === id)
        if (index !== -1) {
          mockNotifications[index].read = false
        }
      })
      break

    case 'delete':
      mockNotifications = mockNotifications.filter(n => !notificationIds.includes(n.id))
      break

    case 'update':
      notificationIds.forEach((id: string) => {
        const index = mockNotifications.findIndex(n => n.id === id)
        if (index !== -1) {
          mockNotifications[index] = { ...mockNotifications[index], ...updates }
        }
      })
      break

    default:
      return res.status(400).json({ error: 'Invalid bulk action' })
  }

  return res.status(200).json({
    success: true,
    message: `Bulk ${action} completed for ${notificationIds.length} notifications`
  })
}

