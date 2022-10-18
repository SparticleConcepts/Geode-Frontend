import React, { useEffect, useState } from 'react'
import { Label, Statistic, Grid, Card, Icon, List, Modal } from 'semantic-ui-react'

import { useSubstrateState } from './substrate-lib'

import { CircularProgressbar } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

function Main(props) {
  const { api } = useSubstrateState()
  const { finalized } = props
  const [blockNumber, setBlockNumber] = useState(0)
  const [blockNumberTimer, setBlockNumberTimer] = useState(0)

  const infoIcon = 'Funds held in the treasury can be spent by making a spending proposal that, \nif approved by the Council, will enter a spend period before distribution, \nit is subject to governance, with the current default set to 24 days.'

  const totalSpendPeriod = 24
  const currentSpendPeriod = 4
  const unitsOfTime = 'days'
  const percentPeriodElapsed = Math.round(100 * (currentSpendPeriod / totalSpendPeriod)) ;
  const timeRemaining = totalSpendPeriod - currentSpendPeriod

  const weekday = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
  const month = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  
  const d = new Date(Date.now() + 1000 * 60 * 60 * 24 * timeRemaining);
  let day = weekday[d.getDay()] + ', ' + d.getDate() + ' ' + month[d.getMonth()];
  //let day = Date.now() //new Date(Date.now())// + 1000 * 60 * 60 * 24 * 10);

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
        <Card.Content textAlign="left">
        <Card.Meta>
            <span> Spend Period Elapsed </span>
            <Modal trigger={<Icon link name="info circle" />}>
                    <Modal.Header>Information - Spend Period Elapsed</Modal.Header>
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
                <Statistic.Value>{currentSpendPeriod} {unitsOfTime} </Statistic.Value>
                </Statistic>        
               </Card.Header>
               {timeRemaining} {unitsOfTime} remaining
            
            <Card.Description>         
            <strong> % Period Elapsed</strong>
                    <div style={{ width: 50, height: 50 }}>
                        <CircularProgressbar value={percentPeriodElapsed} text= {`${percentPeriodElapsed}%`} strokeWidth={12}/>
                    </div>

             </Card.Description>
             
        </Card.Content>
        <Label Basic ><weak>⏱ Period Ends: {day} </weak></Label>
        <Card.Content extra>
            <List>
            <List.Item>🔆 Finalized Block: {blockNumber}</List.Item>
            <List.Item><Icon name="time" /> Timer: {blockNumberTimer} sec</List.Item>
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
