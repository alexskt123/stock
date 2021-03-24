
import { useState, useEffect, Fragment } from 'react'
import Card from 'react-bootstrap/Card'
import { RiCloseCircleFill } from 'react-icons/ri'
import { IconContext } from 'react-icons'

export default function QuoteCard({ children, header, inputTicker, isShow }) {
  const [showCard, setShowCard] = useState(true)

  useEffect(() => {
    setShowCard(isShow)
  }, [inputTicker, isShow])

  if (!showCard) return null

  return (
    <Fragment>
      <Card
        text={'dark'}
        border={'light'}
        style={{ ['minWidth']: '10rem' }}
      >
        <Card.Header style={{ padding: '0.2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <b>
              <span>
                {header}
              </span>
              <IconContext.Provider value={{ color: 'red', className: 'global-class-name' }}><RiCloseCircleFill onClick={() => setShowCard(false)} /></IconContext.Provider>
            </b>
          </div>
        </Card.Header>
        <Card.Body style={{ padding: '0.2rem' }}>
          {children}
        </Card.Body>
      </Card>

    </Fragment>
  )
}