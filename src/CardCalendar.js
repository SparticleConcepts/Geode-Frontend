import React, { useCallback, useEffect, useState, useRef } from 'react'
import { Grid, Segment, Label, Button, Modal, Table, Icon, Feed, Card, List } from 'semantic-ui-react'
import '@natscale/react-calendar/dist/main.css';
import { useSubstrateState } from './substrate-lib'
import { Calendar } from '@natscale/react-calendar';

function Main(props) {
  const { api } = useSubstrateState()
  const [statData, setStatData] = useState({})
  const infoSchedule = 'Schedule'
  let tokenName = 'coin'
  const blockTime = 6; // number of seconds per block
  const epochTime = 10; // number of minutes per epoch
  const eraBlocks = epochTime * 60; // number if blocks per era
  const secToHrs = 3600; // seconds to hours conversion
  const secToDays = 86400;
  const noOfEvents = 4;

  const blkTermDuration = useRef('0');
  const blkLaunchPeriod = useRef('0');
  const blkSpendPeriod = useRef('0');
  const blkEnactmentPeriod = useRef('0');

  let theDate = '0'
  let eraStart = '0';
  let eraIndex = '0';
  let blkNumber = '0';
  let timeStampNow = '0';
  let nextSpendDate = '0';

  const [eventCount, setEventCount] = useState(1)
  const [value, setValue] = useState();
  const [date, setDate] = useState(new Date());

  const onChange = useState(
    (value) => {
      setValue(value);
    },
    [setValue],
  );

  const isHighlight = useCallback((date) => {
    // if (date.getDate() % 7 === 0 ) {
    //     return true;
    //  } 
    }, []);

  try {
    const newEraJSON = JSON.parse(statData.activeEra);
    timeStampNow = (statData.timeStamp).toString();
    theDate = new Intl.DateTimeFormat('en-US', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' }).format(timeStampNow)      

    eraStart = String(newEraJSON.start);
    eraIndex = String(newEraJSON.index);
    tokenName = String(statData.chain);

    blkTermDuration.current = (api.consts.elections.termDuration).toString();
    blkLaunchPeriod.current = (api.consts.democracy.launchPeriod).toString();
    blkEnactmentPeriod.current = (api.consts.democracy.enactmentPeriod).toString();
    blkSpendPeriod.current = (api.consts.treasury.spendPeriod).toString(); //* added as useRef()
    
    blkNumber = (statData.blockNumber).toString();
    
    const timeStpNextSpend = 1 * timeStampNow - (1000 * blockTime * blkNumber) + blockTime * 1000 * blkSpendPeriod.current * ( 1 + (Math.floor(blkNumber / blkSpendPeriod.current)));
    nextSpendDate = new Intl.DateTimeFormat('en-US', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }).format(timeStpNextSpend.toString())

  } catch(e) {
    console.error(e)
  }

  function ScheduleModal() {
    const noOfElections = Math.floor(blkNumber/blkTermDuration.current);
    const noOfDaysElections = (blockTime * blkTermDuration.current / secToDays); // in days
    const noOfOpDays = (blockTime * blkNumber / secToDays); // in days
    const chainStartDate = String(new Date((Date.now() - 1000 * secToDays * noOfOpDays)));
    const timeStampChainStart = 1 * timeStampNow - 1000 * blockTime * blkNumber
    const blkThisEraStart = eraBlocks * eraIndex //1 * blkNumber - (blkNumber % blkSpendPeriod);
    const blkAtNextEra = eraBlocks * (1 * eraIndex + 1) //(1 * blkThisEraStart + 1 * blkSpendPeriod).toString();
    
    const timeStampNextEra = (1 * eraStart + 1000 * blockTime * (eraBlocks)).toString();
    const thisEraDate = new Intl.DateTimeFormat('en-US', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' }).format(eraStart)
    const nextEraDate = new Intl.DateTimeFormat('en-US', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' }).format(timeStampNextEra)

    const blksRemainSpendPeriod = (1 * blkSpendPeriod.current - (blkNumber % blkSpendPeriod.current));
    const nextElectionDays = noOfDaysElections - (blockTime * (blkNumber % blkTermDuration.current) / secToDays).toString().substring(0,7);

    const blkThisElection = 1 * blkNumber - blkNumber % blkTermDuration.current;
    const thisElectionTimeStamp = timeStampChainStart + 6 * 1000 * blkThisElection;
    const thisElectionStart = new Intl.DateTimeFormat('en-US', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }).format(thisElectionTimeStamp.toString());

    const timeStpNextSpend = 1 * timeStampNow - (1000 * blockTime * blkNumber) + blockTime * 1000 * blkSpendPeriod.current * ( 1 + (Math.floor(blkNumber / blkSpendPeriod.current)));

    // referendum calculations:
    // ---> Key input to the Referendum calculation is blkLaunchPeriod.current
    const blkReferendum = blkLaunchPeriod.current * Math.floor(blkNumber/blkLaunchPeriod.current);
    const timeStampRefStart = timeStampChainStart + blockTime * 1000 * blkReferendum;
    const thisReferendumStart = new Intl.DateTimeFormat('en-US', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }).format(timeStampRefStart.toString()); 
    const blkNextReferendum = 1 * blkReferendum + 1 * blkLaunchPeriod.current;
    const timeStampRefNext = timeStampChainStart + blockTime * 1000 * blkNextReferendum
    const nextReferendumStart = new Intl.DateTimeFormat('en-US', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }).format(timeStampRefNext.toString()); 
    const blkRefImplementation = 1 * blkReferendum + 1 * blkEnactmentPeriod.current
    const timeStampRefImpl = timeStampChainStart + blockTime * 1000 * blkRefImplementation
    const thisRefImplementation = new Intl.DateTimeFormat('en-US', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }).format(timeStampRefImpl.toString()); 

    const blkNextElection = ((1 * blkNumber - blkNumber % blkTermDuration.current + 1 * blkTermDuration.current));
    const nextElectionTimeStamp =  (1 * timeStampNow - 1000 * blockTime * blkNumber + 6 * 1000 * blkNextElection).toString();
    const nextElectionFormat = new Intl.DateTimeFormat('en-US', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }).format(nextElectionTimeStamp);


    return(
      <>
      • Time Stamp Now: <strong>{timeStampNow}</strong><br></br>
      • Current Block Number: <strong>#{blkNumber} </strong><br></br>
      • Days Chain in Operation: <strong>{(noOfOpDays).toString().substring(0,7)}</strong> Days <br></br>
      • Chain Start Date: <strong>{chainStartDate}</strong><br></br>
      • Chain Start Time Stamp: <strong>{timeStampChainStart.toString()}</strong><br></br>     
      <br></br>
      <strong>Treasury Spend Period:</strong><br></br>
      • Spend Period: <strong>#{blkSpendPeriod.current} </strong>blocks <br></br>
      • Duration of Treasury Spend Period: <strong>{blockTime * blkSpendPeriod.current / secToHrs} Hrs</strong><br></br>
      • Time Remianing in this Treasury Spend Period: <strong>{(1 * blockTime * blksRemainSpendPeriod / secToHrs).toString().substring(0,7)}</strong> Hrs<br></br>
      • Number Of Spend Periods Completed: <strong>{(Math.floor(blkNumber / blkSpendPeriod.current)).toString()}</strong><br></br>
      • Next Spend Period Date and Time: <strong>{nextSpendDate}</strong><br></br>
      • Next Spend Period Time Stamp: <strong>{timeStpNextSpend}</strong><br></br>
      • Blocks left in Current Spend Period: <strong> #{blksRemainSpendPeriod.toString()}</strong> of <strong>#{blkSpendPeriod.current}</strong><br></br>
      <br></br>
      <strong>Eras Details:</strong><br></br>
      • Number of Blocks in an Era: <strong>#{eraBlocks.toString()}</strong><br></br>
      • Duration of an Era: <strong>{(blockTime * eraBlocks / 60).toString()}</strong> Min <br></br>     
      <br></br>
      <strong>The Current Era:</strong><br></br>
      • Current Era: <strong>{eraIndex}</strong><br></br>
      • Current Era Time Stamp: <strong>{eraStart}</strong><br></br>
      • Current Era Start Date and Time: <strong>{thisEraDate}</strong> <br></br>
      • At Block Number: <strong>#{blkThisEraStart.toString()}</strong><br></br>
      <br></br>
      <strong>The Next Era:</strong><br></br>
      • Next Era: <strong>{1 * eraIndex + 1}</strong><br></br>
      • Next Era Time Stamp: <strong>{timeStampNextEra}</strong><br></br> 
      • Next Era Start Date and Time: <strong>{nextEraDate}</strong><br></br>
      • Next Era Block Number: <strong>#{blkAtNextEra}</strong> <br></br>   

      <br></br>
      <strong>Council Elections: </strong> <br></br>
      • Elections Term Duration (How long each seat is kept): <strong>#{blkTermDuration.current} </strong> blocks or 
         <strong>{noOfDaysElections}</strong> Days <br></br>
      • Number of Election Cycles Completed: <strong>{noOfElections}</strong><br></br>
      • Current Term Started on: <strong> {thisElectionStart.toString()}</strong><br></br>
      • At Block Number: <strong>#{blkThisElection.toString()}</strong><br></br>
      • Next Election starts at Block: <strong>#{blkNextElection}</strong> <br></br>
      • Next Election on: <strong>{nextElectionFormat}</strong><br></br>
      • Next Election Time Stamp: <strong>{nextElectionTimeStamp}</strong><br></br>
      • Next Election in Days: <strong>{nextElectionDays}</strong> Days<br></br>
      <br></br>
      <strong>Referendum Voting</strong><br></br>
      • Current Referendum Started on: <strong>{thisReferendumStart}</strong><br></br>
      • At Block Number: <strong>{blkReferendum}</strong><br></br>
      • Referendum Launch Period: <strong>#{blkLaunchPeriod.current} </strong>blocks <br></br>
      • Referendum Enactment Period: <strong>#{blkEnactmentPeriod.current} </strong>blocks <br></br>
      • Next Referendum Starts on: <strong>{nextReferendumStart}</strong><br></br>
      • Next Referendum at Block: # <strong>{blkNextReferendum.toString()}</strong><br></br>
      <br></br>
      <strong>Referendum Enachment</strong> i.e when the Referendum is Implemented:<br></br>
      • Current Referendum Implementation Date: <strong>{thisRefImplementation}</strong><br></br>
      • Current Referendum Implementation Block: <strong>{blkRefImplementation}</strong><br></br>
      • <strong>{':(>)'}</strong><br></br>
      </>
    )
  }

