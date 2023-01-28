import React, { useEffect, useState, useRef } from 'react'
import { Input, Segment, Modal, Grid, Button, Label, Form } from 'semantic-ui-react'
//import { CopyToClipboard } from 'react-copy-to-clipboard'
import { useSubstrateState } from './substrate-lib'
import { TxButton } from './substrate-lib/components'
//import 'react-circular-progressbar/dist/styles.css';
import { stringToU8a } from '@polkadot/util';
import { encodeAddress } from '@polkadot/util-crypto';
// ---------------------------------------------
// CONSTANTS
// ---------------------------------------------
// alarmInterval: u32
// interface: api.consts.referenda.alarmInterval
// summary: Quantization level for the referendum wakeup scheduler. 
// A higher number will result in fewer storage reads/writes needed 
// for smaller voters, but also result in delays to the automatic 
// referendum status changes. Explicit servicing instructions are unaffected.
// ---------------------------------------------
// maxQueued: u32
// interface: api.consts.referenda.maxQueued
// summary: Maximum size of the referendum queue for a single track.
// ---------------------------------------------
// submissionDeposit: u128
// interface: api.consts.referenda.submissionDeposit
// summary: The minimum amount to be used as a deposit for a public 
// referendum proposal.
// ---------------------------------------------
// tracks: Vec<(u16,PalletReferendaTrackInfo)>
// interface: api.consts.referenda.tracks
// summary: Information concerning the different referendum tracks.
// ---------------------------------------------
// undecidingTimeout: u32
// interface: api.consts.referenda.undecidingTimeout
// summary: The number of blocks after submission that a referendum 
// must begin being decided by. Once this passes, then anyone may 
// cancel the referendum.
// ---------------------------------------------
// EVENTS
// ---------------------------------------------
// Approved(u32)
// interface: api.events.referenda.Approved.is
// summary: A referendum has been approved and its proposal has been scheduled.
// ---------------------------------------------
// Cancelled(u32, PalletConvictionVotingTally)
// interface: api.events.referenda.Cancelled.is
// summary: A referendum has been cancelled.
// ---------------------------------------------
// ConfirmAborted(u32)
// interface: api.events.referenda.ConfirmAborted.is
// ---------------------------------------------
// Confirmed(u32, PalletConvictionVotingTally)
// interface: api.events.referenda.Confirmed.is
// summary: A referendum has ended its confirmation phase and is ready for approval.
// ---------------------------------------------
// ConfirmStarted(u32)
// interface: api.events.referenda.ConfirmStarted.is
// ---------------------------------------------
// DecisionDepositPlaced(u32, AccountId32, u128)
// interface: api.events.referenda.DecisionDepositPlaced.is
// summary: The decision deposit has been placed.
// ---------------------------------------------
// DecisionDepositRefunded(u32, AccountId32, u128)
// interface: api.events.referenda.DecisionDepositRefunded.is
// summary: The decision deposit has been refunded.
// ---------------------------------------------
// DecisionStarted(u32, u16, FrameSupportPreimagesBounded, PalletConvictionVotingTally)
// interface: api.events.referenda.DecisionStarted.is
// summary: A referendum has moved into the deciding phase.
// ---------------------------------------------
// DepositSlashed(AccountId32, u128)
// interface: api.events.referenda.DepositSlashed.is
// summary: A deposit has been slashaed.
// ---------------------------------------------
// Killed(u32, PalletConvictionVotingTally)
// interface: api.events.referenda.Killed.is
// summary: A referendum has been killed.
// ---------------------------------------------
// Rejected(u32, PalletConvictionVotingTally)
// interface: api.events.referenda.Rejected.is
// summary: A proposal has been rejected by referendum.
// ---------------------------------------------
// SubmissionDepositRefunded(u32, AccountId32, u128)
// interface: api.events.referenda.SubmissionDepositRefunded.is
// summary: The submission deposit has been refunded.
// ---------------------------------------------
// Submitted(u32, u16, FrameSupportPreimagesBounded)
// interface: api.events.referenda.Submitted.is
// summary: A referendum has been submitted.
// ---------------------------------------------
// TimedOut(u32, PalletConvictionVotingTally)
// interface: api.events.referenda.TimedOut.is
// summary: A referendum has been timed out without being decided.
// ---------------------------------------------
// STORAGE
// ---------------------------------------------
// decidingCount(u16): u32
// interface: api.query.referenda.decidingCount
// summary: The number of referenda being decided currently.
// ---------------------------------------------
// referendumCount(): u32
// interface: api.query.referenda.referendumCount
// summary: The next free referendum index, aka the number of 
// referenda started so far.
// ---------------------------------------------
// referendumInfoFor(u32): Option<PalletReferendaReferendumInfoConvictionVotingTally>
// interface: api.query.referenda.referendumInfoFor
// summary: Information concerning any given referendum.
// ---------------------------------------------
// trackQueue(u16): Vec<(u32,u128)>
// interface: api.query.referenda.trackQueue
// summary: The sorted list of referenda ready to be decided but not yet 
// being decided, ordered by conviction-weighted approvals.
// This should be empty if DecidingCount is less than TrackInfo::max_deciding.
// ---------------------------------------------
// EXTRINSICS
// ---------------------------------------------
// cancel(index: u32)
// interface: api.tx.referenda.cancel
// summary: Cancel an ongoing referendum.
// origin: must be the CancelOrigin.
// index: The index of the referendum to be cancelled.
// Emits Cancelled.
// ---------------------------------------------
// kill(index: u32)
// interface: api.tx.referenda.kill
// summary: Cancel an ongoing referendum and slash the deposits.
// origin: must be the KillOrigin.
// index: The index of the referendum to be cancelled.
// Emits Killed and DepositSlashed.
// ---------------------------------------------
// nudgeReferendum(index: u32)
// interface: api.tx.referenda.nudgeReferendum
// summary: Advance a referendum onto its next logical state. Only 
// used internally.
// origin: must be Root.
// index: the referendum to be advanced.
// ---------------------------------------------
// oneFewerDeciding(track: u16)
// interface: api.tx.referenda.oneFewerDeciding
// summary: Advance a track onto its next logical state. Only used 
// internally.
// origin: must be Root.
// track: the track to be advanced.
// Action item for when there is now one fewer referendum in the deciding 
// phase and the DecidingCount is not yet updated. This means that we 
// should either:
// begin deciding another referendum (and leave DecidingCount alone); or
// decrement DecidingCount.
// ---------------------------------------------
// placeDecisionDeposit(index: u32)
// interface: api.tx.referenda.placeDecisionDeposit
// summary: Post the Decision Deposit for a referendum.
// origin: must be Signed and the account must have funds available for 
// the referendum's track's Decision Deposit.
// index: The index of the submitted referendum whose Decision Deposit is 
// yet to be posted.
// Emits DecisionDepositPlaced.
// ---------------------------------------------
// refundDecisionDeposit(index: u32)
// interface: api.tx.referenda.refundDecisionDeposit
// summary: Refund the Decision Deposit for a closed referendum back to 
// the depositor.
// origin: must be Signed or Root.
// index: The index of a closed referendum whose Decision Deposit has not 
// yet been refunded.
// Emits DecisionDepositRefunded.
// ---------------------------------------------
// refundSubmissionDeposit(index: u32)
// interface: api.tx.referenda.refundSubmissionDeposit
// summary: Refund the Submission Deposit for a closed referendum back 
// to the depositor.
// origin: must be Signed or Root.
// index: The index of a closed referendum whose Submission Deposit has not 
// yet been refunded.
// Emits SubmissionDepositRefunded.
// ---------------------------------------------
// submit(proposal_origin: KitchensinkRuntimeOriginCaller, proposal: FrameSupportPreimagesBounded, enactment_moment: FrameSupportScheduleDispatchTime)
// interface: api.tx.referenda.submit
// summary: Propose a referendum on a privileged action.
// origin: must be SubmitOrigin and the account must have SubmissionDeposit 
// funds available.
// proposal_origin: The origin from which the proposal should be executed.
// proposal: The proposal.
// enactment_moment: The moment that the proposal should be enacted.
// Emits Submitted.
// ---------------------------------------------
// ERRORS
// ---------------------------------------------
// BadReferendum
// interface: api.errors.referenda.BadReferendum.is
// summary: The referendum index provided is invalid in this context.
// ---------------------------------------------
// BadStatus
// interface: api.errors.referenda.BadStatus.is
// summary: The referendum status is invalid for this operation.
// ---------------------------------------------
// BadTrack
// interface: api.errors.referenda.BadTrack.is
// summary: The track identifier given was invalid.
// ---------------------------------------------
// Full
// interface: api.errors.referenda.Full.is
// summary: There are already a full complement of referenda in progress for this track.
// ---------------------------------------------
// HasDeposit
// interface: api.errors.referenda.HasDeposit.is
// summary: Referendum's decision deposit is already paid.
// ---------------------------------------------
// NoDeposit
// interface: api.errors.referenda.NoDeposit.is
// summary: The deposit cannot be refunded since none was made.
// ---------------------------------------------
// NoPermission
// interface: api.errors.referenda.NoPermission.is
// summary: The deposit refunder is not the depositor.
// ---------------------------------------------
// NothingToDo
// interface: api.errors.referenda.NothingToDo.is
// summary: There was nothing to do in the advancement.
// ---------------------------------------------
// NotOngoing
// interface: api.errors.referenda.NotOngoing.is
// summary: Referendum is not ongoing.
// ---------------------------------------------
// NoTrack
// interface: api.errors.referenda.NoTrack.is
// summary: No track exists for the proposal origin.
// ---------------------------------------------
// QueueEmpty
// interface: api.errors.referenda.QueueEmpty.is
// summary: The queue of the track is empty.
// ---------------------------------------------
// Unfinished
// interface: api.errors.referenda.Unfinished.is
// summary: Any deposit cannot be refunded until after the decision is over.
// ---------------------------------------------
// preimage hash: 0x9da64aae855c0ff69f7e6b1dab27be23ad2384111826b44cbf1b07d6095b3819

