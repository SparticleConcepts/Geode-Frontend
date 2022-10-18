import React, { useEffect, useState } from 'react'
import { Segment, Statistic, Dropdown, Container, Form, Icon, Input, Modal, Table, Grid, Button, Label } from 'semantic-ui-react'
//import { CopyToClipboard } from 'react-copy-to-clipboard'
import { useSubstrateState } from './substrate-lib'
import { TxButton } from './substrate-lib/components'
//import { CircularProgressbar } from 'react-circular-progressbar';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';



export default function Main(props) {
// button colors
    const [selSwitch, setSelSwitch] = useState({})
    const [arrayFilter, setArrayFilter] = useState('all')
    const [total, setTotal] = useState({})
    const [openTotal, setOpenTotal] = useState(0)
    const [approvedTotal, setApprovedTotal] = useState(0)

    // test button - remove from production
    const [test, setTest] = useState('yes')
    //transfers
    const [status, setStatus] = useState(null)
    const [formState, setFormState] = useState({ addressTo: '', amount: 0 })

  
    const onChange = (_, data) =>
      setFormState(prev => ({ ...prev, [data.state]: data.value }))
    const { addressTo, amount } = formState
//transfers  

const infoProposal = 'Anyone can submit a proposal by depositing the minimum amount of tokens for a certain period (number of blocks). If someone agrees with the proposal, they may deposit the same amount of tokens to support it – this action is called endorsing.'
const infoReferenda = 'Every 28 days, a new referendum will come up for a vote, assuming there is at least one proposal in the queue to vote on. There is a queue for Council-approved proposals and a queue for publicly submitted proposals. The referendum to be voted upon alternates between the top proposal in those two queues. You can vote either AYE or NAY on a referendum, or you can abstain entirely. To vote, a voter generally must lock some tokens up for a short period of time. This minimizes people selling their votes. It is possible to vote without locking at all, but your vote will be worth a small fraction of a normal vote, given your stake. At the same time, holding only a small amount of tokens does not mean that you cannot influence the referendum result, thanks to time-locking. Time-Locking is also called Conviction Voting. If you feel very strongly about that referendum, you can volunteer to lock up your tokens for a longer period of time, as a show of how deeply you are convicted to this vote. That measure of your conviction multiplies your voting power. '
const infoTreasury ='When a stakeholder wishes to propose a spend from the Treasury, they must reserve a deposit of at least 100 GEODE or 5% of the proposed spend (see below for variations). This deposit will be slashed if the proposal is rejected, and returned if it is accepted. Please note that there is no way for a user to revoke a treasury proposal after it has been submitted. The Council will either accept or reject the proposal, and if the proposal is rejected, the bonded funds are burned.'
const infoTips = 'Council-initiated: Tips that a Council member published, do not have a finders fee or a bond. Public-initiated: Put in by someone who is not on the Council. '
const infoMotion = ''
const infoBounty = 'Defines the work to be done. Curator assigned by Council.'

const proposalTerm = '1 July 2022 - 30 September 2022 - This Treasury Proposal is an extension of our current maintenance & support contract with the Geode Ecosystem. The extension of the maintenance & support contract covers term: 1 July 2022 until 30 September 2022.'
const proposalDetails = 'The Social Contract Mechanism <https://github.com/polkascan/social-contract/blob/master/README.md>'
const proposalComments = 'We will be available to answer the Geode Councils questions.'


  //const infoBalances ='The Substrate Balances pallet managers user funds for accounts. Use this user interface to \n(1) view the distribution of account balances, \n(2) transfer funds between accounts'
  const infoName ='This is the Public Key Address for the account. ';
  const infoNameAdditional = 'NOTE: Please keep secret keys in a secure location and \nnot stored in locations that can be accessed when your computer is connected to the internet.'
//  const infoAvailableBalance = 'Available Balance for transactions, fees, etc.\n Use the blue transaction button to transfer funds to other account addresses.'
//  const infoTotalBalance = 'There are four (4) types of balances, free, reserved, \nmiscFrozen and feeFrozen. Usable balance = free - miscFrozen - feeFrozen.'
//  const infoFreeBalance = 'On Geode, four different balance types indicate whether your balance can be used for transfers, to pay fees, or must remain frozen and unused due to an on-chain requirement. \nThe AccountData struct defines the balance types in Substrate. \nThe four types of balances include free, reserved, misc_frozen (miscFrozen in camel-case), and fee_frozen (feeFrozen in camel-case). \nIn general, the usable balance of the account is the amount that is free minus any funds that are considered frozen (either misc_frozen or fee_frozen), depending on the reason for which the funds are to be used. If the funds are to be used for transfers, then the usable amount is the free amount minus any misc_frozen funds. However, if the funds are to be used to pay transaction fees, the usable amount would be the free funds minus fee_frozen. \nThe total balance of the account is considered to be the sum of free and reserved funds in the account. Reserved funds are held due to on-chain requirements and can usually be freed by taking some on-chain action. For example, the Identity pallet reserves funds while an on-chain identity is registered, but by clearing the identity, you can unreserve the funds and make them free again.'
  const infoType = 'Information on proposal types'
  const infoStatus = 'Information on proposal status'

  const { api, keyring } = useSubstrateState()
  const accounts = keyring.getPairs()
  const [balances, setBalances] = useState({})
  console.log(balances);
  const [open, setOpen] = React.useState(false)
  const [vote, setVote] = useState('none')

  //- dev info. - need to find these from api - define as const for now
  //const totalOpenProposals = 10;
  //const totalApprovedProposals = 0;
  //const totalProposals = 0;
  const totalTreasurySpendable = 1.95;
  const totalTreasuryAvailable = 2.85;
  const daysElapsedToBurn = 4;
  const daysRemainToBurn = 24;
  const totalNextBurn = 349.2;
  const [percentOfTreasury, setPrecentOfTreasury] = useState(65);
  const percentDaysRemaining = 75; //100 * (28 - 4) / 28;

  //const reserved =1000000;
  //const feeFrozen=1000000000;
  //const miscFrozen=100000;
  //const numberTransactions = 1;
  //const accountWhereBonded=['staking', 'voting'] //check these??
  //const accountWhereLocked=['staking', 'voting'] //check these??
  //const accountWhereReserved=['proposal', 'referendum'] //check these??
  //const existentialDeposit = 10000000000;
  //const maxReserves = 50;
  //const maxLocks = 50;

  //const totalWithdrawls=1000000;
  //const totalFeesPaid=10000;
  //const totalTxRx=1000000;

  //const totalBalance = 10.0002
  //const totalTransferrable = 4.800007
  //const totalLocked = 5.200034
  //const bonded = 2.20087
 
  let dataArray = (test === 'yes') ? [
    { id: '0001', title: '🙈 Tip Monkey so he does not eat all the bananas.',   posted: '🤖 gropo', 	type: 'proposal', 	status: '✅ Yes', 		action: '💰 Bond', 	  detail: 'Proposed' },
    { id: '0002', title: '🤡 Fund Poka-Gropo-in-the-Eye Hackathon 2023 ',       posted: '🐵 monkey', 	type: 'tip', 		status: '✅ Yes', 		action: '👍 Council', detail: 'Passed'  },
    { id: '0003', title: '🐶 Do something about the dog Food 💩 ',              posted: '🦌 moose', 	type: 'proposal', 	status: '✅ Yes', 	action: '💰 Bond', 	  detail: 'Proposed'  },
    { id: '0004', title: '😵 Get the dogs to stop wrestling ',                  posted: '🦆 goose', 	type: 'treasury', 	status: '✅ Yes', 		action: '👍 Council', detail: 'Awarded'  },
    { id: '0005', title: '🦆 Give Goose some 💵 from Treasury ',                posted: '👩🏻‍🦱 alice', 	type: 'treasury', 	status: '✅ Yes', 	action: '👍 Council', detail: 'Proposed'  },
    { id: '0006', title: '🦌 Tip Moose just because ',                          posted: '🧑🏻‍🦱 bob', 		type: 'tip', 		status: '✅ Yes', 		action: '👍 Council', detail: 'Tabled'  },
    { id: '0007', title: '🤖 Ban Gus cuz he is NOT awesome ',                   posted: '👨🏽‍🦱 dave', 		type: 'motion', 	status: '✅ Yes', 		action: '👍 Council', detail: 'Closed'  },
    { id: '0008', title: '👾 Bug Bag Referenda! ',                              posted: '👩🏻‍🦰 eve', 		type: 'referenda', 	status: '✅ Yes', 		action: '👍 👎 Vote', detail: 'Started'  },
    { id: '0009', title: '🤖 Dont Ban Gus cuz he IS awesome! ',                 posted: '👨🏽‍🦱 dave', 		type: 'motion', 	status: '✅ Yes', 		action: '👍 Council', detail: 'Tabled'  },
    { id: '0010', title: '🙈 Is this really a referenda Monkey? ',              posted: '🤖 gropo', 	type: 'referenda', 	status: '✅ Yes', 		action: '👍 👎 Vote', detail: 'Passed'  },
    { id: '0011', title: '🤡 Tip EVERYONE! ',                                   posted: '👨🏽‍🦱 dave', 		type: 'tip', 		status: '✅ Yes', 		action: '👍 Council', detail: 'Executed'  },
    { id: '0012', title: '🦌 Give Moose coin, and lots of it! ',                posted: '🦌 moose', 	type: 'proposal', 	status: '✅ Yes', 	action: '💰 Bond',    detail: 'Rejected'  },
    { id: '0013', title: '🙈 Someone hunt down that damn Monkey! ',             posted: '👨🏽‍🦱 dave', 		type: 'bounty', 	status: '✅ Yes', 		action: '👍 Council', detail: 'Tabled'  },
    { id: '0014', title: '🙈 Tip the Monkey. ',                                 posted: '🤖 gropo', 	type: 'tip', 		status: '✅ Yes', 		action: '👍 Council', detail: 'Opened'  },
    { id: '0015', title: '🦌 Tip the Moose. ',                                  posted: '🦌 moose', 	type: 'tip', 		status: '✅ Yes', 	action: '👍 Council', detail: 'Rejected'  },
    { id: '0016', title: '🙈 Someone hunt down that damn Monkey! ',             posted: '👱🏼‍♂️ charlie', 	type: 'bounty', 	status: '✅ Yes', 		action: '👍 Council', detail: 'Passed'  },
    { id: '0017', title: '🙈 Just another Monkey referenda? ',                  posted: '🤖 gropo', 	type: 'referenda', 	status: '✅ Yes', 		action: '👍 👎 Vote', detail: 'Proposed'  },
    { id: '0018', title: '🤡 Fix something on the backend. ',                   posted: '🦆 goose', 	type: 'bounty', 	status: '✅ Yes', 		action: '👍 Council', detail: 'Opened'  },
    { id: '0019', title: '🦌 Give Gropo coin, and lots of it! ',                posted: '🦌 moose', 	type: 'proposal', 	status: '✅ Yes', 	action: '💰 Bond',    detail: 'Awarded'  }
 ] : [];

function intiTotals() {
  let awardTotal = dataArray.filter(idIndex => idIndex.detail === 'Awarded').map(idIndex => (idIndex.id)).length;
  let closedTotal = dataArray.filter(idIndex => idIndex.detail === 'Closed').map(idIndex => (idIndex.id)).length;
  let propTotal = dataArray.filter(idIndex => idIndex.type === 'proposal').map(idIndex => (idIndex.id)).length;
  let tipTotal = dataArray.filter(idIndex => idIndex.type === 'tip').map(idIndex => (idIndex.id)).length;
  let refTotal = dataArray.filter(idIndex => idIndex.type === 'referenda').map(idIndex => (idIndex.id)).length;
  let bountyTotal = dataArray.filter(idIndex => idIndex.type === 'bounty').map(idIndex => (idIndex.id)).length;
  let motionTotal = dataArray.filter(idIndex => idIndex.type === 'motion').map(idIndex => (idIndex.id)).length;
  let treasuryTotal = dataArray.filter(idIndex => idIndex.type === 'treasury').map(idIndex => (idIndex.id)).length;
  let allTotal = propTotal + tipTotal + refTotal + bountyTotal + motionTotal + treasuryTotal
  setTotal({id1: allTotal, id2: 0, id3: propTotal, id4: refTotal, id5: motionTotal, id6: treasuryTotal, id7: bountyTotal, id8: tipTotal})
  //const openPropTotal = (allTotal - closedTotal) > 0 ? (allTotal - closedTotal) : 0
  setOpenTotal(allTotal - closedTotal);
  setApprovedTotal(awardTotal);
  //console.log(openTotal)
  setPrecentOfTreasury(Math.floor(100 * (totalTreasurySpendable/totalTreasuryAvailable)));
  return;
}


function initSelSwitch(search) {
    switch(search) {
        case "all":
            setSelSwitch({id1: 'blue', id2: 'teal', id3: 'teal', id4: 'teal', id5: 'teal', id6: 'teal', id7: 'teal', id8: 'teal'});
            break;
        case "my list":
            setSelSwitch({id1: 'teal', id2: 'blue', id3: 'teal', id4: 'teal', id5: 'teal', id6: 'teal', id7: 'teal', id8: 'teal'});
            break;
        case "proposal":
            setSelSwitch({id1: 'teal', id2: 'teal', id3: 'blue', id4: 'teal', id5: 'teal', id6: 'teal', id7: 'teal', id8: 'teal'});
            break;
        case "referenda":
            setSelSwitch({id1: 'teal', id2: 'teal', id3: 'teal', id4: 'blue', id5: 'teal', id6: 'teal', id7: 'teal', id8: 'teal'});
            break;
        case "motion":
            setSelSwitch({id1: 'teal', id2: 'teal', id3: 'teal', id4: 'teal', id5: 'blue', id6: 'teal', id7: 'teal', id8: 'teal'});
            break;
        case "treasury":
            setSelSwitch({id1: 'teal', id2: 'teal', id3: 'teal', id4: 'teal', id5: 'teal', id6: 'blue', id7: 'teal', id8: 'teal'});
            break;
        case "bounty":
            setSelSwitch({id1: 'teal', id2: 'teal', id3: 'teal', id4: 'teal', id5: 'teal', id6: 'teal', id7: 'blue', id8: 'teal'});
            break;
        case "tip":
            setSelSwitch({id1: 'teal', id2: 'teal', id3: 'teal', id4: 'teal', id5: 'teal', id6: 'teal', id7: 'teal', id8: 'blue'});
            break;
        default:
            setSelSwitch({id1: 'blue', id2: 'teal', id3: 'teal', id4: 'teal', id5: 'teal', id6: 'teal', id7: 'teal', id8: 'teal'});
      }
    return
} 
function initTest() {
  setTest(test === 'yes' ? 'no' : 'yes');
}

function getAllData() {
    intiTotals();
    initSelSwitch('all');
    setArrayFilter('all')
    return;
}
function getMyListData() {
  intiTotals();
  initSelSwitch('my list');
    return;
}
function getProposalData() {
    //searchType('proposal');
    intiTotals();
    initSelSwitch('proposal');
    setArrayFilter('proposal');
    return;
}
function getBountyData() {
  intiTotals();
  initSelSwitch('bounty');
    setArrayFilter('bounty');
    return;
}
function getMotionData() {
  intiTotals();
  initSelSwitch('motion');
    setArrayFilter('motion');
    return;
}
function getTreasuryData() {
  intiTotals();
  initSelSwitch('treasury');
    setArrayFilter('treasury');
    return;
}
function getReferendaData() {
  intiTotals();
  initSelSwitch('referenda');
    setArrayFilter('referenda');
    return;
}
function getTipData() {
  intiTotals();
  initSelSwitch('tip');
    setArrayFilter('tip');
    return;
}


function VoteYesButton() {
    setVote('👍 Aye')
return; 
}
function VoteNoButton() {
    setVote('👎 Nay')
return; 
}
function VoteNoneButton() {
    setVote('none')
return; 
}
 
  
  useEffect(() => {
    const addresses = keyring.getPairs().map(account => account.address)
    let unsubscribeAll = null

    api.query.system.account
      .multi(addresses, balances => {
        const balancesMap = addresses.reduce(
          (acc, address, index) => ({
            ...acc,
            [address]: balances[index].data.free.toHuman(),
          }),
          {}
        )
        //initSelSwitch('proposal')
        //initFilterArray()

        intiTotals()
        setBalances(balancesMap)
      })
      .then(unsub => {
        unsubscribeAll = unsub
      })
      .catch(console.error)

    return () => unsubscribeAll && unsubscribeAll()
  }, [api, keyring, setBalances])

  const availableAccounts = []
  accounts.map(account => {
    return availableAccounts.push({
      key: account.meta.name,
      text: account.meta.name,
      value: account.address,
    })
    })


  return (
    <Grid.Column>

      <h1>
      <Modal trigger={<Icon link name="info circle" />}>
                    <Modal.Header>Proposal Submit, Track, Vote and Endorse</Modal.Header>
                    <Modal.Content scrolling wrapped>
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
                           <strong>Proposal (as a future Referendum): </strong>{infoProposal}<br></br>
                           <strong>Referenda: </strong>{infoReferenda}<br></br>
                           <strong>Treasury Proposal: </strong>{infoTreasury}<br></br>
                           <strong>Motion: </strong>{infoMotion}<br></br>
                           <strong>Tips: </strong>{infoTips}<br></br>
                           <strong>Bounty Proposals: </strong>{infoBounty}<br></br>
                    </Segment>
                    </Table.Row>
                           <Segment>
                           <Button basic color='red' onClick={initTest}> Run Test? </Button>
                           <Label color='red' >{test}</Label>
                    </Segment>
                    </Modal.Description>
                    </Modal.Content>
                    </Modal>        
                    Proposal Submit, Track, Vote and Endorse</h1>    
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
                <Statistic.Value>{totalTreasurySpendable} / {totalTreasuryAvailable} M GEODE</Statistic.Value>
                </Statistic>   
        </Table.Cell>
        
        <Table.Cell><div style={{ width: 50, height: 50 }}>
        <CircularProgressbar
                value={percentOfTreasury}
                text={`${percentOfTreasury}%`}
                styles={buildStyles({
                textSize: '18px',
                // How long animation takes to go from one percentage to another, in seconds
                //pathTransitionDuration: 0.5,
                // Can specify path transition in more detail, or remove it entirely
                // pathTransition: 'none',
                pathColor: `rgba(255, 0, 0, ${percentOfTreasury / 100})`,
                textColor: 'white',
                trailColor: '#d6d6d6',
                backgroundColor: '#3e98c7',
                })}/></div></Table.Cell>
        <Table.Cell>
                <Statistic size='mini'>
                <Statistic.Label> Open </Statistic.Label>
                <Statistic.Value>{openTotal} </Statistic.Value>
                </Statistic>                 
        </Table.Cell>
        <Table.Cell>
                <Statistic size='mini'>
                <Statistic.Label> Approved</Statistic.Label>
                <Statistic.Value>{approvedTotal} </Statistic.Value>
                </Statistic>                 
        </Table.Cell>
        <Table.Cell>
                <Statistic size='mini'>
                <Statistic.Label> Total</Statistic.Label>
                <Statistic.Value>{total.id1} </Statistic.Value>
                </Statistic>                 
        </Table.Cell>
        <Table.Cell>
                <Statistic size='mini'>
                <Statistic.Label> Days Remaining/Elapsed</Statistic.Label>
                <Statistic.Value>{daysRemainToBurn} / {daysElapsedToBurn} Days </Statistic.Value>
                </Statistic>    
        </Table.Cell>
        <Table.Cell><div style={{ width: 50, height: 50 }}>
        <CircularProgressbar
                value={percentDaysRemaining}
                text={`${percentDaysRemaining}%`}
                styles={buildStyles({
                textSize: '18px',
                // How long animation takes to go from one percentage to another, in seconds
                //pathTransitionDuration: 0.5,
                // Can specify path transition in more detail, or remove it entirely
                // pathTransition: 'none',
                pathColor: `rgba(255, 0, 0, ${percentDaysRemaining / 100})`,
                textColor: 'white',
                trailColor: '#d6d6d6',
                backgroundColor: '#3e98c7',
                })}/></div></Table.Cell>
        <Table.Cell>
                <Statistic size='mini'>
                <Statistic.Label> Next Burn</Statistic.Label>
                <Statistic.Value>{totalNextBurn} K GEODE </Statistic.Value>
                </Statistic>    
        </Table.Cell>
      </Table.Row>
      </Table>
  
   <Label.Group >
    <Label circular color={selSwitch.id1}> {total.id1}</Label> <Label tag as='a' onClick={getAllData}>ALL </Label>
    <Label circular color={selSwitch.id2}> {total.id2}</Label> <Label tag as='a' onClick={getMyListData}>MY LIST   </Label>
    <Label circular color={selSwitch.id3}> {total.id3}</Label> <Label tag as='a' onClick={getProposalData}>PROPOSAL </Label>
    <Label circular color={selSwitch.id4}> {total.id4}</Label> <Label tag as='a' onClick={getReferendaData}>REFERENDA </Label>
    <Label circular color={selSwitch.id5}> {total.id5}</Label> <Label tag as='a' onClick={getMotionData}>MOTION   </Label>
    <Label circular color={selSwitch.id6}> {total.id6}</Label> <Label tag as='a' onClick={getTreasuryData}>TREASURY  </Label>
    <Label circular color={selSwitch.id7}> {total.id7}</Label> <Label tag as='a' onClick={getBountyData}>BOUNTY  </Label>
    <Label circular color={selSwitch.id8}> {total.id8}</Label> <Label tag as='a' onClick={getTipData}>TIP      </Label>
  </Label.Group>

      {accounts.length === 0 ? (
        <Label basic color="yellow">
          No proposals to be shown
        </Label>
      ) : (
        <Table celled striped size="small">
          <Table.Body>
            <Table.Row>
              <Table.Cell width={3} textAlign="left">
              <Modal trigger={<Icon link name="info circle" />}>
                    <Modal.Header>Information - Number</Modal.Header>
                    <Modal.Content scrolling wrapped>
                    <Modal.Description>
                           <strong>Description: </strong>{infoName} <br></br>
                           {infoNameAdditional} <br></br>
                    </Modal.Description>
                    </Modal.Content>
                    </Modal>


                <Label color='teal'><strong>No.</strong></Label>
              </Table.Cell>
              <Table.Cell width={4}>
              <Modal trigger={<Icon link name="info circle" />}>
                    <Modal.Header>Information - Title</Modal.Header>
                    <Modal.Content scrolling wrapped>
                    <Modal.Description>
                           <strong>Description: </strong>{infoName} <br></br>
                           {infoNameAdditional} <br></br>
                    </Modal.Description>
                    </Modal.Content>
                </Modal>

                <Label color='teal'><strong>Title</strong></Label> 
                <Label>Submit Proposal</Label>
            <Modal 
                  onClose={() => setOpen(false)}
                  onOpen={() => setOpen(true)}
                  open={open}                  
                  trigger={<Button basic circular compact size='mini' color='blue' icon='envelope'/>}>
            <Modal.Header>Submit a Proposal</Modal.Header>

            <Modal.Content scrolling wrapped>
            <Modal.Description>
            <Modal.Actions>
                <Container> 
                <Grid.Column width={8}>
                    <Form>
                    <Form.Field>
                    <Label basic color="teal">
                    <Icon name="hand point right" />1 Unit = 1000000000000&nbsp;
                    </Label>
                    <Label
                    basic
                    color="teal"
                    style={{ marginLeft: 0, marginTop: '.5em' }}>
                    <Icon name="hand point right" />
                    Transfer more than the existential amount for account with 0 balance
                    </Label>
                    <Button Button 
                    basic 
                    circular 
                    compact size='mini' 
                    color='teal' 
                    icon='times'    
                    textAlign='right'  
                    onClick={() => setOpen(false)}>
                    </Button>
                    </Form.Field>
                <Form.Field>
                <Dropdown
                    inline
                    placeholder="Select from available addresses"
                    options={availableAccounts}
                    state="addressTo"
                    onChange={onChange}/>
                </Form.Field>
                <Form.Field>
                <Input
                    fluid
                    label="To"
                    type="text"
                    placeholder="address"
                    value={addressTo}
                    state="addressTo"
                    onChange={onChange}/>
                </Form.Field>
                <Form.Field>
                <Input
                    fluid
                    label="Amount"
                    type="number"
                    state="amount"
                    defaultValue={addressTo}
                    onChange={onChange}/>
                </Form.Field>
                <Form.Field style={{ textAlign: 'left' }}>
                <TxButton
                    label="Submit"
                    type="SIGNED-TX"
                    setStatus={setStatus}
                    attrs={{
                    palletRpc: 'balances',
                    callable: 'transfer',
                    inputParams: [addressTo, amount],
                    paramFields: [true, true],
                    }}/>
                <Button onClick={() => setOpen(false)}>Close</Button>
                </Form.Field>
                <div style={{ overflowWrap: 'break-word' }}>{status}</div>
                </Form>
                </Grid.Column></Container>  
            </Modal.Actions>
            </Modal.Description>
            </Modal.Content>
        </Modal>
              </Table.Cell>
              <Table.Cell width={3}>
              <Modal trigger={<Icon link name="info circle" />}>
                    <Modal.Header>Information - Type</Modal.Header>
                    <Modal.Content scrolling wrapped>
                    <Modal.Description>
                           {infoType} <br></br> 
                    </Modal.Description>
                    </Modal.Content>
                </Modal>
                <Label color='teal'><strong>Type</strong></Label>

              </Table.Cell>
              <Table.Cell width={5}>  
              <Modal trigger={<Icon link name="info circle" />}>
                    <Modal.Header>Information - Status</Modal.Header>
                    <Modal.Content scrolling wrapped>
                    <Modal.Description>
                           {infoStatus} <br></br> 
                    </Modal.Description>
                    </Modal.Content>
                </Modal>

                <Label color='teal'><strong>Status </strong></Label>  
              </Table.Cell>
            </Table.Row>

            {dataArray.filter(
                function(idIndex) {
                  if (arrayFilter === 'all') {
                    return idIndex.status === '✅ Yes'} else {
                      return idIndex.type === arrayFilter
                    }
                }
                ).map(idIndex => (
              <Table.Row key={idIndex.id}>
                <Table.Cell width={2} textAlign="right">           
                <Modal trigger={<Button basic circular compact size='mini' color='blue' icon='thumbs up'/>}>
                    <Modal.Header>Vote - Proposal No. {idIndex.id} {idIndex.title} </Modal.Header>
                        <Modal.Content scrolling wrapped>
                            <Modal.Description>                          
                                <Segment>
                                    For Proposal No. {idIndex.id} {idIndex.title} I vote -  
                                    <Button basic circular compact size='mini' color='blue' icon='thumbs up' onClick={VoteYesButton}/>
                                    <Button basic circular compact size='mini' color='blue' icon='thumbs down' onClick={VoteNoButton} />
                                    
                                    <Label basic color='blue'> {vote} </Label>
                                </Segment>
                                <Segment>
                                <Form.Field>
                	<Dropdown
                    	inline
                    	placeholder="Select from available addresses"
                    	options={availableAccounts}
                    	state="addressTo"
                    	onChange={onChange}/>
                	</Form.Field>
                    <br></br>
                	<Form.Field>
                	<Input
                    	fluid
                    	label="From"
                    	type="text"
                    	placeholder="address"
                    	value={addressTo}
                    	state="addressTo"
                    	onChange={onChange}/>
                    </Form.Field>
                                <br></br>
                                <strong>Transaction Fee: 1.00 Geode </strong> 
                                <br></br><br></br>
                       <Form.Field>
                	    <Input
                    	    fluid
                    	    label="Amount"
                    	    type="number"
                    	    state="amount"
                    	    defaultValue={addressTo}
                    	    onChange={onChange}/>
                	    </Form.Field>
                        <br></br>
                        <Form.Field>
                        <Input
                            fluid
                            label="Enter Password"
                            type="text"
                            placeholder="password"/>
                        </Form.Field>
                        </Segment>
                            <Button.Group> 
                                <TxButton
                    	            label="Submit"
                    	            type="SIGNED-TX"
                    	            setStatus={setStatus}
                    	            attrs={{
                    	            palletRpc: 'balances',
                    	            callable: 'transfer',
                    	            inputParams: [addressTo, amount],
                    	            paramFields: [true, true],
                    	            }} />
                                <Button.Or />
                                <Button color='orange'>Cancel</Button>
                                <Button.Or />
                                <Button onClick={VoteNoneButton}>Reset Vote </Button>
                            </Button.Group>
                            <br></br><br></br>
                            <div style={{ overflowWrap: 'break-word' }}><Label color='blue'>{status}</Label></div>
                </Modal.Description></Modal.Content>
            </Modal>

                <Modal trigger={<Button basic circular compact size='mini' color='blue' icon='check'/>}>
                    <Modal.Header>Endorse - Proposal No. {idIndex.id} {idIndex.title} </Modal.Header>
                        <Modal.Content scrolling wrapped>
                        <Modal.Description>                          
                        <Segment>
                                    Endorse Proposal No. {idIndex.id} {idIndex.title} &nbsp;  
                                    <Button basic circular compact size='mini' color='blue' icon='check'/> &nbsp;
                                    <Label basic color='orange'> ENDORSE </Label>                                 
                                </Segment>
                        <Segment>
                    <Form.Field>
                	<Dropdown
                    	inline
                    	placeholder="Select from available addresses"
                    	options={availableAccounts}
                    	state="addressTo"
                    	onChange={onChange}/>
                	</Form.Field>
                    <br></br>
                	<Form.Field>
                	<Input
                    	fluid
                    	label="From"
                    	type="text"
                    	placeholder="address"
                    	value={addressTo}
                    	state="addressTo"
                    	onChange={onChange}/>
                    </Form.Field>
                    <br></br><strong>Transaction Fee: 1.00 Geode </strong> <br></br><br></br>
                    <Form.Field>
                	    <Input
                    	    fluid
                    	    label="Amount"
                    	    type="number"
                    	    state="amount"
                    	    defaultValue={addressTo}
                    	    onChange={onChange}/>
                	</Form.Field><br></br>
                    <Form.Field>
                        <Input
                            fluid
                            label="Enter Password"
                            type="text"
                            placeholder="password"/>
                    </Form.Field>
                        </Segment>
                            <Button.Group> 
                                <TxButton
                    	            label="Submit"
                    	            type="SIGNED-TX"
                    	            setStatus={setStatus}
                    	            attrs={{
                    	            palletRpc: 'balances',
                    	            callable: 'transfer',
                    	            inputParams: [addressTo, amount],
                    	            paramFields: [true, true],
                    	            }} />
                                <Button.Or />
                                <Button color='orange'>Cancel</Button>
                            </Button.Group>
                            <br></br><br></br>
                            <div style={{ overflowWrap: 'break-word' }}>{status}</div>
                </Modal.Description></Modal.Content>
            </Modal>



                  <Label basic color='blue'>{idIndex.id}</Label>
                </Table.Cell>
                
                <Table.Cell width={7}>
                  <Modal trigger={<Button basic circular compact size='mini' color='blue' icon='info'/>}>
                    <Modal.Header>Proposal #{idIndex.id}: {idIndex.title}</Modal.Header>
                    <Modal.Content scrolling wrapped>
                    <Modal.Description>
                        <Table basic='very' textAlign='left' verticalAlign='middle'>  
                        <Table.Header>  
                         
                        </Table.Header>
                        <Table.Body>
                        <Table.Row>
                          <Table.Cell><strong>Status: <Label basic color='teal'> {idIndex.detail} </Label></strong></Table.Cell>
                          <Table.Cell><strong>Posted by: <Label basic color='blue'>{idIndex.posted}</Label></strong></Table.Cell>
                          <Table.Cell><strong> On: Mon Oct 3 11:44 am @ Block: 123456 </strong></Table.Cell>
                        </Table.Row>
                        <Table.Row>  
                          <Table.Cell><strong>Type: <Label basic color='orange'> {idIndex.type} </Label></strong></Table.Cell>
                          <Table.Cell><strong>Finalized: <Label basic color='teal'>{idIndex.status}</Label></strong> </Table.Cell>
                          <Table.Cell><strong>Required Action: <Label basic color='teal'> {idIndex.action}</Label></strong></Table.Cell>
                        </Table.Row>                           
                           <Table.Row>
                             <Table.Cell></Table.Cell>                      
                             <Table.Cell></Table.Cell>                      
                             <Table.Cell></Table.Cell>                      
                           </Table.Row>                      
                           </Table.Body>
                        </Table>

                        <Table.Row>
                        <strong>Description: </strong>  
                        <br></br>
                           <br></br>
                        <strong>Term: </strong><br></br>{proposalTerm} <br></br><br></br>
                           <strong>Links and further details:</strong><br></br>
                           {proposalDetails} <br></br>
                           {proposalComments} <br></br><br></br>
                           </Table.Row>
                           <Table.Row>

                        <Table basic='very' textAlign='left' verticalAlign='middle'>  
                        <Table.Header></Table.Header>
                        <Table.Body>
                        <Table.Row>
                          <Table.Cell><strong>Endorsments: <Label color='teal'> 5 </Label></strong> </Table.Cell>
                          <Table.Cell><strong>Vote Tally: <Label basic color='orange'> 👍 {0} 👎 {0} </Label></strong></Table.Cell>
                          <Table.Cell><strong>   End of Voting Period: <Label basic color='teal'> Novenber 8, 2022 </Label></strong></Table.Cell>
                        </Table.Row>
                        </Table.Body>
                        </Table>
                           <br></br>
                           </Table.Row>
                           <Table.Row>
                           <strong>Timeline:</strong><br></br>
                      <Table>
                        <Table.Body>
                           <Table.Row>
                            <Table.Cell><Icon link name="clock" /> Mon Oct 3 11:44 am @ Block: 123456</Table.Cell> 
                            <Table.Cell><Label basic color='orange'> Proposed </Label></Table.Cell>
                            <Table.Cell><Label basic color='blue'> 🐵 Monkey </Label><br></br></Table.Cell>
                           </Table.Row>
                           <Table.Row>
                            <Table.Cell><Icon link name="clock" /> Tue Oct 3 12:15 pm @ Block: 123676</Table.Cell> 
                            <Table.Cell><Label basic color='teal'> Endorsed </Label></Table.Cell>
                            <Table.Cell><Label basic color='blue'> 🐵 Monkey </Label><br></br></Table.Cell>
                           </Table.Row>
                           <Table.Row>
                            <Table.Cell><Icon link name="clock" /> Tue Oct 3 1:15 pm @ Block: 125456</Table.Cell> 
                            <Table.Cell><Label basic color='teal'> Endorsed </Label></Table.Cell>
                            <Table.Cell><Label basic color='blue'> 👩🏻‍🦰 Alice </Label><br></br></Table.Cell>
                           </Table.Row>
                           <Table.Row>
                            <Table.Cell><Icon link name="clock" /> Tue Oct 3 1:15 pm @ Block: 125456</Table.Cell> 
                            <Table.Cell><Label basic color='teal'> Endorsed </Label></Table.Cell>
                            <Table.Cell><Label basic color='blue'> 👩🏻‍🦱 Eve </Label><br></br></Table.Cell>
                           </Table.Row>
                           <Table.Row>
                            <Table.Cell><Icon link name="clock" /> Tue Oct 3 1:15 pm @ Block: 125456</Table.Cell> 
                            <Table.Cell><Label basic color='teal'> Endorsed </Label></Table.Cell>
                            <Table.Cell><Label basic color='blue'> 👱🏼‍♂️ Bob </Label><br></br></Table.Cell>
                           </Table.Row>
                           <Table.Row>
                            <Table.Cell><Icon link name="clock" /> Tue Oct 3 1:15 pm @ Block: 125456</Table.Cell> 
                            <Table.Cell><Label basic color='teal'> Endorsed </Label></Table.Cell>
                            <Table.Cell><Label basic color='blue'> 👨🏽‍🦱 Steve </Label><br></br></Table.Cell>
                           </Table.Row>
                       </Table.Body>                          
                      </Table>
                    </Table.Row>
        </Modal.Description></Modal.Content></Modal>    
        <span style={{ display: 'inline-block', minWidth: '31em' }}>
                    {idIndex.title}
                  </span>


                </Table.Cell>
                <Table.Cell width={4}>
                  {idIndex.type}
                </Table.Cell>
                <Table.Cell width={5}>
                  {idIndex.detail}
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      )}
    </Grid.Column>
      )
}
