import React, { useEffect, useState } from 'react'
import { Button, Label, Icon, Modal, Card, Grid, List, Statistic } from 'semantic-ui-react'

import { useSubstrateState } from './substrate-lib'


function Main(props) {
  const { api } = useSubstrateState()
//  const [marketInfo, setMarketInfo] = useState({})

  const currentCoinPrice = '$1.00';
  const weeklyChange = '3.00 %';
  const weeklyTrend = ' ▲ ';
  const coinRef = 'per geode'
  const infoIcon ='Current Coin market value in USD.\n '
  const infoBuyGeode = '💰 Coming Soon! 💰 '

  const { finalized } = props
  const [blockNumber, setBlockNumber] = useState(0)
  const [blockNumberTimer, setBlockNumberTimer] = useState(0)

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


  return (
    <Grid.Column>
      <Card color='teal'>
        <Card.Content>
        <Card.Meta>
            <span> Current Price of Geode </span>
            <Modal trigger={<Icon link name="info circle" />}>
                    <Modal.Header>Information - Current price of Geode</Modal.Header>
                    <Modal.Content scrolling wrapped>
                    <Modal.Description>
                    <pre>
                           <code>                             
                           {infoIcon} <br></br>
                            </code>
                    </pre>
                    </Modal.Description>
                    </Modal.Content>
                </Modal>

          </Card.Meta>
          <Card.Header> 
          <Statistic size='tiny'>
                <Statistic.Label></Statistic.Label>
                <Statistic.Value>{currentCoinPrice}</Statistic.Value>
                </Statistic>        
               </Card.Header>
            {coinRef}
          <Card.Description> 
          <List.Item><strong> Weekly change: {weeklyTrend} {weeklyChange}</strong></List.Item>
          <List textAlign="center">
        </List>
             </Card.Description>
             

             <Modal trigger={<Button size='tiny' color='teal' circular='true' active>Buy Geode</Button>}>
                    <Modal.Header>Buy Geode!</Modal.Header>
                    <Modal.Content scrolling wrapped>
                    <Modal.Description>
                    <pre>
                           <code>                             
                           {infoBuyGeode} <br></br>
                            </code>
                    </pre>
                    </Modal.Description>
                    </Modal.Content>
                </Modal>



        </Card.Content>
        <Label Basic ><weak>{priceTrend[0]}</weak></Label>
        <Card.Content extra>
        <List>
            
            <List.Item>🌀 Best Block: {blockNumber} </List.Item>
            <List.Item>⏱ Block Time: {blockNumberTimer}</List.Item>
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