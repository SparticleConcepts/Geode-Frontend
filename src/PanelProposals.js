import React, { useEffect, useState, useRef } from 'react'
import { Input, Segment, Statistic, Icon, Modal, Table, Grid, Button, Label, Form } from 'semantic-ui-react'
//import { CopyToClipboard } from 'react-copy-to-clipboard'
import { useSubstrateState } from './substrate-lib'
import { TxButton } from './substrate-lib/components'
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { stringToU8a } from '@polkadot/util';
import { encodeAddress } from '@polkadot/util-crypto';
  // ---------------
  // api.query.treasury.proposals[1]
  // {"proposer":"5FWH5mTAaSJfq7inUQ4Cy9umRZ6tgmVRCsLuLEm3LnKcCEY6",
  //  "value":"0x00000000000000000de0b6b3a7640000",
  //  "beneficiary":"5DFBnZ5oHDxQbvf8vE8LjGHB4y272VmaF7DuqBR81qZFkkJM",
  //  "bond":"0x000000000000000000b1a2bc2ec50000"}
  // ---------------
  // api.query.treasury.approvals()
  // [0, 1, 2, 3]
  // [20, 19, 18, 4, 5, 7, 8, 9, 10, 11, 12, 13, 16, 17, 21]
  // ---------------

export default function Main(props) {
  const [status, setStatus] = useState(null)
  const [open, setOpen] = React.useState(false)
  const [propState, setPropState] = useState({ propValue: 0, beneficiary: ''})
  const onPropChange = (_, data) =>
    setPropState(prev => ({ ...prev, [data.state]: data.value }))
  const { propValue, beneficiary} = propState
  const proposalIndex = useRef(0);
  //const proposalHash = useRef('0x59fe7bd64951667f91f36db33077b1ada93b093b363a32cf869d2a833d72ce08');
  const [chainData, setChainData] = useState({});
  const { api } = useSubstrateState()

  let daysElapsedToBurn = 9999;
  let daysRemainToBurn = 9999;

  let totalNextBurn = 9999;
  let percentDaysRemaining = 0;

  const secToDays = 86400;
  const blockTime = 6;
  const blksToDays = blockTime / secToDays;
  const blksToHrs = blockTime / 3600;
  console.log(blksToDays);
  console.log(blksToHrs);
  const microToCoin = 1000000000000;
  let tokenName = 'coin';
  const treasuryAddress = encodeAddress(stringToU8a("modlpy/trsry".padEnd(32, '\0')))
  const percentBurn = 0.5;

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

// * INFO - renders the proposal information based on proposal index
//        - api.query.treasury.proposalCount() -> 23
//        - api.query.treasury.approvals() -> [20, 19, 18, 4, 5, 7, 8, 9, 10, 11, 12, 13, 16, 17, 21]
//        - api.query.treasury.proposals(proposalIndex.current),
//          -> {"proposer":"5HbHJj7GdedoWNiNCccLYnCBmHkTEJJSLPfUcXfxYTyvsQjG",
//              "value":"0x00000000000000000de0b6b3a7640000",
//              "beneficiary":"5DFBnZ5oHDxQbvf8vE8LjGHB4y272VmaF7DuqBR81qZFkkJM",
//              "bond":"0x000000000000000000b1a2bc2ec50000"}
//        - chainData[proposalCount, approvals, proposals]
// function getImageSource() {
//   src='https://react.semantic-ui.com/images/avatar/small/veronika.jpg'
// const expr = 'Papayas';
// switch (expr) {
//   case 'Oranges':
//     console.log('Oranges are $0.59 a pound.');
//     break;
//   case 'Mangoes':
//   case 'Papayas':
//     console.log('Mangoes and papayas are $2.79 a pound.');
//     // Expected output: "Mangoes and papayas are $2.79 a pound."
//     break;
//   default:
//     console.log(`Sorry, we are out of ${expr}.`);
// }

// }

function ProposalItem() {
  try{
    const hexToDec = hex =>parseInt(hex, 16);
    const proposalJSON = JSON.parse(chainData.proposals);
    const txStatus = ['Proposed', 'Council Motion', 'Rejected', 'Approved'];
    const txColor =  ['blue', 'orange', 'red', 'teal'];
    const approvedArray = chainData.approvals.map(x => x * 1);
    const isApproved = approvedArray.find(index => index === proposalIndex.current); //proposalIndex.current)//(chainData.approvals.find(chkApproved)).toString()
    const txApproved = isApproved > -1 ? 'approved' : 'open'; 
    const statusIndex = txApproved === 'approved' ? 3 : 1;   
    return(
      <div>
        <Segment>
        <strong>Treasury: </strong>
        <Label circular color={txColor[statusIndex]}>{txStatus[statusIndex]}</Label>       
        {' | '}
        <strong> Title:</strong><Label circular color='gray'>Proposal No. {proposalIndex.current}</Label> 
        {' | '}
        <strong> Amount: <Label circular >{hexToDec(proposalJSON.value)/microToCoin} {tokenName}</Label> </strong>
        {' | '}
        <strong> Bond Amount: <Label circular >{hexToDec(proposalJSON.bond)/microToCoin} {tokenName}</Label> </strong>
        <br />
        <strong>Proposer:</strong> <Label circular >
        {proposalJSON.proposer} </Label>                  
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
      This proposal has not been assigned or is closed.
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
               blockNumber,
               chain
              ] = await Promise.all([
          api.query.treasury.proposalCount(),
          api.query.treasury.approvals(), 
          api.query.system.account(treasuryAddress),
          api.query.treasury.proposals(proposalIndex.current),
          api.query.system.number(),
          api.rpc.system.chain()
      ])
        setChainData({ proposalCount, 
                       approvals, 
                       balance, 
                       proposals, 
                       blockNumber,
                       chain })
      } catch (e) {
        console.error(e)
      }
    }
    getInfo()
  })