function EventStartOfStaking() {
// Event feed for start of new staking era
const timeStampNextEra = (1 * eraStart + 1000 * blockTime * (eraBlocks)).toString();
const nextEraDate = new Intl.DateTimeFormat('en-US', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }).format(timeStampNextEra)
const blkAtNextEra = eraBlocks * (1 * eraIndex + 1) //(1 * blkThisEraStart + 1 * blkSpendPeriod).toString();
const noOfHrsEra = (blockTime * eraBlocks / secToHrs);
const nextEraHrs = noOfHrsEra - (blockTime * (blkNumber % eraBlocks) / secToHrs);
  return(    
    <Feed >
    <Feed.Event>
    <Feed.Label>
      <Icon name='clock'/>
    </Feed.Label>
      <Feed.Content>
        <Feed.Summary>
          {nextEraDate}
          <Feed.User>Start of a new Staking Era</Feed.User> 
    <Feed.Date>Next Era: {1 * eraIndex + 1} @ #{blkAtNextEra}</Feed.Date>
  </Feed.Summary>
  <Feed.Meta>
    <Feed.Like>
      <Icon name="clock outline" /> Next Era in {(nextEraHrs).toString().substring(0,5)} Hours
    </Feed.Like>
  </Feed.Meta>
</Feed.Content>
</Feed.Event>
</Feed>
  )
} 

  function EventStartOfElection() {
    const blkNextElection = ((1 * blkNumber - blkNumber % blkTermDuration.current + 1 * blkTermDuration.current));
    const nextElectionTimeStamp =  (1 * timeStampNow - 1000 * blockTime * blkNumber + 6 * 1000 * blkNextElection).toString();
    const nextElectionFormat = new Intl.DateTimeFormat('en-US', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }).format(nextElectionTimeStamp);
    const noOfDaysElections = (blockTime * blkTermDuration.current / secToDays); // in days
    const nextElectionDays = noOfDaysElections - (blockTime * (blkNumber % blkTermDuration.current) / secToDays).toString().substring(0,7);
    // Event feed for start of new Election
        return(
          <Feed>
          <Feed.Event>
              <Feed.Label>
                <Icon name='clock'/>
              </Feed.Label>
                <Feed.Content>
                  <Feed.Summary>
                  {nextElectionFormat}
                    <Feed.User>Election of new council</Feed.User> 
              <Feed.Date>@ Block: #{blkNextElection}</Feed.Date>
            </Feed.Summary>
            <Feed.Meta>
              <Feed.Like>
              <Icon name="clock outline" /> Next Election in {(nextElectionDays).toString().substring(0,5)} Days
              </Feed.Like>
            </Feed.Meta>
          </Feed.Content>
        </Feed.Event>
        </Feed>
            )
      } 

      function EventStartOfSpendPeriod() {
        // Event feed for start of new Spend Period
         const blkAtNextSpend = blkSpendPeriod.current * ( 1 + (Math.floor(blkNumber / blkSpendPeriod.current)))
         const noOfHrsSpend = (blockTime * blkSpendPeriod.current / secToHrs);
         const nextSpendHrs = noOfHrsSpend - (blockTime * (blkNumber % blkSpendPeriod.current) / secToHrs);
         return(
            <Feed>
            <Feed.Event>
                <Feed.Label>
                  <Icon name='clock'/>
                </Feed.Label>
                  <Feed.Content>
                    <Feed.Summary>
                    {nextSpendDate}
                      <Feed.User>Start of Spend Period</Feed.User> 
                <Feed.Date>@ Block: #{blkAtNextSpend}</Feed.Date>
              </Feed.Summary>
              <Feed.Meta>
                <Feed.Like>
                <Icon name="clock outline" /> Next Period in {(nextSpendHrs).toString().substring(0,5)} Hours
                </Feed.Like>
              </Feed.Meta>
            </Feed.Content>
          </Feed.Event>
          </Feed>
              )
      } 
    
      function EventStartOfReferendum() {
        const blkReferendum = blkLaunchPeriod.current * Math.floor(blkNumber/blkLaunchPeriod.current);
        const timeStampChainStart = 1 * timeStampNow - 1000 * blockTime * blkNumber
        const blkNextReferendum = 1 * blkReferendum + 1 * blkLaunchPeriod.current;
        const timeStampRefNext = timeStampChainStart + blockTime * 1000 * blkNextReferendum
        const nextReferendumStart = new Intl.DateTimeFormat('en-US', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }).format(timeStampRefNext.toString()); 
        const noOfDaysRef = (blockTime * blkLaunchPeriod.current / secToDays );
        const nextRefDays = noOfDaysRef - (blockTime * (blkNumber % blkLaunchPeriod.current) / secToDays );
          return(
              <Feed>
              <Feed.Event>
                  <Feed.Label>
                    <Icon name='clock'/>
                  </Feed.Label>
                    <Feed.Content>
                      <Feed.Summary>
                      {nextReferendumStart}
                        <Feed.User>Start of New Referendum</Feed.User> 
                  <Feed.Date>@ Block: #{blkNextReferendum}</Feed.Date>
                </Feed.Summary>
                <Feed.Meta>
                  <Feed.Like>
                  <Icon name="clock outline" /> Next Referendum in {(nextRefDays).toString().substring(0,5)} Days
                  </Feed.Like>
                </Feed.Meta>
              </Feed.Content>
            </Feed.Event>
            </Feed>
                )
          } 

          function EventStartOfImplementation() {
            const blkReferendum = blkLaunchPeriod.current * Math.floor(blkNumber/blkLaunchPeriod.current);
            const timeStampChainStart = 1 * timeStampNow - 1000 * blockTime * blkNumber
            const blkRefImplementation = 1 * blkReferendum + 1 * blkEnactmentPeriod.current
            const timeStampRefImpl = timeStampChainStart + blockTime * 1000 * blkRefImplementation
            const thisRefImplementation = new Intl.DateTimeFormat('en-US', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }).format(timeStampRefImpl.toString()); 
            const noOfDaysImpl = (blockTime * blkRefImplementation / secToDays );
            const nextImplementationDays = noOfDaysImpl - (blockTime * (blkNumber % blkRefImplementation) / secToDays );
            // Event feed for start of new Referendum Implementation
                return(
                  <Feed>
                  <Feed.Event>
                      <Feed.Label>
                        <Icon name='clock'/>
                      </Feed.Label>
                        <Feed.Content>
                          <Feed.Summary>
                          {thisRefImplementation}
                            <Feed.User>Referendum Enactment</Feed.User> 
                      <Feed.Date>@ Block: #{blkRefImplementation}</Feed.Date>
                    </Feed.Summary>
                    <Feed.Meta>
                      <Feed.Like>
                      <Icon name="clock outline" /> Next Referendum to be Inacted in {(nextImplementationDays).toString().substring(0,5)} Days
                      </Feed.Like>
                    </Feed.Meta>
                  </Feed.Content>
                </Feed.Event>
                </Feed>
                    )
              } 
    
  
  function ShowEvents() {
    if (eventCount === 1) {
      return (
        <>
        <EventStartOfStaking />
        <EventStartOfSpendPeriod />
        </>
      )
  
    } else if (eventCount === 2) {
      return (
        <>
        <EventStartOfElection />
        <EventStartOfReferendum />
        </>
      )
    } else if (eventCount === 3) {
      return (
        <>
        <EventStartOfImplementation />
        </>
      )
    } else {
      return (
        <>
          No more events to view.
        </>
      )
    }
  }

  function setToFirst() {
     setEventCount(1);
     return
   }

  function setToLast() {
    setEventCount(noOfEvents);
    return
  }

  function decEventCount() {
  const dec = eventCount
    if (dec > 1) {
      setEventCount(dec - 1);
    } else {
      setEventCount(dec);
    }
    return
  }

  function incEventCount() {
    const inc = eventCount;
    if (inc < noOfEvents + 1) {
      setEventCount(inc + 1);
    } else {
      setEventCount(inc);
    }
    return
  }
  
  const BlockandPurpose = () => {
    return (
        <div>				
          <a href={"https://blockandpurpose.com"}> 
          Block and Purpose Home Page </a>
        </div> 
    )
  };

  const GeodeWhitePaper = () => {
    return(
    <div>
      <a href={"https://blockandpurpose.com/wp-content/uploads/2022/10/Geode-Blockchain-Whitepaper-V2022_10_03.pdf"}>
      Geode White Paper
      </a></div>
    )
  }

  const DiscordConnection = () => {
    return(
      <div>
      <a href={"https://discord.com/invite/2v4DPxDQXt"}>
      Join Us on Discord
      </a></div>
    )
  }

  const SignUpForAnnouncements = () => {
    return(
      <div>
      <a href={"https://blockandpurpose.com/announcements/"}>
      Sign up for Announcements
      </a></div>
    )
  }
 
  const GoToGitHUb = () => {
    return(
      <div>
      <a href={"https://github.com/SparticleConcepts"}>
      Go to SparticleConcepts on GitHub
      </a></div>
    )
  }

  // FORMATS !
  //api.query.staking.activeEra
  //{"index":513,"start":1669847544002}
  //api.rpc.system.syncState
  //{"startingBlock":307383,"currentBlock":308068,"highestBlock":null}
  //api.query.staking.activeEra
  //{"index":537,"start":1669933944005}

  useEffect(() => {
     const getInfo = async () => {
      try {
        const [chain, syncState, timeStamp, activeEra, blockNumber ] = await Promise.all([
          api.rpc.system.chain(),
          api.rpc.system.syncState(),
          api.query.timestamp.now(),
          api.query.staking.activeEra(),
          api.query.system.number(),
        ])
        setStatData({ chain, syncState, timeStamp, activeEra, blockNumber })
      } catch (e) {
        console.error(e)
      }
    }
    getInfo()
  }, [api.rpc.system, api.query.timestamp, api.query.staking, api.query.system])
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
                           <ScheduleModal /><br></br>
                    </Modal.Description>
                    </Modal.Content>
                    </Modal>        

          Schedule <Icon name="clock" /> Today: {theDate} #{blkNumber}<br></br>
          </Card.Header>
          <Card.Meta>
            <span>{tokenName} Daily Event Schedule  <br></br></span>
            {value}
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
      
      <ShowEvents />

    <Table.Row>
    <Table.Cell > 
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
                    <Modal.Header>Information - {tokenName} News Feed</Modal.Header>
                    <Modal.Content scrolling wrapped="true">
                    <Modal.Description>
                           <strong>Description: </strong>{infoSchedule} <br></br>
                           <br></br>
                    </Modal.Description>
                    </Modal.Content>
                    </Modal>        
                    {tokenName} News Feed 
          </Card.Header>
          <Card.Meta>
            <span> Get the latest News and Important Links</span>
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
        <Feed.Date>Your Life And Work. On Chain. Immutable. Rewarded.</Feed.Date>
        <Feed.Summary> 
            <BlockandPurpose /> <br></br>
            </Feed.Summary>
      </Feed.Content>
    </Feed.Event>
  </Feed>
  <Feed>
  <Feed.Event>
      <Feed.Label icon='coffee' />
      <Feed.Content>
        <Feed.Date>Reshaping the way Intellectual Property and <br></br>
                   Human Productivity is measured, claimed, <br></br>
                   licensed and propagated. 
        </Feed.Date>
        <Feed.Summary>
            <GeodeWhitePaper /><br></br>
            </Feed.Summary>
      </Feed.Content>
    </Feed.Event>
  </Feed>
  <Feed>
  <Feed.Event>
      <Feed.Label icon='coffee' />
      <Feed.Content>
        <Feed.Date>Join the Geode community at Discord <br></br>
                   to get involved. <br></br>
        </Feed.Date>
        <Feed.Summary>
            <DiscordConnection /><br></br>
            </Feed.Summary>
      </Feed.Content>
    </Feed.Event>
  </Feed>
  <Feed>
  <Feed.Event>
      <Feed.Label icon='coffee' />
      <Feed.Content>
        <Feed.Date>Get announcements in your inbox the minute  <br></br>
                   they happen.  <br></br>
        </Feed.Date>
        <Feed.Summary>
            <SignUpForAnnouncements /><br></br>
            </Feed.Summary>
      </Feed.Content>
    </Feed.Event>
  </Feed>
  <Feed>
  <Feed.Event>
      <Feed.Label icon='coffee' />
      <Feed.Content>
        <Feed.Date>Our open Source code baseline on Github.  <br></br>
        </Feed.Date>
        <Feed.Summary>
            <GoToGitHUb /><br></br>
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

export default function StatData(props) {
  const { api } = useSubstrateState()
  return api.rpc &&
    api.rpc.system &&
    api.rpc.system.chain &&
    api.rpc.system.syncState &&
    api.query.timestamp.now &&
    api.query.staking.activeEra &&
    api.query.system.number ? (
    <Main {...props} />
  ) : null
}

