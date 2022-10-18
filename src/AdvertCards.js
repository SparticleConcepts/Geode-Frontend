import React, { useEffect, useState } from 'react'
import { Grid, Segment, Label, Button, Modal, Table, Icon, Feed, Card, List } from 'semantic-ui-react'


import '@natscale/react-calendar/dist/main.css';

import { useSubstrateState } from './substrate-lib'

//import React, { useState, useCallback } from 'react';
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
        const [chain, nodeName, nodeVersion ] = await Promise.all([
          api.rpc.system.chain(),
          api.rpc.system.name(),
          api.rpc.system.version(),
        ])
        setStatData({ chain, nodeName, nodeVersion })
      } catch (e) {
        console.error(e)
      }
    }
    getInfo()
  }, [api.rpc.system])
  return (
    
    <Card.Group itemsPerRow={2}>
    <Card scroll>
        <Card.Content>
          <Card.Header>
          <Modal trigger={<Icon link name="info circle" />}>
                    <Modal.Header>Information - Schedule</Modal.Header>
                    <Modal.Content scrolling wrapped>
                    <Modal.Description>
                           <strong>Description: </strong>{infoSchedule} <br></br>
                           <br></br>
                    </Modal.Description>
                    </Modal.Content>
                    </Modal>        

          Schedule 
          </Card.Header>
          <Card.Meta>
            <span> {statData.nodeName}: {advertTitle1} {value}</span>
          </Card.Meta>
          <Card.Description> 
          
          <Table textAlign='center'>
            <Table.Row>
            <Table.Cell>
          <div>

          <Calendar onChange={setDate} value={date} />
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

      <Button size='mini' color='teal' floated='left' circular icon='step backward'
              onClick={setToFirst}></Button> 

      <Button size='mini' color='teal' floated='left' circular icon='angle left'
              onClick={decEventCount}></Button> 
      <Button size='mini' color='teal' floated='left' circular icon='angle right'
              onClick={incEventCount}></Button> 
      <Button size='mini' color='teal' floated='left' circular icon='step forward'
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
                    <Modal.Content scrolling wrapped>
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
          Geode News <a>from Amy M.</a> to your <a>Geode</a> News group.<br></br>
            <a>May 11th 2022, 10:00:00 pm</a> <br></br>
            Execute named scheduled task auctlp0<br></br>
            <a>May 13th 2022, 3:00:00 am</a><br></br>
            Election of new council candidates<br></br>
            <a>May 12th 2022, 9:00:00 pm</a><br></br>
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
          Geode News <a>from Amy M.</a> to your <a>Geode</a> News group.<br></br>
            <a>May 19th 2022, 3:00:00 am</a><br></br>
            Start of next spending period<br></br>
            <a>May 27th 2022, 3:00:00 am</a><br></br>
            Start of the next referendum voting period<br></br>
            <a>June 4th 2022, 3:00:00 am</a><br></br>
            Start of the next parachain lease period 8<br></br>
            <a>June 28th 2022, 10:00:00 pm</a><br></br>
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
          Geode News <a>from Amy M.</a> to your <a>Geode</a> News group.<br></br>
            <a>September 20th 2022, 10:00:00 pm</a><br></br>
            Execute named scheduled task auctlp10<br></br>
            <a>December 13th 2022, 9:00:00 pm</a><br></br>
            Execute named scheduled task auctlp11<br></br>
            <a>June 29th 2022, 8:00:00 pm</a><br></br>
            Deadline for onchain proposal #99<br></br>
            <a>August 29th 2022, 8:00:00 pm</a><br></br>
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