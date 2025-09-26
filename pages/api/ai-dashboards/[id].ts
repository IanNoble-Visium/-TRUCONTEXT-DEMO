import type { NextApiRequest, NextApiResponse } from 'next'
import { deleteAIDashboard, getAIDashboard, publishAIDashboard, initializeDatabase } from '../../../lib/postgres'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query
  const dashboardId = parseInt(id as string, 10)
  if (isNaN(dashboardId)) return res.status(400).json({ error: 'Invalid id' })

  try {
    await initializeDatabase()

    if (req.method === 'GET') {
      const result = await getAIDashboard(dashboardId)
      return res.status(200).json(result)
    }

    if (req.method === 'DELETE') {
      await deleteAIDashboard(dashboardId)
      return res.status(204).end()
    }

    if (req.method === 'POST') {
      const { action } = req.query
      if (action === 'publish') {
        const slug = await publishAIDashboard(dashboardId)
        return res.status(200).json({ shared_slug: slug, share_url: `/api/ai-dashboards/share/${slug}` })
      }
      return res.status(400).json({ error: 'Unknown action' })
    }

    res.setHeader('Allow', ['GET', 'DELETE', 'POST'])
    return res.status(405).json({ error: 'Method not allowed' })
  } catch (error) {
    console.error('AI dashboards [id] error:', error)
    return res.status(500).json({ error: 'Internal server error', details: (error as Error).message })
  }
}

