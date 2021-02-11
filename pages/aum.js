
import { Fragment, useState } from 'react'
import Container from 'react-bootstrap/Container'

import StockInfoTable from '../components/StockInfoTable'
import TickerInput from '../components/TickerInput'
import TickerBullet from '../components/TickerBullet'
import { sortTableItem } from '../lib/commonFunction'
import LoadingSpinner from '../components/Loading/LoadingSpinner'
import CustomContainer from '../components/CustomContainer'
const axios = require('axios').default

export default function Home() {

  const [tickers, setTickers] = useState([])
  const [tableHeader, setTableHeader] = useState([])
  const [etfInfo, setEtfInfo] = useState([])


  const [validated, setValidated] = useState(false)
  const [formValue, setFormValue] = useState({})
  const [clicked, setClicked] = useState(false)
  const [ascSort, setAscSort] = useState(false)


  const handleChange = (e) => {
    setFormValue({
      ...formValue,
      [e.target.name]: e.target.value
    })
  }


  const sortItem = async (index) => {
    setAscSort(!ascSort)
    setEtfInfo(
      await sortTableItem(etfInfo, index, ascSort)
    )
  }

  const clearItems = async () => {
    setTickers(
      []
    )
    setEtfInfo(
      []
    )
  }

  const removeItem = async (value) => {
    if (clicked) return

    setTickers(
      [...tickers.filter(x => x !== value)]
    )
    setEtfInfo(
      [
        ...etfInfo.filter(x => x.find(x => x) !== value)
      ]
    )
  }

  async function handleTickers(inputTickers) {

    let newTickers = inputTickers.filter(x => !tickers.includes(x.toUpperCase()))

    let outputItem
    let temp = []
    let etfCount
    //let forecast
    let quote

    for (const ticker of newTickers) {
      outputItem = await axios(`/api/getETFAUMSum?ticker=${ticker}`)
      etfCount = await axios(`/api/getStockETFCount?ticker=${ticker}`)
      //forecast = await axios(`/api/getStockFairValue?ticker=${ticker}`)
      quote = await axios(`/api/getYahooQuote?ticker=${ticker}`)

      let etf = {}
      etf['ticker'] = ticker.toUpperCase()
      etf['info'] = [...outputItem.data, quote.data.regularMarketPrice, quote.data.marketCap, etfCount.data]
      temp.push(
        etf
      )

    }

    setTickers([
      ...tickers,
      ...temp.map(item => item.ticker)
    ])

    setTableHeader(
      [
        'Ticker',
        ...Array.from({ length: 15 }, (x, i) => `ETF ${i + 1}`),
        'AUM Sum',
        'Price',
        'Market Cap.',
        'No. of ETF'
      ]
    )

    setEtfInfo(
      [
        ...etfInfo,
        ...temp.map(item => {
          const newItem = [
            item.ticker,
            ...item.info
          ]
          return newItem
        })
      ]
    )

  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    const form = event.currentTarget

    setClicked(true)

    if (form.checkValidity() === false) {
      event.stopPropagation()
    } else {

      const { formTicker } = formValue

      const inputTickers = formTicker.split(',')

      await handleTickers(inputTickers)

    }
    setValidated(true)
    setClicked(false)
  }

  return (
    <Fragment>
      <CustomContainer style={{ minHeight: '100vh' }}>
        <Fragment>
          <TickerInput
            validated={validated}
            handleSubmit={handleSubmit}
            placeholderText={"Single:  aapl /  Mulitple:  tsm,gh"}
            handleChange={handleChange}
            clicked={clicked}
            clearItems={clearItems}
            tableHeader={tableHeader}
            tableData={etfInfo}
            exportFileName={'Stock_aum_sum.csv'}
          />
          <TickerBullet tickers={tickers} overlayItem={[]} removeItem={removeItem} />
          {clicked ?
            <LoadingSpinner /> : ''
          }
          <StockInfoTable tableHeader={tableHeader} tableData={etfInfo} sortItem={sortItem} />
        </Fragment>
      </CustomContainer>
    </Fragment >
  )
}
