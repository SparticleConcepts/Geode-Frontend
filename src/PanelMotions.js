import React, { useEffect, useState, useRef } from 'react'
import { Input, Segment, Statistic, Icon, Modal, Table, Grid, Button, Label, Form } from 'semantic-ui-react'
import { CopyToClipboard } from 'react-copy-to-clipboard'
import { useSubstrateState } from './substrate-lib'
import { TxButton } from './substrate-lib/components'
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { stringToU8a } from '@polkadot/util';
import { encodeAddress } from '@polkadot/util-crypto';
// List of Active Proposals by H256 ---------------------------------
// api.query.council.proposals()

//[0x59fe7bd64951667f91f36db33077b1ada93b093b363a32cf869d2a833d72ce08, 
// 0xf6d39f126537ad6f4c1e44a3093f4b409c8ed063d9d2c7179ba582eb67e0824e, 
// 0x452c1dd45de9a5493a60e008f3eda2b5790ad75b42d5f5b4e7060216b8e8b82e, 
// 0x8b123d0c0607fd77e12ec4a4a91a0fe4070a7fee09875168f5d9cfa9c0f0ab1a, 
// 0x465c45aad206082976b96f55197610c2fcd65cdccb1af435c7766cadb668f952, 
// 0xc20806778fa407585c107cbcff9f3138d31e0efc92706acf559a4aee214beb53, 
// 0x0336bb572cff1077031be4d6d74b53e653417b4f782da385d352b510fcac9f91, 
// 0xcdfcb8c7570e851e85504edd054ad9bce597d0df21a6ca8241df9d58e1622ac6, 
// 0xde94f25132bc56438f473c8e64df1e0f0a8ad5ae171249a365312eca1ae36cc6, 
// 0x4b705523ca5d9909eeb1b161caa4f6a560f648529723115c610d88dfe9b78ec7, 
// 0xe52e980fee784d37b693fbcf04a8a5cf9d71a547ca5d6e8e4e70e0149e7f6d7c, 
// 0x247e8176484ab9e3acb5e0f97b6f2c5394dc9903e48437031867f5faee0269a3, 
// 0xb9f21fa6393f21c8f691695919f2e6081fa024835125c9d5452dc57a7f3268df, 
// 0x3dd9c8b50b896089ddf9db75d231bd23d6596822ba6d5480697ed0833b64f077, 
// 0x8ddea8677b866d43cedf0ec6001895711af80fafa2988c649a80b877ba8422ae, 
// 0xc25e2fa141b3df9803d076e485943470b8c449752f72dd5a46a1055e8f361b39, 
// 0x99d2ff23651d90ea3a49cb8abf18baf2696802bf8c91e9964a41c5a9fd220a6b, 
// 0x446f939c59f6942b94d723104358792356695775572058bec18eb3f68bfff899]

// 0x1c31329fd6f403c124153aee0ff22087179af1dc037f462f7c93581b20923a0e

// TIPS ----------------------------------
// 0x89f964785d3f798a120cf4aeab11cd58687207d063661c0ae5ae1c07f27be668
// {"reason":"0xe09e2d69b1ce1dbf7da60cd846646e22e54de8b45474dbea2a084805a50152a0",
//  "who":"5Ev6GRsNkPnpHhnj1pch4DshoB1qWigUkQDp44SnJrMft2k5",
//  "finder":"5EZZMd5R4ZWFYL4NFYV99hmf5icxBr7tvwYhz9nWJ55m7m9h",
//  "deposit":114000000000000,
//  "closes":null,
//  "tips":[],
//  "findersFee":true}

  // ---------------
  // api.query.council.voting[H256]
  // api.query.council.voting('0x59fe7bd64951667f91f36db33077b1ada93b093b363a32cf869d2a833d72ce08')
  // {"index":0,
  // "threshold":4,
  // "ayes":["5GNTtXPNmjuFB2J93Duh99qnAiN8QPFoX6L3CDFrhGUwWT4u","5FWH5mTAaSJfq7inUQ4Cy9umRZ6tgmVRCsLuLEm3LnKcCEY6","5DXGjp34EfKa4CSqSAedTeSYZjvorW8RmNK8Hp9m9FihLGHJ","5HbHJj7GdedoWNiNCccLYnCBmHkTEJJSLPfUcXfxYTyvsQjG"],
  // "nays":[],
  // "end":87383}
  // ---------------
  // api.query.treasury.proposals[1]
  // {"proposer":"5FWH5mTAaSJfq7inUQ4Cy9umRZ6tgmVRCsLuLEm3LnKcCEY6",
  //  "value":"0x00000000000000000de0b6b3a7640000",
  //  "beneficiary":"5DFBnZ5oHDxQbvf8vE8LjGHB4y272VmaF7DuqBR81qZFkkJM",
  //  "bond":"0x000000000000000000b1a2bc2ec50000"}
  // ---------------
  // api.query.council.proposalOf(H256)
  // {"callIndex":"0x1202","args":{"proposal_id":2}}
  // ---------------
  // api.query.treasury.approvals()
  // [0, 1, 2, 3]
  // [20, 19, 18, 4, 5, 7, 8, 9, 10, 11, 12, 13, 16, 17, 21]
  // ---------------

