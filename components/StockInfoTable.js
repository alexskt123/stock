
import { Fragment } from 'react'
import Table from 'react-bootstrap/Table'

const getCellColor = (cellValue) => {
  if ((cellValue || '').toString().replace(/\%/, '') < 0) return { color: 'red' }
  else return { color: 'black' }
}

const getCellItem = (item) => {
  if ((item || '').toString().match(/http:/gi))
    return <a href={item} target='_blank'>{item}</a>
  else return item
}

const checkCanClick = (item, cellClick) => {
  if (cellClick) {
    cellClick(item)
  }
}

const sticky = { backgroundColor: '#ddd', left: 0, position: 'sticky', zIndex: '997' }

function StockInfoTable({ tableFirstHeader, tableHeader, tableData, sortItem, cellClick }) {

  return (
    <Fragment>
      <Table className="pl-3 mt-3" responsive>
        <thead>
          <tr>
            {tableFirstHeader ?
              tableFirstHeader.map((item, index) => (
                <th style={(index == 0 ? sticky : {})} key={index} >{item}</th>
              ))
              : ''}
          </tr>
          <tr>
            {tableHeader.map((item, index) => (
              <th style={(index == 0 ? sticky : {})} onClick={() => { sortItem(index) }} key={index} >{item}</th>
            ))
            }

          </tr>
        </thead>
        <tbody>

          {tableData.map((item, index) => (
            <tr key={index}>
              {item.map((xx, yy) => <td onClick={() => { checkCanClick(item, cellClick) }} style={(yy == 0 ? sticky : {})} key={`${index}${yy}`}><span style={getCellColor(xx)}>{getCellItem(xx)}</span></td>)}
            </tr>
          ))}

        </tbody>
      </Table>
    </Fragment>
  )
}

export default StockInfoTable