export default function Main(props) {
  const [status, setStatus] = useState(null)
  const [open, setOpen] = React.useState(false)
  console.log(open)
  const [propState, setPropState] = useState({ propValue: 0, beneficiary: ''})
  const onPropChange = (_, data) =>
    setPropState(prev => ({ ...prev, [data.state]: data.value }))
  const { propValue, beneficiary} = propState
  const proposalIndex = useRef(0);
  //const proposalHash = useRef('0x59fe7bd64951667f91f36db33077b1ada93b093b363a32cf869d2a833d72ce08');
  const [chainData, setChainData] = useState({});

  const { api } = useSubstrateState()

  //let daysElapsedToBurn = 9999;
  //let daysRemainToBurn = 9999;

  //let totalNextBurn = 9999;
  //let percentDaysRemaining = 0;

  const secToDays = 86400;
  const blockTime = 6;
  const blksToDays = blockTime / secToDays;
  const blksToHrs = blockTime / 3600;
  console.log(blksToDays);
  console.log(blksToHrs);
  const microToCoin = 1000000000000;
  let tokenName = 'coin';
  const treasuryAddress = encodeAddress(stringToU8a("modlpy/trsry".padEnd(32, '\0')))
  //const percentBurn = 0.5;

// * INFO - BlockTime returns formated time for a block input 
function BlockTime(blocks) {
  const Days = Math.floor(blksToHrs * blocks /24);
  const Remainder = (blksToHrs * blocks) % 24;
  const Hours = Math.floor(Remainder);
  const Minutes = Math.floor(60 * (Remainder - Hours));
  return(
    {"Days": Days,
     "Hours": Hours,
     "Minutes": Minutes
    })
}

function ReferendaItem() {
// referenda constants - remove the ones not needed for voting on a referenda
try{
    // referenda chain consts:
    const alarmInterval = api.consts.referenda.alarmInterval.toString();
    const maxQueued = api.consts.referenda.maxQueued.toString();
    const submissionDeposit = api.consts.referenda.submissionDeposit.toString();
    const tracks = JSON.stringify(api.consts.referenda.tracks);
    const undecidingTimeout = api.consts.referenda.undecidingTimeout.toString();
    const timeoutTime = BlockTime(undecidingTimeout);

    return(
        <div>
        <Segment>
            <strong>Referenda Consts:</strong><br />
            Alarm Interval {'(u32)'}: <strong>{alarmInterval}</strong> - Quantization level for the referendum wakeup scheduler.<br />
            Max Queued {'(u32)'}: <strong>{maxQueued}</strong> - Maximum size of the referendum queue for a single track.<br />
            Submission Deposit {'(u128)'}: <strong>{submissionDeposit/microToCoin} {tokenName}</strong> - The minimum amount to be used as a deposit for a public referendum proposal.<br />
            Tracks {'(Vec)'}: <strong>{tracks}</strong> {'Vec<(u16,PalletReferendaTrackInfo)>'}<br />
            Undeciding Timeout: {'(u32)'}: <strong>{undecidingTimeout} Blocks or {timeoutTime.Days} Days </strong> - The number of blocks after submission that a referendum must begin being decided by.<br />
        </Segment>
        </div>
    )
} catch(e) {
  console.error(e)
}
    return(
        <div>
        <Segment>
            <strong>Referenda:</strong><br />
            <strong>No Data Available </strong>
        </Segment>
        </div>
    )
}

function ProposalItem() {
  try{
    //const noOfProposals = (chainData.proposalCount).toString()
    const hexToDec = hex =>parseInt(hex, 16);
    const proposalJSON = JSON.parse(chainData.proposals);
    //const proposalH256 = (chainData.proposalList[proposalIndex.current]).toString();
    //proposalHash.current = proposalH256;

    //const councilJSON = JSON.parse(chainData.councilVotes);
    //const thresholdVotes = (councilJSON.threshold).toString();
    //const endVote = (councilJSON.end).toString();
    //const ayeVotes = (councilJSON.ayes.length).toString();
    //const nayVotes = (councilJSON.nays.length).toString();
    const txStatus = ['Proposed', 'Council Motion', 'Rejected', 'Approved'];
    const txColor =  ['blue', 'orange', 'red', 'teal'];
    //let statusIndex = 0;
    //let txDay = '';
    //let paidDay = '';
    //const voteEndBlk = Math.abs(blkNumber - endVote);
    //const voteDate = BlockTime(voteEndBlk);
    //const voteEndDate = voteDate.Days + ' Day(s) ' + voteDate.Hours + ' Hrs ' + voteDate.Minutes + ' Min '

    //const fundsAvailable = BlockTime(1 * endVote + 1 * spendPeriod - blkNumber);
    const approvedArray = chainData.approvals.map(x => x * 1);
    const isApproved = approvedArray.find(index => index === proposalIndex.current); //proposalIndex.current)//(chainData.approvals.find(chkApproved)).toString()
    const txApproved = isApproved > -1 ? 'approved' : 'open'; 
    const statusIndex = txApproved === 'approved' ? 3 : 1;   

    //const blkTime = BlockTime(blkNumber);
    
    // if (blkNumber - endVote > 0) {
    //     txDay = ' passed end of voting.';
    //     statusIndex = txApproved === 'approved' ? 3 : 1; 
    // } else {
    //     txDay = ' remaining in voting period.';
    //     statusIndex = 0;
    // }
    // if ((blkNumber - endVote - spendPeriod) < 0) {
    //   paidDay = ' in ' + fundsAvailable.Days + ' Days ' + fundsAvailable.Hours + ' Hrs ' + fundsAvailable.Minutes + ' Mins ';
    // } else {
    //   paidDay = txApproved === 'approved' ? ' Paid ' : 'Unpaid' ;
    // }
    return(
      <div>
        <Segment>
        <strong>Tips: </strong>
        <Label circular color={txColor[statusIndex]}>{txStatus[statusIndex]}</Label>       
        {' | '}
        <strong> Title:</strong><Label circular color='gray'>Tip No. {proposalIndex.current}</Label> 
        {' | '}
        <strong> Amount: <Label circular >{hexToDec(proposalJSON.value)/microToCoin} {tokenName}</Label> </strong>
        {' | '}
        <strong> Bond Amount: <Label circular >{hexToDec(proposalJSON.bond)/microToCoin} {tokenName}</Label> </strong>
        <br />
        <strong>Proposer:</strong> <Label circular >{proposalJSON.proposer} </Label>                  
            <Label as='a' color='gray' image>
            <img alt='' src='https://react.semantic-ui.com/images/avatar/small/veronika.jpg' />
            Vega
            </Label><br />
        <strong>Beneficiary:</strong> <Label circular> {proposalJSON.beneficiary}</Label>
            <Label as='a' image>
            <img alt='' src='https://react.semantic-ui.com/images/avatar/small/stevie.jpg' />
            Foundation
            </Label>
        </Segment>
      </div>
    )
  } catch(e) {
    console.error(e)
    return(
      <div> 
      <Segment>
      This Tip has not been assigned or is closed.
      </Segment>
      </div>
    )
  }
} 
// decidingCount(u16): u32 -> interface: api.query.referenda.decidingCount
// summary: The number of referenda being decided currently.
// referendumCount(): u32 -> interface: api.query.referenda.referendumCount
// summary: The next free referendum index, aka the number of referenda started so far.
// referendumInfoFor(u32) Option<PalletReferendaReferendumInfoConvictionVotingTally>
// -> interface: api.query.referenda.referendumInfoFor
// summary: Information concerning any given referendum.
// trackQueue(u16): Vec<(u32,u128)> -> interface: api.query.referenda.trackQueue
// summary: The sorted list of referenda ready to be decided but not yet being decided, ordered by conviction-weighted approvals.
// This should be empty if DecidingCount is less than TrackInfo::max_deciding.
  useEffect(() => {
    const getInfo = async () => {
      try {
        const [proposalCount, 
               approvals,  
               balance, 
               proposals,
               blockNumber,
               chain,
               decidingCount,
               referendumCount,
               referendumInfoFor
              ] = await Promise.all([
          api.query.treasury.proposalCount(),
          api.query.treasury.approvals(), 
          api.query.system.account(treasuryAddress),
          api.query.treasury.proposals(proposalIndex.current),
          api.query.system.number(),
          api.rpc.system.chain(),
          api.query.referenda.decidingCount(0),
          api.query.referenda.referendumCount(),
          api.query.referenda.referendumFor(0),
      ])
        setChainData({ proposalCount, 
                       approvals, 
                       balance, 
                       proposals, 
                       blockNumber,
                       chain,
                       decidingCount,
                       referendumCount,
                       referendumInfoFor
                     })
      } catch (e) {
        console.error(e)
      }
    }
    getInfo()
  })

let decidingCount = 9999;
let referendumCount = 9999;
let referendumInfoFor ='';
try {
    tokenName = (chainData.chain).toString();
    decidingCount = chainData.decidingCount.toString();
    referendumCount = chainData.referendumCount.toString();
    referendumInfoFor = chainData.referendumFor.toString();
} catch(e) {
  console.error(e)
}

  return (
    <Grid.Column>
      <Grid.Row>
      <Segment>
      <Button size='mini' circular icon='settings'></Button> 
      {' | '}    
      <Button size='mini' circular icon='step backward' onClick={() => proposalIndex.current =0}></Button> 
      <Button size='mini' circular icon='arrow circle left' onClick={() => proposalIndex.current = proposalIndex.current>0 ? proposalIndex.current-1 : 0}></Button>
      <Button size='mini' circular icon='arrow circle right' onClick={() => proposalIndex.current = proposalIndex.current + 1}></Button>
      <Button size='mini' circular icon='step forward' onClick={() => proposalIndex.current=proposalIndex.current + 10}></Button>
      {' | '}   
      <Label  circular color='blue'>{proposalIndex.current}</Label>
      <Label tag color='gray'>Index No.</Label>
      {' | '}
      <Modal 
          trigger={<Button size='mini' circular icon='book' />}>
      <Modal.Header>Get a Treasury Proposal</Modal.Header>
      <Modal.Content scrolling wrapped="true">
      <Modal.Description>
        <div>
        <strong>Summary</strong> <br />
        Enter the index number of the Treasury Proposal<br /><br />
        <Segment> 
        <Form.Field>
        <Input focus 
           label='Number:' 
           type="number"
           state="propValue"
           defaultValue={0}
           placeholder="0" 
           onChange={() => proposalIndex.current = 1}  
        /><br /><br />
        <Button.Group>
        <Button
              label="Submit"
                />
        <Button.Or />
        <Button>Cancel</Button>
        </Button.Group>
        </Form.Field>
        </Segment>
        </div>      
      </Modal.Description>
      </Modal.Content>
      </Modal>  

 
      <Label tag >Get Proposal</Label>
      {' | '}   
      <Modal 
          onClose = {() => setOpen(false)}
          onOpen = {() => setOpen(true)}
          open = {open}
          trigger={<Button size='mini' circular icon='id card' />}>
      <Modal.Header>Submit a new Treasury Proposal</Modal.Header>
      <Modal.Content scrolling wrapped="true">
      <Modal.Description>
        <div>
        <strong>Summary</strong> <br />
        Put forward a suggestion for spending. 
        A deposit proportional to the value is reserved 
        and slashed if the proposal is rejected. It is 
        returned once the proposal is awarded.<br /><br />
        <Label circular >FOUNDATION PUBLIC KEY: </Label>5DFBnZ5oHDxQbvf8vE8LjGHB4y272VmaF7DuqBR81qZFkkJM <br />
        <Segment> 
        <Form.Field>
        <Input focus 
           fluid
           label='Value' 
           type="number"
           state="propValue"
           defaultValue={1000000000}
           placeholder="1000000000" 
           onChange={onPropChange}  
        /><br />
        <Input 
           fluid
           label ='Beneficiary' 
           type ='text'
           state ='beneficiary'
           value ={beneficiary}
           onChange ={onPropChange}
           placeholder='address' 
        /><br />
        <Button.Group>
        <TxButton
                    label="Submit"
                    type="SIGNED-TX"
                    setStatus={setStatus}
                    attrs={{
                    palletRpc: 'treasury',
                    callable: 'proposeSpend',
                    inputParams: [propValue, beneficiary],
                    paramFields: [true, true],
                    }}
                />
        <Button.Or />
        <Button onClick = {() => setOpen(false)}>Cancel</Button>
        </Button.Group>
        </Form.Field>
        <Segment>
        <strong>Status:</strong>
        <div style={{ overflowWrap: 'break-word' }}>{status}</div>
        </Segment>
        </Segment>
        </div>      
      </Modal.Description>
      </Modal.Content>
      </Modal>  
      <Label tag color='blue'>New Proposal</Label>
      {' | '}    
      
      </Segment>
      </Grid.Row>  

      <ProposalItem />
      <ReferendaItem />
      <Segment>
        <strong>Referenda Storage:</strong><br />
        Deciding Count {'(u32)'}: <strong>{decidingCount}</strong> - The number of referenda being decided currently.<br />
        Referenda Count {'(u32)'}: <strong>{referendumCount}</strong> - The next free referendum index, aka the number of referenda started so far.<br />
        Referenda Info For {'(u32)'}: <strong>{referendumInfoFor}</strong> - Information for a Referenda.<br />
      </Segment>


  </Grid.Column>
  )
}


