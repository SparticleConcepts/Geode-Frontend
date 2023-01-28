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
// dataDepositPerByte: u128
// interface: api.consts.tips.dataDepositPerByte
// summary: The amount held on deposit per byte within the tip 
// report reason or bounty description.
// ---------------------------------------------
// maximumReasonLength: u32
// interface: api.consts.tips.maximumReasonLength
// summary: Maximum acceptable reason length.
// Benchmarks depend on this value, be sure to update weights 
// file when changing this value
// ---------------------------------------------
// tipCountdown: u32
// interface: api.consts.tips.tipCountdown
// summary: The period for which a tip remains open after is has 
// achieved threshold tippers.
// ---------------------------------------------
// tipFindersFee: Percent
// interface: api.consts.tips.tipFindersFee
// summary: The percent of the final tip which goes to the original 
// reporter of the tip.
// ---------------------------------------------
// tipReportDepositBase: u128
// interface: api.consts.tips.tipReportDepositBase
// summary: The amount held on deposit for placing a tip report.
// ---------------------------------------------
// EVENTS
// ---------------------------------------------
// NewTip(H256)
// interface: api.events.tips.NewTip.is
// summary: A new tip suggestion has been opened.
// ---------------------------------------------
// TipClosed(H256, AccountId32, u128)
// interface: api.events.tips.TipClosed.is
// summary: A tip suggestion has been closed.
// ---------------------------------------------
// TipClosing(H256)
// interface: api.events.tips.TipClosing.is
// summary: A tip suggestion has reached threshold and is closing.
// ---------------------------------------------
// TipRetracted(H256)
// interface: api.events.tips.TipRetracted.is
// summary: A tip suggestion has been retracted.
// ---------------------------------------------
// TipSlashed(H256, AccountId32, u128)
// interface: api.events.tips.TipSlashed.is
// summary: A tip suggestion has been slashed.
// ---------------------------------------------
// STORAGE
// ---------------------------------------------
// reasons(H256): Option<Bytes>
// interface: api.query.tips.reasons
// summary: Simple preimage lookup from the reason's hash to 
// the original data. Again, has an insecure enumerable hash 
// since the key is guaranteed to be the result of a secure hash.
// ---------------------------------------------
// tips(H256): Option<PalletTipsOpenTip>
// interface: api.query.tips.tips
// summary: TipsMap that are not yet completed. Keyed by the hash 
// of (reason, who) from the value. This has the insecure enumerable 
// hash function since the key itself is already guaranteed to be a 
// secure hash.
// api.query.tips.tips > ----------------------------------
// 0x89f964785d3f798a120cf4aeab11cd58687207d063661c0ae5ae1c07f27be668
// {"reason":"0xe09e2d69b1ce1dbf7da60cd846646e22e54de8b45474dbea2a084805a50152a0",
//  "who":"5Ev6GRsNkPnpHhnj1pch4DshoB1qWigUkQDp44SnJrMft2k5",
//  "finder":"5EZZMd5R4ZWFYL4NFYV99hmf5icxBr7tvwYhz9nWJ55m7m9h",
//  "deposit":114000000000000,
//  "closes":null,
//  "tips":[],
//  "findersFee":true}
//  Tip 4: 0xfa34bfe8bb621a51f6d59dd53d19b37491116c3941d0d90c1903893f85637bef
// ---------------------------------------------
// EXTRINSICS
// ---------------------------------------------
// closeTip(hash: H256)
// interface: api.tx.tips.closeTip
// summary: Close and payout a tip.
// The dispatch origin for this call must be Signed.
// The tip identified by hash must have finished its 
// countdown period.
// hash: The identity of the open tip for which a tip 
// value is declared. This is formed as the hash of the 
// tuple of the original tip reason and the beneficiary 
// account ID.
// ---------------------------------------------
// reportAwesome(reason: Bytes, who: MultiAddress)
// interface: api.tx.tips.reportAwesome
// summary: Report something reason that deserves a tip 
// and claim any eventual the finder's fee.
// The dispatch origin for this call must be Signed.
// Payment: TipReportDepositBase will be reserved from 
// the origin account, as well as DataDepositPerByte for 
// each byte in reason.
// reason: The reason for, or the thing that deserves, 
// the tip; generally this will be a UTF-8-encoded URL.
// who: The account which should be credited for the tip.
// Emits NewTip if successful.
// ---------------------------------------------
// retractTip(hash: H256)
// interface: api.tx.tips.retractTip
// summary: Retract a prior tip-report from report_awesome, 
// and cancel the process of tipping.
// If successful, the original deposit will be unreserved.
// The dispatch origin for this call must be Signed and the 
// tip identified by hash must have been reported by the 
// signing account through report_awesome (and not through 
// tip_new).
// hash: The identity of the open tip for which a tip value 
// is declared. This is formed as the hash of the tuple of the 
// original tip reason and the beneficiary account ID.
// Emits TipRetracted if successful.
// ---------------------------------------------
// slashTip(hash: H256)
// interface: api.tx.tips.slashTip
// summary: Remove and slash an already-open tip.
// May only be called from T::RejectOrigin.
// As a result, the finder is slashed and the deposits are lost.
// Emits TipSlashed if successful.
// ---------------------------------------------
// tip(hash: H256, tip_value: Compact<u128>)
// interface: api.tx.tips.tip
// summary: Declare a tip value for an already-open tip.
// The dispatch origin for this call must be Signed and the 
// signing account must be a member of the Tippers set.
// hash: The identity of the open tip for which a tip value 
// is declared. This is formed as the hash of the tuple of 
// the hash of the original tip reason and the beneficiary 
// account ID.
// tip_value: The amount of tip that the sender would like 
// to give. The median tip value of active tippers will be 
// given to the who.
// Emits TipClosing if the threshold of tippers has been 
// reached and the countdown period has started.
// ---------------------------------------------
// tipNew(reason: Bytes, who: MultiAddress, tip_value: Compact<u128>)
// interface: api.tx.tips.tipNew
// summary: Give a tip for something new; no finder's fee will be taken.
// The dispatch origin for this call must be Signed and the signing 
// account must be a member of the Tippers set.
// reason: The reason for, or the thing that deserves, the tip; 
// generally this will be a UTF-8-encoded URL.
// who: The account which should be credited for the tip.
// tip_value: The amount of tip that the sender would like to give. 
// The median tip value of active tippers will be given to the who.
// Emits NewTip if successful.
// ---------------------------------------------
// ERRORS
// ---------------------------------------------
// AlreadyKnown
// interface: api.errors.tips.AlreadyKnown.is
// summary: The tip was already found/started.
// ---------------------------------------------
// NotFinder
// interface: api.errors.tips.NotFinder.is
// summary: The account attempting to retract the tip is not the finder of the tip.
// ---------------------------------------------
// Premature
// interface: api.errors.tips.Premature.is
// summary: The tip cannot be claimed/closed because it's still in the countdown period.
// ---------------------------------------------
// ReasonTooBig
// interface: api.errors.tips.ReasonTooBig.is
// summary: The reason given is just too big.
// ---------------------------------------------
// StillOpen
// interface: api.errors.tips.StillOpen.is
// summary: The tip cannot be claimed/closed because there are not enough tippers yet.
// ---------------------------------------------
// UnknownTip
// interface: api.errors.tips.UnknownTip.is
// summary: The tip hash is unknown.


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
// function BlockTime(blocks) {
//   const Days = Math.floor(blksToHrs * blocks /24);
//   const Remainder = (blksToHrs * blocks) % 24;
//   const Hours = Math.floor(Remainder);
//   const Minutes = Math.floor(60 * (Remainder - Hours));
//   return(
//     {"Days": Days,
//      "Hours": Hours,
//      "Minutes": Minutes
//     })
// }

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
  useEffect(() => {
    const getInfo = async () => {
      try {
        const [proposalCount, 
               approvals,  
               balance, 
               proposals,
               //proposalList,
               //proposalOf,
               //councilVotes,
               blockNumber,
               chain
              ] = await Promise.all([
          api.query.treasury.proposalCount(),
          api.query.treasury.approvals(), 
          api.query.system.account(treasuryAddress),
          api.query.treasury.proposals(proposalIndex.current),
//          api.query.treasury.proposals.map(() proposalIndex),
//          api.query.council.proposals(),
//          api.query.council.proposalOf(proposalHash.current),
//          api.query.council.voting(proposalHash.current),
          api.query.system.number(),
          api.rpc.system.chain()
          //api.query.balances.account('5EYCAe5ijiYfyeZ2JJCGq56LmPyNRAKzpG4QkoQkkQNB5e6Z')
      ])
        setChainData({ proposalCount, 
                       approvals, 
                       balance, 
                       proposals, 
//                       proposalList,
//                       proposalOf,
//                       councilVotes,
                       blockNumber,
                       chain })
      } catch (e) {
        console.error(e)
      }
    }
    getInfo()
  })

