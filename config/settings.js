
const Settings = {
  Copyright: '© 2021 StockIsFun Limited',
  LogoImgSrc: '/favicon.ico'
}

export default Settings

export const NavDropDown = [
  {
    href: '/price',
    label: 'Price%',
    category: 'All'
  },
  {
    href: '/forecast',
    label: 'Forecast',
    category: 'All'
  },
  {
    href: '/etf',
    label: 'ETF',
    category: 'ETF'
  },
  {
    href: '/aum',
    label: 'AUM',
    category: 'Stock'
  },
  {
    href: '/financials',
    label: 'Financials',
    category: 'Stock'
  }
]


export const NavItems = [

  {
    href: '/etfdetail',
    label: 'ETF'
  },
  {
    href: '/basics',
    label: 'Stock'
  },
  {
    href: '/watchlist',
    label: 'Watch List'
  }
]

export const defaultUserConfig = {
  id: '',
  uid: '',
  displayName: 'Guest',
  loginTime: '',
  stockList: [],
  watchList: [],
  etfList: []
}
