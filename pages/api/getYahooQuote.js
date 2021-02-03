//GET https://zh.wikipedia.org/

// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import { getYahooQuote } from '../../lib/getYahooQuote'


const axios = require('axios').default


export default async (req, res) => {
  const { ticker } = req.query

  const data = await getYahooQuote(ticker)
  
  res.statusCode = 200
  res.json(data)
}
