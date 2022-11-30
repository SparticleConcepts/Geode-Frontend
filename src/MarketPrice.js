import React, { useEffect, useState } from 'react'
import { Table, Button, Label, Icon, Modal, Card, Grid, List, Statistic } from 'semantic-ui-react'

import { useSubstrateState } from './substrate-lib'

// href for Stripe to buy coin - enable on MainNet ONLY!  --- href="https://buy.stripe.com/28o3cUdjL1NLfkY14c">Buy</Button>          


function Main(props) {
  const { api } = useSubstrateState()

  const currentCoinPrice = '$1.00';
  const lowTrend = '$0.99';
  const highTrend = '$1.01';
  const weeklyChange = '0.00 %';
  const weeklyTrend = ' ▲ ';
  const coinName = "GROPO";
  const infoIcon ='Current Coin market value in USD.\n '
  const infoBuyGeode = '💰 Coming Soon! 💰 '

  const { finalized } = props
  const [blockNumber, setBlockNumber] = useState(0)
  const [blockNumberTimer, setBlockNumberTimer] = useState(0);

  const priceTrend = ['Lowest Price in 7-Days', 'Average Price for 7-Days', 'Highest Price in 7-Days']
  const bestNumber = finalized
    ? api.derive.chain.bestNumberFinalized
    : api.derive.chain.bestNumber
  
  useEffect(() => {
    let unsubscribeAll = null

    bestNumber(number => {
      // Append `.toLocaleString('en-US')` to display a nice thousand-separated digit.
      setBlockNumber(number.toNumber().toLocaleString('en-US'))
      setBlockNumberTimer(0)
    })
      .then(unsub => {
        unsubscribeAll = unsub
      })
      .catch(console.error)

    return () => unsubscribeAll && unsubscribeAll()
  }, [bestNumber])

  const timer = () => {
    setBlockNumberTimer(time => time + 1)
  }

  useEffect(() => {
    const id = setInterval(timer, 1000)
    return () => clearInterval(id)
  }, [])

function TokenInformation() {
  // integrate react-vis here
  return (
    <div>
      <Table>
        <Table.Row>
        Token Graphic in Version 2.0
        {infoBuyGeode} <br></br>
        </Table.Row>
      </Table>
    {infoIcon} <br></br>
    </div>
  )
}

function TradeCoin() {
  return(
    <div>
      <Table>
        <Table.Row>
          <Table.Cell >
          <List.Item> <Icon name="toggle on" /> Weekly change: <strong>{weeklyTrend} {weeklyChange}</strong></List.Item>
          <List.Item> <Icon name="toggle on" /> Lowest: <strong>{lowTrend} </strong></List.Item>
          <List.Item> <Icon name="toggle on" /> Highest: <strong>{highTrend} </strong></List.Item>
          <List textAlign="center">
          </List>
           <Button 
              size='tiny' 
              color='teal' 
              circular active
              href="https://blockandpurpose.com/">Buy</Button>
           <br></br>
		      </Table.Cell>
        </Table.Row>
      </Table>
  </div>
  )
}
  return (
    <Grid.Column>
      <Card color='teal'>
        <Card.Content>
        <Card.Meta>
            <Modal trigger={<Icon link name="info circle" />}>
                    <Modal.Header>Information - Current price of {coinName}</Modal.Header>
                    <Modal.Content scrolling wrapped="true">
                    <Modal.Description>
                    <TokenInformation />
                    </Modal.Description>
                    </Modal.Content>
                </Modal>
                <span> Current Price of {coinName} </span><Icon color='teal' name='money bill alternate' />

          </Card.Meta>
          <Card.Header> 
          <Statistic size='tiny'>
                <Statistic.Label></Statistic.Label>
                <Statistic.Value>{currentCoinPrice}</Statistic.Value>
          </Statistic>        
          </Card.Header>
            per {coinName}
          <Card.Description> 
          <TradeCoin />
             </Card.Description>
        </Card.Content>
        <Label basic >{priceTrend[0]}</Label>
        <Card.Content extra>
        <List>
            <List.Item><Icon name="clone" /> Best Block: {blockNumber} </List.Item>
            <List.Item><Icon name="clock outline" /> Block Time: {blockNumberTimer} sec</List.Item>
            </List>
        </Card.Content>
      </Card>
    </Grid.Column>
  )
}

export default function BlockNumber(props) {
    const { api } = useSubstrateState()
    return api.derive &&
      api.derive.chain &&
      api.derive.chain.bestNumber &&
      api.derive.chain.bestNumberFinalized ? (
      <Main {...props} /> 
    ) : null
  }