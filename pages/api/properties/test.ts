import { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  res.status(200).json({ 
    message: 'Properties API is working',
    method: req.method,
    timestamp: new Date().toISOString()
  })
}
