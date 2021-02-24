
import { Fragment, useState, useEffect } from 'react'

import LoadingSpinner from './Loading/LoadingSpinner'
import StockInfoTable from '../components/Page/StockInfoTable'
import { stockDetailsSettings, officersTableHeader } from '../config/stock'
import { convertSameUnit } from '../lib/commonFunction'

import Tabs from 'react-bootstrap/Tabs'
import Tab from 'react-bootstrap/Tab'

import PriceChange from '../components/PriceChange'
import ForecastInfo from '../components/ForecastInfo'
import FinancialsInfo from '../components/FinancialsInfo'
import { Badge, Row } from 'react-bootstrap'
import { Bar } from 'react-chartjs-2';

import percent from 'percent'
import PriceTab from './Page/PriceTab'

const axios = require('axios').default

function StockDetails({ inputTicker }) {

    const [settings, setSettings] = useState({ ...stockDetailsSettings })
    const [clicked, setClicked] = useState(false)

    async function handleTicker() {
        if (!inputTicker) return

        setClicked(true)

        let ticker = inputTicker.toUpperCase()

        let basics
        let officers = []
        let basicItem = []
        let balanceSheetItem = []
        let balanceSheetHeader = []
        let balanceSheetChartData = { labels: [], datasets: [] }
        let etfItem = []
        let etfItemHeader = []
        let etfList = []
        let etfCount = 0
        let floatingShareRatio = 'N/A'

        setSettings({ ...settings, inputTickers: [ticker] })

        axios.all([
            axios
                .get(`/api/getYahooAssetProfile?ticker=${ticker}`)
                .then((response) => {
                    const basicsData = response.data.basics
                    const balanceSheetData = response.data.balanceSheet

                    Object.keys(basicsData).forEach(item => {
                        if (item !== 'Company Officers') {
                            basicItem.push([item, basicsData[item]])
                        } else {
                            officers = basicsData['Company Officers'].map(item => {
                                const itemArr = [
                                    item.name,
                                    item.title,
                                    item.age || 'N/A',
                                    (item.totalPay || { 'longFmt': 'N/A' }).longFmt
                                ]
                                return itemArr
                            })
                        }
                    })

                    Object.keys((balanceSheetData.find(x => x) || {})).forEach(item => {
                        if (item !== 'Date') {
                            const curItem = []
                            balanceSheetData.forEach(data => {
                                curItem.push(data[item])
                            })

                            balanceSheetItem.push([item, ...curItem])
                        }
                    })

                    Object.keys((balanceSheetData.find(x => x) || {}))
                        .filter(x => x == 'Total Assets' || x == 'Total Liability' || x == "Total Stock Holder Equity")
                        .forEach(item => {
                            const r = Math.floor(Math.random() * 255) + 1
                            const g = Math.floor(Math.random() * 255) + 1
                            const b = Math.floor(Math.random() * 255) + 1

                            balanceSheetChartData.datasets.push(item == "Total Stock Holder Equity" ?
                                {
                                    type: 'line',
                                    label: item,
                                    borderColor: `rgba(${r}, ${g}, ${b})`,
                                    borderWidth: 2,
                                    fill: false,
                                    data: convertSameUnit([...balanceSheetData.map(data => data[item])]).map(data => data.replace(/K|M|B|T/, ''))
                                } : {
                                    type: 'bar',
                                    label: item,
                                    backgroundColor: `rgba(${r}, ${g}, ${b})`,
                                    data: convertSameUnit([...balanceSheetData.map(data => data[item])]).map(data => data.replace(/K|M|B|T/, ''))
                                })
                        })

                    balanceSheetChartData.labels.reverse()
                    balanceSheetChartData.datasets.reverse()

                    balanceSheetHeader.push('')
                    balanceSheetData.forEach(item => {
                        balanceSheetHeader.push(item['Date'])
                        balanceSheetChartData.labels.push(item['Date'])
                    })

                    basics = {
                        basics: {
                            tableHeader: [],
                            tableData: [...basicItem]
                        },
                        officers: {
                            tableHeader: [...officersTableHeader],
                            tableData: [...officers]
                        },
                        balanceSheet: {
                            tableHeader: [...balanceSheetHeader],
                            tableData: [...balanceSheetItem],
                            chartData: { ...balanceSheetChartData }
                        }
                    }

                    setSettings({
                        ...settings,
                        ...basics,
                        ...etfList,
                        etfCount,
                        floatingShareRatio,
                        inputTickers: [ticker]
                    })
                }),
            axios
                .get(`/api/getETFListByTicker?ticker=${ticker}`)
                .then((response) => {
                    if (response.data) {
                        etfItemHeader = Object.keys(response.data.find(x => x) || {})

                        etfItem.push(...response.data.map(data => {
                            const newArr = []
                            etfItemHeader.forEach(item => {
                                newArr.push(data[item])
                            })
                            return newArr
                        }))

                        etfList = {
                            etfList: {
                                tableHeader: [...etfItemHeader],
                                tableData: [...etfItem]
                            }
                        }

                        setSettings({
                            ...settings,
                            ...basics,
                            ...etfList,
                            etfCount,
                            floatingShareRatio,
                            inputTickers: [ticker]
                        })
                    }

                }),
            axios
                .get(`/api/getStockETFCount?ticker=${ticker}`)
                .then((response) => {

                    etfCount = response.data

                    setSettings({
                        ...settings,
                        ...basics,
                        ...etfList,
                        etfCount,
                        floatingShareRatio,
                        inputTickers: [ticker]
                    })

                }),
            axios
                .get(`/api/getYahooKeyStatistics?ticker=${ticker}`)
                .then((response) => {

                    const keyRatio = response.data
                    if (keyRatio && keyRatio.floatShares) {
                        floatingShareRatio = percent.calc(keyRatio.floatShares.raw, keyRatio.sharesOutstanding.raw, 2, true)
                    }

                    setSettings({
                        ...settings,
                        ...basics,
                        ...etfList,
                        etfCount,
                        floatingShareRatio,
                        inputTickers: [ticker]
                    })

                })
        ])
            .then((_) => {
                setClicked(false)
            })

    }

    useEffect(() => {
        inputTicker != '' ? handleTicker() : clearItems()
    }, [inputTicker])

    const sortItem = async (index) => {
        // setSettings({
        //     ...settings,
        //     stockInfo: await sortTableItem(settings.stockInfo, index, settings.ascSort),
        //     ascSort: !settings.ascSort
        // })
    }

    const clearItems = async () => {
        setSettings({ ...stockDetailsSettings })
    }

    return (
        <Fragment>
            <Tabs style={{ fontSize: '11px' }} className="mt-4" defaultActiveKey="Price" id="uncontrolled-tab-example">
                <Tab eventKey="Price" title="Price">
                    {clicked ?
                        <LoadingSpinner /> : ''
                    }
                    <PriceTab inputSettings={settings} />
                </Tab>
                <Tab eventKey="ETFList" title="ETF List">
                    {clicked ?
                        <LoadingSpinner /> : ''
                    }
                    <Row className="ml-1 mt-3">
                        <h5>
                            <Badge variant="dark">{'No. of ETF Count: '}</Badge>
                        </h5>
                        <h5>
                            <Badge variant="light" className="ml-2">{settings.etfCount}</Badge>
                        </h5>
                    </Row>
                    <StockInfoTable tableHeader={settings.etfList.tableHeader} tableData={settings.etfList.tableData} sortItem={sortItem} />
                </Tab>
                <Tab eventKey="Price%" title="Price%">
                    {clicked ?
                        <LoadingSpinner /> : ''
                    }
                    <PriceChange inputTickers={settings.inputTickers} />
                </Tab>
                <Tab eventKey="BalanceSheet" title="Balance Sheet">
                    {clicked ?
                        <LoadingSpinner /> : ''
                    }
                    <StockInfoTable tableHeader={settings.balanceSheet.tableHeader} tableData={settings.balanceSheet.tableData} sortItem={sortItem} />
                    <Bar data={settings.balanceSheet.chartData} />
                </Tab>
                <Tab eventKey="Forecast" title="Forecast">
                    {clicked ?
                        <LoadingSpinner /> : ''
                    }
                    <ForecastInfo inputTickers={settings.inputTickers} />
                </Tab>
                <Tab eventKey="Financials" title="Financials">
                    {clicked ?
                        <LoadingSpinner /> : ''
                    }
                    <FinancialsInfo inputTickers={settings.inputTickers} />
                </Tab>
            </Tabs>
        </Fragment>
    )
}

export default StockDetails
