import type { NextApiRequest, NextApiResponse } from 'next'
import { getClient } from '../../../../lib/postgres'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { slug } = req.query
  if (!slug || typeof slug !== 'string') return res.status(400).json({ error: 'Invalid slug' })

  try {
    const client = await getClient()
    try {
      const d = await client.query('SELECT * FROM ai_dashboards WHERE shared_slug = $1', [slug])
      if (d.rows.length === 0) return res.status(404).json({ error: 'Not found' })
      const dash = d.rows[0]
      const c = await client.query('SELECT * FROM ai_dashboard_cards WHERE dashboard_id = $1 ORDER BY order_index, id', [dash.id])
      return res.status(200).json({ dashboard: dash, cards: c.rows })
    } finally {
      client.release()
    }
  } catch (error) {
    console.error('Share fetch error:', error)
    return res.status(500).json({ error: 'Internal server error', details: (error as Error).message })
  }
}

