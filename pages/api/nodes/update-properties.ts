import type { NextApiRequest, NextApiResponse } from 'next'
import { getDatasetIdByName, updateNodeProperties } from '../../../lib/postgres'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { datasetName, nodeUpdates } = req.body

    if (!datasetName || !nodeUpdates || !Array.isArray(nodeUpdates)) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    const datasetId = await getDatasetIdByName(datasetName)
    if (!datasetId) {
      return res.status(404).json({ error: 'Dataset not found' })
    }

    // Update each node's properties
    for (const update of nodeUpdates) {
      await updateNodeProperties(datasetId, update.uid, {
        [update.property]: update.value
      })
    }

    res.status(200).json({ success: true })
  } catch (error) {
    console.error('Update node properties error:', error)
    res.status(500).json({ error: 'Failed to update node properties' })
  }
}