export default function Main(props) {
  const [status, setStatus] = useState(null)
  const [open, setOpen] = React.useState(false)
  console.log(open)
  const [propState, setPropState] = useState({ propValue: 0, beneficiary: ''})
  const onPropChange = (_, data) =>
    setPropState(prev => ({ ...prev, [data.state]: data.value }))
  const { propValue, beneficiary} = propState
  const proposalIndex = useRef(0);
  const proposalHash = useRef('0x59fe7bd64951667f91f36db33077b1ada93b093b363a32cf869d2a833d72ce08');
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
function ProposalItem() {
  try{
    //const noOfProposals = (chainData.proposalCount).toString()
    const hexToDec = hex =>parseInt(hex, 16);
    const proposalJSON = JSON.parse(chainData.proposals);
    const proposalH256 = (chainData.proposalList[proposalIndex.current]).toString();
    proposalHash.current = proposalH256;

    const councilJSON = JSON.parse(chainData.councilVotes);
    const thresholdVotes = (councilJSON.threshold).toString();
    const endVote = (councilJSON.end).toString();
    const ayeVotes = (councilJSON.ayes.length).toString();
    const nayVotes = (councilJSON.nays.length).toString();
    const txStatus = ['Proposed', 'Ready to Close', 'Rejected', 'Approved'];
    const txColor =  ['blue', 'orange', 'red', 'teal'];
    let statusIndex = 0;
    let txDay = '';
    let paidDay = '';
    const voteEndBlk = Math.abs(blkNumber - endVote);
    const voteDate = BlockTime(voteEndBlk);
    const voteEndDate = voteDate.Days + ' Day(s) ' + voteDate.Hours + ' Hrs ' + voteDate.Minutes + ' Min '

    const fundsAvailable = BlockTime(1 * endVote + 1 * spendPeriod - blkNumber);
    const approvedArray = chainData.approvals.map(x => x * 1);
    const isApproved = approvedArray.find(index => index === proposalIndex.current); //proposalIndex.current)//(chainData.approvals.find(chkApproved)).toString()
    const txApproved = isApproved > -1 ? 'approved' : 'open';    
    //const blkTime = BlockTime(blkNumber);
    
    if (blkNumber - endVote > 0) {
        txDay = ' passed end of voting.';
        statusIndex = txApproved === 'approved' ? 3 : 1; 
    } else {
        txDay = ' remaining in voting period.';
        statusIndex = 0;
    }
    if ((blkNumber - endVote - spendPeriod) < 0) {
      paidDay = ' in ' + fundsAvailable.Days + ' Days ' + fundsAvailable.Hours + ' Hrs ' + fundsAvailable.Minutes + ' Mins ';
    } else {
      paidDay = txApproved === 'approved' ? ' Paid ' : 'Unpaid' ;
    }
    return(
      <div>
        <Segment>
        <Label circular color={txColor[statusIndex]}>{txStatus[statusIndex]}</Label>       
        | Threshold 
        <Label circular >{thresholdVotes}</Label> Votes
        | <Icon circular inverted color='orange' name='thumbs down' />
        <Label circular >{nayVotes}</Label>
        | <Icon circular inverted color='blue' name='thumbs up' />
        <Label circular >{ayeVotes}</Label>
        | Voting End <Label circular >#{endVote}</Label>
        <Label circular>{voteEndDate}</Label>{txDay}
        <br /><br />
        <strong>Title:</strong><Label circular color='gray'>Proposal No. {proposalIndex.current}</Label>
        <br />
        <strong>Proposer:</strong> <Label circular >{proposalJSON.proposer} </Label>                  
            <Label as='a' color='gray' image>
            <img alt='' src='https://react.semantic-ui.com/images/avatar/small/veronika.jpg' />
            Vega
            </Label><br />
        <strong>Amount: {hexToDec(proposalJSON.value)/microToCoin} {tokenName}</strong><br />
        <strong>Beneficiary:</strong> <Label circular> {proposalJSON.beneficiary}</Label>
            <Label as='a' image>
            <img alt='' src='https://react.semantic-ui.com/images/avatar/small/stevie.jpg' />
            Foundation
            </Label><br />
        <strong>Bond Amount: {hexToDec(proposalJSON.bond)/microToCoin} {tokenName}</strong><br />
        <strong>Funds Allocation: <Label circular>{paidDay}</Label></strong><br />
        </Segment>
      </div>
    )
  } catch(e) {
    console.error(e)
    return(
      <> 
      <Segment>This proposal has been closed.
      </Segment>
      </>
    )
  }
} 

function ProposalList() {
  const txColor =  ['blue', 'orange', 'red', 'teal'];
  const txTitle =  ['Treasury', 'Tip', 'Motion'];
  let proposalName = 'H256';
try{
    proposalName = (chainData.proposalList[proposalIndex.current]).toString()
    return(
      <div>
        <Segment>
        <Label circular color={txColor[0]}>{txTitle[0]}</Label>
        <Label tag color='gray'>Proporsal</Label>
        <Label circular color='blue'> {proposalIndex.current}</Label>
        <Label tag color='gray' ><strong>Proposal No.:</strong></Label>
        <Label circular color='blue'>{proposalName}</Label> 
        <Label tag color='gray' ><strong> Proposal Hash: </strong></Label>
        
        <CopyToClipboard text={proposalName}>
                    <Button
                      basic
                      circular='true'
                      compact
                      size="mini"
                      color="blue"
                      icon="copy outline"
                    />
                  </CopyToClipboard>

        </Segment>
        <ProposalItem />
      </div>
    )
  } catch(e) {
    console.error(e)
    const txResponse = (proposalName ==='H256') ? "This Proposal has not been sent to council" : "Error in retrieving proposal data"
    return(
      <div> 
      <Segment>
      {txResponse}<br />
      <strong>Proposal Index: {proposalIndex.current} </strong><br />
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
               proposalList,
               proposalOf,
               councilVotes,
               blockNumber,
               chain
              ] = await Promise.all([
          api.query.treasury.proposalCount(),
          api.query.treasury.approvals(), 
          api.query.system.account(treasuryAddress),
          api.query.treasury.proposals(proposalIndex.current),
//          api.query.treasury.proposals.map(() proposalIndex),
          api.query.council.proposals(),
          api.query.council.proposalOf(proposalHash.current),
          api.query.council.voting(proposalHash.current),
          api.query.system.number(),
          api.rpc.system.chain()
          //api.query.balances.account('5EYCAe5ijiYfyeZ2JJCGq56LmPyNRAKzpG4QkoQkkQNB5e6Z')
      ])
        setChainData({ proposalCount, 
                       approvals, 
                       balance, 
                       proposals, 
                       proposalList,
                       proposalOf,
                       councilVotes,
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
// let blkTime = 0;
let spendTime = 0;
let spendTimeRemain = 0;
let blkFraction = 0;

try {

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
  //blkTime = BlockTime(blkNumber);
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

      <h2>
      <Modal trigger={<Icon link name="info circle" />}>
                    <Modal.Header>Proposal Submit, Track, Vote and Endorse</Modal.Header>
                    <Modal.Content scrolling wrapped="true">
                    <Modal.Description>
                    <Table.Row>    
                    <Segment>  
                    <Icon link name="envelope" /> - Submit a Proposal  <br></br>                    
                    <Icon link name="info circle" /> - Proposal details including vote count and schedule  <br></br>                    
                    <Icon link name="thumbs up" /> - Use to vote on specific Referenda <br></br>   
                    <Icon link name="circle check" /> - Use to endorse Proposals  <br></br>
                    <Label tag as='a'>SORT </Label> - Use to sort Proposal List
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
                    Proposal Submit, Track, Vote and Endorse
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
      <Button size='mini' circular icon='settings'></Button> 
      {' | '}    
      <Button size='mini' circular icon='step backward' onClick={() => proposalIndex.current =0}></Button> 
      <Button size='mini' circular icon='arrow circle left' onClick={() => proposalIndex.current = proposalIndex.current>0 ? proposalIndex.current-1 : 0}></Button>
      <Button size='mini' circular icon='arrow circle right' onClick={() => proposalIndex.current = proposalIndex.current + 1}></Button>
      <Button size='mini' circular icon='step forward' onClick={() => proposalIndex.current=proposalIndex.current + 10}></Button>
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
        /><br />
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
      <ProposalList />
        
      
  </Grid.Column>
  )
}


