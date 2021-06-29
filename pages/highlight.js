import { Fragment, useState } from 'react'

import CustomContainer from '@/components/Layout/CustomContainer'
import 'styles/ScrollMenu.module.css'
import HighlightDetail from '@/components/Page/Highlight/HighlightDetail'
import HighlightPriceQuote from '@/components/Page/Highlight/HighlightPriceQuote'
import HighlightSearch from '@/components/Page/Highlight/HighlightSearch'
import HighlightSWRTable from '@/components/Page/Highlight/HighlightSWRTable'
import HighlightTickerAlert from '@/components/Page/Highlight/HighlightTickerAlert'
import TickerScrollMenuList from '@/components/Page/TickerScrollMenuList'
import UserPriceDayChange from '@/components/Parts/UserPriceDayChange'
import WatchListSuggestions from '@/components/Parts/WatchListSuggestions'
import {
  highlightHeaders,
  highlightDetails,
  highlightMenuTickerList
} from '@/config/highlight'
import { useUser, useUserData } from '@/lib/firebaseResult'

export default function Highlight() {
  const [watchList, setwatchList] = useState([])
  const [watchListName, setWatchListName] = useState(null)

  const user = useUser()
  const userData = useUserData(user)

  const onClickWatchListButton = (watchListButtonName, buttonWatchList) => {
    const isShow =
      watchListName !== watchListButtonName ? true : !(watchList.length > 0)
    isShow ? setwatchList(buttonWatchList) : setwatchList([])
    setWatchListName(watchListButtonName)
  }

  return (
    <Fragment>
      <CustomContainer style={{ minHeight: '100vh', fontSize: '14px' }}>
        <Fragment>
          {user ? (
            <UserPriceDayChange userID={user.uid} userData={userData} />
          ) : null}
          <TickerScrollMenuList tickerList={highlightMenuTickerList} />
          <HighlightSearch />
          <HighlightTickerAlert />
          <HighlightPriceQuote highlightHeaders={highlightHeaders} />
          <HighlightDetail highlightDetails={highlightDetails} />
          <WatchListSuggestions
            user={user}
            userData={userData}
            onClickWatchListButton={onClickWatchListButton}
          />
          <HighlightSWRTable watchList={watchList} />
        </Fragment>
      </CustomContainer>
    </Fragment>
  )
}
