
import { getYahooHistoryPrice } from '../../lib/yahoo/getYahooHistoryPrice'
import { getYahooQuote } from '../../lib/yahoo/getYahooQuote'
import { getYahooAssetProfile } from '../../lib/yahoo/getYahooAssetProfile'
import moment from 'moment-business-days'
import { ma } from 'moving-averages'
import QuickChart from 'quickchart-js'
import { getFormattedFromToDate, millify } from '../../lib/commonFunction'
import { priceChartSettings, ma5ChartSettings, ma20ChartSettings, ma60ChartSettings } from '../../config/price'
import { priceMAList } from '../../config/email'

const handleDays = async (ticker, fromdate, todate) => {

  const outputItem = await getYahooHistoryPrice(ticker, fromdate, todate)

  return {
    date: (outputItem.timestamp || []).map(item => moment.unix(item).format('DD MMM YYYY')),
    price: outputItem.indicators.quote.find(x => x).close || []
  }
}

const handleQuote = async (ticker) => {
  const quote = await getYahooQuote(ticker)
  const assetProfile = await getYahooAssetProfile(ticker)

  return {
    Name: quote.longName,
    Price: quote.regularMarketPrice,
    MarketCap: millify(quote.marketCap),
    Industry: assetProfile.industry
  }
}

const getImgUrl = async (ticker, dateprice, ma5, ma20, ma60) => {
  const newChart = new QuickChart()

  newChart.setConfig(
    {
      type: 'line',
      data: {
        'labels': [...dateprice.date.reverse().slice(60)],
        'datasets': [{
          ...priceChartSettings,
          label: ticker,
          data: [...dateprice.price.slice(60)],
        }, {
          ...ma5ChartSettings,
          label: '5-MA',
          data: [...ma5.slice(60)]
        }, {
          ...ma20ChartSettings,
          label: '20-MA',
          data: [...ma20.slice(60)]
        }, {
          ...ma60ChartSettings,
          label: '60-MA',
          data: [...ma60.slice(60)]
        }]
      },
      options: {
        scales: {
          yAxes: [{
            ticks: {
              beginAtZero: false
            }
          }]
        }
      }
    })
    .setWidth(400)
    .setHeight(200)
    .setBackgroundColor('transparent')

  return newChart.getUrl()
}

const chkLower = (trackArr, refArr) => {
  return (trackArr[trackArr.length - 1] >= refArr[refArr.length - 1]
    && trackArr.find(x => x) < refArr.find(x => x))
    ? true
    : false
}

const chkHigher = (trackArr, refArr) => {
  return (trackArr[trackArr.length - 1] <= refArr[refArr.length - 1]
    && trackArr.find(x => x) > refArr.find(x => x))
    ? true
    : false
}

export default async (req, res) => {

  const { ticker, genChart } = req.query
  const isGenChart = genChart == 'true'

  const fromtodate = await getFormattedFromToDate(80)
  const dateprice = await handleDays(ticker, fromtodate.formattedFromDate, fromtodate.formattedToDate)

  const asOfDate = dateprice.date.reverse().find(x => x)
  const ma5 = ma([...dateprice.price], 5)
  const ma20 = ma([...dateprice.price], 20)
  const ma60 = ma([...dateprice.price], 60)
  const ma5filter = [...ma5].reverse().slice(0, 2)
  const ma20filter = [...ma20].reverse().slice(0, 2)
  const ma60filter = [...ma60].reverse().slice(0, 2)

  const newPriceMAList = !(ma5filter.length == 2 && ma20filter.length == 2 && ma60filter.length == 2)
    ? [...priceMAList]
    : await Promise.all([...priceMAList].map(async item => {
      const matches = item.id === '5<20' ? chkLower(ma5filter, ma20filter)
        : item.id === '5>20' ? chkHigher(ma5filter, ma20filter)
          : item.id === '5<60' ? chkLower(ma5filter, ma60filter)
            : item.id === '5>60' ? chkHigher(ma5filter, ma60filter)
              : item.id === '20<60' ? chkLower(ma20filter, ma60filter)
                : item.id === '20>60' ? chkHigher(ma20filter, ma60filter)
                  : false

      const newItem = { ...item, tickerInfo: [], tickersChart: [] }
      if (matches) {
        const quote = await handleQuote(ticker)
        const tickerInfo = {
          'Symbol': ticker.toUpperCase(),
          ...quote
        }

        newItem.tickersInfo = [tickerInfo]

        if (isGenChart) {
          const imgUrl = await getImgUrl(ticker, dateprice, ma5, ma20, ma60)
          newItem.tickersChart = [imgUrl]
        }
      }
      return newItem
    }))

  res.statusCode = 200
  res.json({
    asOfDate,
    priceMAList: [...newPriceMAList]
  })
}
