import React, { useCallback, useEffect, useState } from 'react'
import { Grid, Segment, Label, Button, Modal, Table, Icon, Feed, Card, List } from 'semantic-ui-react'
import '@natscale/react-calendar/dist/main.css';
import { useSubstrateState } from './substrate-lib'
import { Calendar } from '@natscale/react-calendar';

function Main(props) {
  const { api } = useSubstrateState()
  const [statData, setStatData] = useState({})
  const advertTitle1 = 'Geode Governance Schedule'
  const advertTitle2 = 'Geode News Feed'
  const infoSchedule = 'Geode Schedule'
  const [eventCount, setEventCount] = useState(1)

  const [value, setValue] = useState();
  //const calendarRef = 'test' //useRef<CalendarRef>();

  const [date, setDate] = useState(new Date());

  const onChange = useState(
    (value) => {
      setValue(value);
    },
    [setValue],
  );

  const isHighlight = useCallback((date) => {
    // highlight any data that is divisible by 5
    if (date.getDate() % 5 === 0) {
      return true;
    }
  }, []);

  //api.query.staking.activeEra
  //{"index":513,"start":1669847544002}
  //api.rpc.system.syncState
  //{"startingBlock":307383,"currentBlock":308068,"highestBlock":null}
  function ShowTimeStamp() {
    const errorMessage = 'Not Available';
    let currentTimestamp = Date.now()
    try {
      currentTimestamp = statData.timeStamp.toString()
//      console.log(currentTimestamp); // get current timestamp
      const theDate = new Intl.DateTimeFormat('en-US', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' }).format(currentTimestamp)
      return (
        <>
          <Icon name="clock" /> Today: {theDate} <br></br>
        </>
      )
      } catch(e) {
      console.error(e)
      return (
        <>
          {errorMessage}<br></br>
        </>
      )}
}  

  //end time stamp


  function setToFirst() {
    setEventCount(1)
  }

  function setToLast() {
    setEventCount(50)
  }

  function decEventCount() {
  const dec = eventCount - 1
    if (dec > 0) {
      setEventCount(dec)
    } else {
      setEventCount(eventCount)
    }
  }

  function incEventCount() {
    const inc = eventCount + 1;
    if (inc < 51) {
      setEventCount(inc)
    } else {
      setEventCount(eventCount)
    }
  }
  
  useEffect(() => {
     const getInfo = async () => {
      try {
        const [chain, syncState, timeStamp ] = await Promise.all([
          api.rpc.system.chain(),
          api.rpc.system.syncState(),
          api.query.timestamp.now(),
        ])
        setStatData({ chain, syncState, timeStamp })
      } catch (e) {
        console.error(e)
      }
    }
    getInfo()
  }, [api.rpc.system, api.query.timestamp])
  return (
    
    <Card.Group itemsPerRow={2}>
    <Card scroll="true">
        <Card.Content>
          <Card.Header>
          <Modal trigger={<Icon link name="info circle" />}>
                    <Modal.Header>Information - Schedule</Modal.Header>
                    <Modal.Content scrolling wrapped="true">
                    <Modal.Description>
                           <strong>Description: </strong>{infoSchedule} <br></br>
                           <br></br>
                    </Modal.Description>
                    </Modal.Content>
                    </Modal>        

          Schedule <ShowTimeStamp />
          </Card.Header>
          <Card.Meta>
            <span>  {advertTitle1} {value}</span>
          </Card.Meta>
          <Card.Description> 
          
          <Table textAlign='center'>
            <Table.Row>
            <Table.Cell>
          <div>
          
          <Calendar 
              startOfWeek={0} 
              isHighlight={isHighlight} 
              onChange={setDate} 
              value={date} />
            </div>
             </Table.Cell>

          <Table.Cell>     
          <p className='text-center'>
        <span className='bold'> <strong>Events:</strong></span>{' '}
        <Label color='orange'>{date.toDateString()}{onChange}</Label>
      </p>

          <Feed >
          <Feed.Event>
          <Feed.Label>
            <Icon name='clock'/>
          </Feed.Label>
            <Feed.Content>
              <Feed.Summary>
                Sep 17th 2022, 7:00 am 
                <Feed.User>Scheduled Geode Burn</Feed.User> Vote for Proposal
          <Feed.Date>1 Hour Ago</Feed.Date>
        </Feed.Summary>
        <Feed.Meta>
          <Feed.Like>
            <Icon name='thumbs up' />4 Ayes, <Icon name='thumbs down' />2 Nays
          </Feed.Like>
        </Feed.Meta>
      </Feed.Content>
    </Feed.Event>
    </Feed>

    <Feed>
      <Feed.Event>
          <Feed.Label>
            <Icon name='clock'/>
          </Feed.Label>
            <Feed.Content>
              <Feed.Summary>
              Sep 18th 2022, 3:00 am
                <Feed.User>Election of new council candidates</Feed.User> 
          <Feed.Date>1 Hour Ago</Feed.Date>
        </Feed.Summary>
        <Feed.Meta>
          <Feed.Like>
            <Icon name='thumbs up' />4 Ayes, <Icon name='thumbs down' /> 0 Nays
          </Feed.Like>
        </Feed.Meta>
      </Feed.Content>
    </Feed.Event>
    </Feed>

    <Table.Row>
    <Table.Cell > 
      <Label color='orange'>{eventCount}</Label>

      <Button size='mini' color='teal' floated='left' circular='true' icon='step backward'
              onClick={setToFirst}></Button> 

      <Button size='mini' color='teal' floated='left' circular='true' icon='angle left'
              onClick={decEventCount}></Button> 
      <Button size='mini' color='teal' floated='left' circular='true' icon='angle right'
              onClick={incEventCount}></Button> 
      <Button size='mini' color='teal' floated='left' circular='true' icon='step forward'
              onClick={setToLast}></Button> 
    </Table.Cell>
    </Table.Row>


    </Table.Cell>
    </Table.Row>
    </Table>

            <List>
            <List.Item><List.Header></List.Header></List.Item>
            </List>
             </Card.Description>
        </Card.Content>
        <Card.Content extra>
        </Card.Content>
      </Card>
      <Card>
        <Card.Content>
          <Card.Header>

          <Modal trigger={<Icon link name="info circle" />}>
                    <Modal.Header>Information - Geode News Feed</Modal.Header>
                    <Modal.Content scrolling wrapped="true">
                    <Modal.Description>
                           <strong>Description: </strong>{infoSchedule} <br></br>
                           <br></br>
                    </Modal.Description>
                    </Modal.Content>
                    </Modal>        

          Geode News Feed 





          </Card.Header>
          <Card.Meta>
            <span> {statData.nodeName}: {advertTitle2}</span>
          </Card.Meta>
          <Card.Description> 

      <Grid>
        <Grid.Column width={17}>
          <Segment>
            <pre style={{ height: 350, overflowY: 'scroll' }}>

            <Feed>
    <Feed.Event>
      <Feed.Label icon='coffee' />
      <Feed.Content>
        <Feed.Date>3 days ago</Feed.Date>
        <Feed.Summary>
          Geode News 
            Voting ends on council motion 0x5db3…9cad<br></br>
            </Feed.Summary>
      </Feed.Content>
    </Feed.Event>
  </Feed>
  <Feed>
  <Feed.Event>
      <Feed.Label icon='coffee' />
      <Feed.Content>
        <Feed.Date>1 day ago</Feed.Date>
        <Feed.Summary>
          Geode News 
            Execute named scheduled task auctlp09<br></br>
            </Feed.Summary>
      </Feed.Content>
    </Feed.Event>
  </Feed>
  <Feed>
  <Feed.Event>
      <Feed.Label icon='coffee' />
      <Feed.Content>
        <Feed.Date>3 hours ago</Feed.Date>
        <Feed.Summary>
          Geode News 
            Deadline for onchain proposal #131<br></br>
            </Feed.Summary>
      </Feed.Content>
    </Feed.Event>
  </Feed>


            </pre>
          </Segment>
        </Grid.Column>
      </Grid>



             </Card.Description>
        </Card.Content>
        <Card.Content extra>
        </Card.Content>
      </Card>
    </Card.Group>
  )
}

//export function Basic() {
//  const [value, setValue] = useState(new Date());

//  const onChange = useCallback(
//    (val) => {
//      setValue(val);
//    },
//    [setValue],
//  );

//  return <Calendar value={value} onChange={onChange} />;
//}

export default function StatData(props) {
  const { api } = useSubstrateState()
  return api.rpc &&
    api.rpc.system &&
    api.rpc.system.chain &&
    api.rpc.system.name &&
    api.rpc.system.version &&
    api.rpc.system.localPeerId &&
    api.rpc.chain.getBlockHash ? (
    <Main {...props} />
  ) : null
}