let spendPeriod = 0;
let totalTreasurySpendable = 0;
let treasuryReserved = 0;
let treasuryMiscFrozen = 0;
let treasuryFeeFrozen = 0; 
let totalTreasuryAvailable = 0; 
let precentOfTreasury = 90;
let openTotal = 0;
let blkNumber = 0;
let treasuryProposalsApproved = 0;
let spendTime = 0;
let spendTimeRemain = 0;
let blkFraction = 0;
let maxProposals = 100;
console.log(maxProposals)

try {
  maxProposals = (api.consts.democracy.maxProposals).toString()
  tokenName = (chainData.chain).toString();
  totalTreasurySpendable = (chainData.balance.data.free).toString();
  treasuryReserved = (chainData.balance.data.reserved).toString();
  treasuryMiscFrozen = (chainData.balance.data.miscFrozen).toString();
  treasuryFeeFrozen = (chainData.balance.data.feeFrozen).toString();
  totalTreasuryAvailable = totalTreasurySpendable - 1 * treasuryReserved - Math.max(treasuryMiscFrozen, treasuryFeeFrozen);
  precentOfTreasury = Math.floor(100 * (totalTreasuryAvailable/totalTreasurySpendable));
  totalNextBurn = Math.floor(percentBurn * totalTreasuryAvailable / microToCoin);
  openTotal = (chainData.proposalCount).toString();
  blkNumber = (chainData.blockNumber).toString();
  treasuryProposalsApproved = (chainData.approvals.length).toString();
 
  spendPeriod = (api.consts.treasury.spendPeriod).toString();
  blkFraction = ((1 * blkNumber) % (1 * spendPeriod));
  spendTime = BlockTime(blkFraction);
  spendTimeRemain = BlockTime(spendPeriod - blkFraction);
  daysElapsedToBurn = spendTime.Days + ":" + spendTime.Hours + ':' + spendTime.Minutes 
  daysRemainToBurn = spendTimeRemain.Days + ":" + spendTimeRemain.Hours + ':' + spendTimeRemain.Minutes ;
  percentDaysRemaining = Math.floor(100 * ((spendPeriod - blkFraction) / spendPeriod));

} catch(e) {
  console.error(e)
}
// helper functions ...
function setProposalIndex(){
  let i = propValue
    if (i > 100) {
      i = 100
    }
  //const i = propValue; //(propValue < maxProposals) ? propValue : 0
  if (i > -1) {
    proposalIndex.current = i 
  } else {
    proposalIndex.current = 0
  }
  return
}
// function incProposalIndex(){
//   let i = proposalIndex.current
//   i = (i<maxProposals) ? i+1 : maxProposals;
//   proposalIndex.current = i;
//   return
// }
// function decProposalIndex() {
//   let i = proposalIndex.current
//   i = (i>0) ? i-1 : 0;
//   proposalIndex.current = i;
//   return
// }

  return (
    <Grid.Column>

      <h2>
      <Modal trigger={<Icon link name="info circle" />}>
                    <Modal.Header>Proposal Submit and Track</Modal.Header>
                    <Modal.Content scrolling wrapped="true">
                    <Modal.Description>
                    <Table.Row>    
                    <Segment>  
                    <Button size='mini' circular icon='id card' /> - Submit a New Treasury Proposal.  <br />     
                    <Button size='mini' circular icon='settings' /> - Search for a proposal by Index Number.  <br /> 
                    <Label circular color='blue'>#</Label> - Current Proposal Index Number. <br />                   
                    <br />
                    <Label circular color='orange'>Council Motion</Label> - To be Submitted to the Council for Approval/Disapproval. <br />               
                    <Label circular color='blue'>Approved</Label> - Proposal has been Approved and will be paid out.<br />               
                    <Label circular color='red'>Disapproved</Label> - Proposal has been Disapproved.<br />               
                    </Segment>
                    <Segment>
                    <strong>Terminology: </strong><br />
                    <br></br>
                    <strong>Cool off Period: </strong>Period in blocks where an external proposal may not be re-submitted after being vetoed. <br></br>
                    <strong>Enactment Period: </strong>The period between a proposal being approved and enacted. It should 
                    generally be a little more than the unstake period to ensure that voting stakers 
                    have an opportunity to remove themselves from the system in the case where they 
                    are on the losing side of a vote. <br />
                    <strong>Fast Track Voting Period: </strong>Minimum voting period allowed for a fast-track referendum. <br></br> 
                    Instant Allowed: Indicator for whether an emergency origin is even allowed to happen. 
                    Some chains may want to set this permanently to false, others may want to condition 
                    it on things such as an upgrade having happened recently.
                    <br></br>
                    <strong>LaunchPeriod: </strong>How often (in blocks) new public referenda are launched. <br />
                    <strong>Preimage Byte Deposite: </strong>The deposit required based on storage size of the pre-Image.<br></br>
                    <strong>Max Deposits: </strong>The maximum number of deposits a public proposal may have at any time. <br></br>
                    <strong>Max Proposals: </strong>The maximum number of public proposals that can exist at any time. <br></br>
                    <strong>Max Votes: </strong>The maximum number of votes for an account. <br></br>
                    Also used to compute weight, an overly big value can lead to extrinsic 
                    with very big weight: see delegate for instance. <br></br>
                    <strong>Minimum Deposit: </strong>The minimum amount to be used as a deposit for a public 
                    referendum proposal. <br></br>
                    <strong>Vote Locking Period: </strong>The minimum period of vote locking. <br></br>
                    It should be no shorter than enactment period to ensure that in 
                    the case of an approval, those successful voters are locked into 
                    the consequences that their votes entail. <br></br>
                    <strong>Voting Period: </strong>How often (in blocks) to check for new votes. <br></br>

                    </Segment>
                    </Table.Row>
                    </Modal.Description>
                    </Modal.Content>
                    </Modal>        
                    Proposal Submit and Track
        </h2>  
      <Table 
          size='small' 
          color='teal' 
          key='teal' 
          textAlign='center'
          verticalAlign='middle'
          inverted>
        <Table.Row color='teal'>
        <Table.Cell >
        <Statistic size='mini' >
                <Statistic.Label> Treasury Spendable/Available</Statistic.Label>
                <Statistic.Value>
                {Math.floor(totalTreasurySpendable/microToCoin)} / 
                {Math.floor(totalTreasuryAvailable/microToCoin)} 
                {' '}{tokenName}</Statistic.Value>
                </Statistic>   
        </Table.Cell>
        
        <Table.Cell><div style={{ width: 50, height: 50 }}>
        <CircularProgressbar
                value={precentOfTreasury}
                text={`${precentOfTreasury}%`}
                styles={buildStyles({
                textSize: '18px',
                pathColor: `rgba(255, 0, 0, ${precentOfTreasury / 100})`,
                textColor: 'white',
                trailColor: '#d6d6d6',
                backgroundColor: '#3e98c7',
                })}/></div></Table.Cell>
        <Table.Cell>
                <Statistic size='mini'>
                <Statistic.Label> Total </Statistic.Label>
                <Statistic.Value>
                      {openTotal} </Statistic.Value>
                </Statistic>                 
        </Table.Cell>
        <Table.Cell>
                <Statistic size='mini'>
                <Statistic.Label> Approved</Statistic.Label>
                <Statistic.Value>{treasuryProposalsApproved} </Statistic.Value>
                </Statistic>                 
        </Table.Cell>
        <Table.Cell>
                <Statistic size='mini'>
                <Statistic.Label> Total</Statistic.Label>
                <Statistic.Value>{'total'} </Statistic.Value>
                </Statistic>                 
        </Table.Cell>
        <Table.Cell>
                <Statistic size='mini'>
                <Statistic.Label> Remaining/Elapsed Days:Hrs:Mins </Statistic.Label>
                <Statistic.Value>{daysRemainToBurn} / {daysElapsedToBurn} </Statistic.Value>
                </Statistic>    
        </Table.Cell>
        <Table.Cell><div style={{ width: 50, height: 50 }}>
        <CircularProgressbar
                value={percentDaysRemaining}
                text={`${percentDaysRemaining}%`}
                styles={buildStyles({
                textSize: '18px',
                pathColor: `rgba(255, 0, 0, ${percentDaysRemaining / 100})`,
                textColor: 'white',
                trailColor: '#d6d6d6',
                backgroundColor: '#3e98c7',
                })}/></div></Table.Cell>
        <Table.Cell>
                <Statistic size='mini'>
                <Statistic.Label> Next Burn</Statistic.Label>
                <Statistic.Value>{totalNextBurn} {tokenName} </Statistic.Value>
                </Statistic>    
        </Table.Cell>
      </Table.Row>
      </Table>  
      <Grid.Row>
      <Segment>
      <Button size='mini' circular icon='settings' onClick = {setProposalIndex}></Button> 
      {' | '}   
      <Input focus 
           size='mini'
           label='Proposal:' 
           type="number"
           state="propValue"
           defaultValue={0}
           placeholder="0" 
           onChange={onPropChange}  
        />
      {' | '} 
      <Label tag color='gray'>Index No. Max: {maxProposals}</Label>
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

// {/* <Button size='mini' circular icon='step backward' onClick={() => proposalIndex.current =0}></Button> 
// <Button size='mini' circular icon='arrow circle left' onClick={decProposalIndex}></Button>
// <Button size='mini' circular icon='arrow circle right' onClick={incProposalIndex }></Button>
// <Button size='mini' circular icon='step forward' onClick={() => proposalIndex.current=proposalIndex.current + 10}></Button>
// {' | '}   
// <Label  circular color='blue'>{proposalIndex.current}</Label> */}