//let spendPeriod = 0;
// let totalTreasurySpendable = 0;
// let treasuryReserved = 0;
// let treasuryMiscFrozen = 0;
// let treasuryFeeFrozen = 0; 
// let totalTreasuryAvailable = 0; 
//let precentOfTreasury = 90;
//let openTotal = 0;
//let blkNumber = 0;
//let treasuryProposalsApproved = 0;
// let blkTime = 0;
//let spendTime = 0;
//let spendTimeRemain = 0;
//let blkFraction = 0;

try {

  tokenName = (chainData.chain).toString();
//   totalTreasurySpendable = (chainData.balance.data.free).toString();
//   treasuryReserved = (chainData.balance.data.reserved).toString();
//   treasuryMiscFrozen = (chainData.balance.data.miscFrozen).toString();
//   treasuryFeeFrozen = (chainData.balance.data.feeFrozen).toString();
  //totalTreasuryAvailable = totalTreasurySpendable - 1 * treasuryReserved - Math.max(treasuryMiscFrozen, treasuryFeeFrozen);
  //precentOfTreasury = Math.floor(100 * (totalTreasuryAvailable/totalTreasurySpendable));
  //totalNextBurn = Math.floor(percentBurn * totalTreasuryAvailable / microToCoin);
  //openTotal = (chainData.proposalCount).toString();
  //blkNumber = (chainData.blockNumber).toString();
  //blkTime = BlockTime(blkNumber);
//   treasuryProposalsApproved = (chainData.approvals.length).toString();
 
//   spendPeriod = (api.consts.treasury.spendPeriod).toString();
//   blkFraction = ((1 * blkNumber) % (1 * spendPeriod));
//   spendTime = BlockTime(blkFraction);
//   spendTimeRemain = BlockTime(spendPeriod - blkFraction);
//   daysElapsedToBurn = spendTime.Days + ":" + spendTime.Hours + ':' + spendTime.Minutes 
//   daysRemainToBurn = spendTimeRemain.Days + ":" + spendTimeRemain.Hours + ':' + spendTimeRemain.Minutes ;
  //percentDaysRemaining = Math.floor(100 * ((spendPeriod - blkFraction) / spendPeriod));

} catch(e) {
  console.error(e)
}

// function prevProposal() {
//   if (proposalIndex.current > 0) {
//     proposalIndex.current = proposalIndex.current - 1;
//   } else {
//     proposalIndex.current = 0;
//   }
//   return
// }

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
      
  </Grid.Column>
  )
}


