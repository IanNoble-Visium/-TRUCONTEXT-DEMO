import type { NextApiRequest, NextApiResponse } from 'next'
import { initializeDatabase, saveAIDashboard, listAIDashboards } from '../../../lib/postgres'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    await initializeDatabase()

    if (req.method === 'GET') {
      const dashboards = await listAIDashboards()
      return res.status(200).json({ dashboards })
    }

    if (req.method === 'POST') {
      const { name, prompt, cards, datasetId, metadata } = req.body as any
      if (!name || !prompt || !Array.isArray(cards) || cards.length === 0) {
        return res.status(400).json({ error: 'Missing required fields' })
      }
      const dashboard = await saveAIDashboard(name, prompt, cards, datasetId ?? null, metadata ?? {})
      return res.status(201).json({ dashboard })
    }

    res.setHeader('Allow', ['GET', 'POST'])
    return res.status(405).json({ error: 'Method not allowed' })
  } catch (error) {
    console.error('AI dashboards index error:', error)
    return res.status(500).json({ error: 'Internal server error', details: (error as Error).message })
  }
}

