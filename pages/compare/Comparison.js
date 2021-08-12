import { Fragment } from 'react'

import CustomContainer from '@/components/Layout/CustomContainer'
import TickerBullet from '@/components/Page/TickerBullet'
import TickerInput from '@/components/Page/TickerInput'
import { ComparisonSettings } from '@/config/compare'
import { useParams } from '@/lib/hooks/form'
import { useRouter } from 'next/router'

const Comparison = ({ type, params }) => {
  const curType = ComparisonSettings[type]

  const curTypComponentProps =
    (curType && {
      ...curType.componentProps,
      ...{
        inputTickers: params?.tickers?.split(','),
        inputYear: params?.year || 15
      }
    }) ||
    {}

  return (
    <Fragment>
      <CustomContainer style={{ minHeight: '100vh' }}>
        <Fragment>
          <TickerSession type={type} params={params} curType={curType} />
          {curType && <curType.component {...curTypComponentProps} />}
        </Fragment>
      </CustomContainer>
    </Fragment>
  )
}

export default Comparison

export const TickerSession = ({ type, params, curType }) => {
  const router = useRouter()

  const [formValue, setFormValue] = useParams(params)

  const handleTickers = list => {
    const newParams = Object.assign(
      { ...params },
      { tickers: list.join(','), type }
    )
    router.push({
      query: newParams
    })
  }

  const handleChange = e => {
    const form = {
      ...formValue,
      [e.target.name]: e.target.value
    }
    setFormValue(form)
  }

  const handleSubmit = e => {
    e.preventDefault()
    const newParams = Object.assign({ ...params }, { ...formValue, type })
    router.push({
      query: newParams
    })
  }

  const clearItems = () => {
    router.push(`/compare/${type}`)
  }

  const removeItem = value => {
    const filtered = formValue?.tickers
      ?.split(',')
      .filter(x => x !== value)
      .join(',')

    const newParams = Object.assign({ ...params }, { tickers: filtered, type })
    router.push({
      query: newParams
    })
  }

  const tickerInputSettings = {
    placeholderText: 'Single:  aapl /  Multiple:  aapl,tdoc,fb,gh',
    yearControl: false,
    showBullets: true,
    ...(curType?.tickerInputSettings || {})
  }

  return (
    <Fragment>
      <TickerInput
        handleSubmit={handleSubmit}
        placeholderText={tickerInputSettings.placeholderText}
        handleChange={handleChange}
        clearItems={clearItems}
        formValue={formValue}
        yearControl={tickerInputSettings.yearControl}
        handleTickers={tickerInputSettings.allowFromList && handleTickers}
      />
      {tickerInputSettings.showBullets && (
        <TickerBullet tickers={params?.tickers} removeItem={removeItem} />
      )}
    </Fragment>
  )
}
