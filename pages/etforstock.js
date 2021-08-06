import { useEffect, Fragment } from 'react'

import PageLoading from '@/components/Loading/PageLoading'
import { useStaticSWR } from '@/lib/request'
import { useRouter } from 'next/router'
import Container from 'react-bootstrap/Container'

export default function ETFOrStock() {
  const router = useRouter()
  const { ticker } = router.query

  const { data } = useStaticSWR(
    ticker,
    `/api/yahoo/getQuoteType?ticker=${ticker}`
  )

  useEffect(() => {
    if (data?.result && ticker) {
      router.replace(`/stockinfo?ticker=${ticker}&type=detail`)
    }
  }, [data, router, ticker])

  return (
    <Fragment>
      <Container
        style={{ minHeight: '100vh' }}
        className="shadow-lg p-3 mb-5 rounded"
      >
        <PageLoading />
      </Container>
    </Fragment>
  )
}
