import React, { useEffect, useState } from 'react'
import { Table, Label, Statistic, Grid, Card, Icon, List, Modal } from 'semantic-ui-react'
import { useSubstrateState } from './substrate-lib'
import { CircularProgressbar } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

function Main(props) {
  const { api } = useSubstrateState()
  const { finalized } = props
  const blockTime = 6 // number of seconds per block
  const [blockNumber, setBlockNumber] = useState(0)
  const [blockNumberTimer, setBlockNumberTimer] = useState(0)
  const unitsOfTime = 'day(s)'
  const [daysRemaining, setDaysRemaining] = useState(0);
  
  const weekday = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
  const month = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  
  const d = new Date(Date.now() + 1000 * 60 * 60 * 24 * daysRemaining);
  let day = weekday[d.getDay()] + ', ' + d.getDate() + ' ' + month[d.getMonth()];

  const bestNumber = finalized
    ? api.derive.chain.bestNumberFinalized
    : api.derive.chain.bestNumber

  useEffect(() => {
    let unsubscribeAll = null

    bestNumber(number => {
      // Append `.toLocaleString('en-US')` to display a nice thousand-separated digit.
      setBlockNumber(number.toNumber()) //.toLocaleString('en-US'))
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


  function SpendPeriodModal() {
    const txErrorMessage = "Data not available"
    const infoIcon = 'Funds held in the treasury can be spent by making a spending proposal that, \nif approved by the Council, will enter a spend period before distribution, \nit is subject to governance, with the current default set to '  
    try {
    const spendPeriod = api.consts.treasury.spendPeriod.toString();  
    const spendPeriodinDays = spendPeriod/14400;
    return (
      <div>
        <strong>About Spend Period:</strong><br></br>
        {infoIcon} {spendPeriodinDays} {'day(s).'}<br></br><br></br>
        <strong>Spend Period Details:</strong><br></br>
        🔹 Block production time is {blockTime} seconds. <br></br>
        🔹 The spend period is 1 Era and consists of {spendPeriod} blocks. <br></br>
        🔹 An Epoch is 100 blocks or {blockTime * 10/6} minutes. <br></br>
        🔹 An Era is {spendPeriod} blocks or {spendPeriodinDays} {'day(s)'}. <br></br>
        <br></br>
        <strong>Card Information:</strong><br></br>
        This card shows the following information: <br></br>
        ℹ️ Spend Period Elapsed - Number of Days that had elapsed in the spend period. Could be in fractions.

      </div>
    )
  } catch(e) {
    console.error(e)
    return (
      <div>{txErrorMessage}</div>
    )
  }
  }


  function PercentOfPeriod() {
  const txErrorMessage ="Data Unavailable";
  try {
  const spendPeriod = api.consts.treasury.spendPeriod.toString();  
  const totalSpendBlocks = 1 * spendPeriod;
  let blockFraction = Math.trunc(100 - (100 * (totalSpendBlocks - (blockNumber % totalSpendBlocks))/totalSpendBlocks));
  const blocksLeftInSpendPeriod = totalSpendBlocks - (blockNumber % totalSpendBlocks);
  const minRemaining = blocksLeftInSpendPeriod/10;
  setDaysRemaining((minRemaining/1440).toString().substring(0,5));
  
  return(
        <div>
          <Table>
            <Table.Row>
              <Table.Cell >
                    🔹 Block Remain: <strong>{blocksLeftInSpendPeriod} of {totalSpendBlocks}</strong><br></br>
                    🔹 Time Remain: <strong> {minRemaining} min</strong><br></br>
                    🔹 % Period Elapsed
                    <div style={{ width: 50, height: 50 }}>
                        <CircularProgressbar value={blockFraction} text= {`${blockFraction}%`} strokeWidth={12}/>
                    </div>
              </Table.Cell>
            </Table.Row>
          </Table>
      </div>
      )
    } catch(e) {
      console.error(e)
      return (
        <div>{txErrorMessage}</div>
      )
    }
    }
    

  return (
    <Grid.Column>
      <Card color='teal'>
        <Card.Content textAlign="left">
        <Card.Meta>
            <Modal trigger={<Icon link name="info circle" />}>
                    <Modal.Header>Information</Modal.Header>
                    <Modal.Content scrolling wrapped="true">
                    <Modal.Description>
                    <SpendPeriodModal />
                    </Modal.Description>
                    </Modal.Content>
                </Modal>
                <span> Spend Period Elapsed </span>
          </Card.Meta>
          <Card.Header> 
          <Statistic size='tiny'>
                <Statistic.Label></Statistic.Label>
                <Statistic.Value>{(1 - daysRemaining).toString().substring(0,5)} {unitsOfTime} </Statistic.Value>
                </Statistic>        
               </Card.Header>
               {daysRemaining} {unitsOfTime} remaining
            <Card.Description>   
            <PercentOfPeriod />      
             </Card.Description>
        </Card.Content>
        <Label basic >⏱ Period Ends: {day} </Label>
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
