
import { Fragment, useState, useEffect } from 'react'

import { getPriceInfo, sortTableItem, priceSettingSchema } from '../../lib/commonFunction'
import StockInfoTable from '../Page/StockInfoTable'
import { Line } from 'react-chartjs-2'
import LoadingSpinner from '../Loading/LoadingSpinner'

function PriceChange({ inputSettings, inputTickers, inputYear }) {

  const [settings, setSettings] = useState(inputTickers ? priceSettingSchema : inputSettings)
  const [loading, setLoading] = useState(false)

  async function handleTickers() {
    setLoading(true)

    const noOfYears = inputYear ? inputYear : 15

    if (inputSettings) {      
      setSettings(inputSettings)
    } else if (inputTickers) {
      clearItems()
      const priceInfo = await getPriceInfo(inputTickers, noOfYears, priceSettingSchema)
      setSettings(priceInfo)
    } else if (inputTickers.length <= 0) {
      clearItems()
    }

    setLoading(false)
  }

  const sortItem = async (index) => {
    setSettings({
      ...settings,
      yearlyPcnt: await sortTableItem(settings.yearlyPcnt, index, settings.ascSort),
      ascSort: !settings.ascSort
    })
  }

  useEffect(() => {
    const abortController = new AbortController()
    handleTickers()
    return () => abortController.abort() 
  }, [inputSettings, inputTickers])

  const clearItems = () => {
    setSettings({
      ...settings,
      tickers: [],
      yearlyPcnt: [],
      quote: [],
      chartData: {}
    })
  }

  return (
    <Fragment>
      {loading ?
        <LoadingSpinner /> : null
      }            
      <StockInfoTable tableSize="sm" tableHeader={settings.tableHeader} tableData={settings.yearlyPcnt} sortItem={sortItem} />
      <Line data={settings.chartData} />
    </Fragment>
  )
}

export default PriceChange
