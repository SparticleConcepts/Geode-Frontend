import React, { useEffect, useState, useRef } from 'react'
import { Segment, Menu, Statistic, Dropdown, Container, Form, Icon, Input, Modal, Table, Grid, Button, Label } from 'semantic-ui-react'
import { CopyToClipboard } from 'react-copy-to-clipboard'
import { useSubstrateState } from './substrate-lib'
import { TxButton } from './substrate-lib/components'

// --- Council Panel ---
// members(): Vec<AccountId32>
// interface: api.query.council.members
// summary: The current members of the collective. This is stored sorted (just by value).
// output: [5ECEokK7A385459o1aYyHtkGqsmDKMNw8sgTAVjUQMub92LA]
// ---------------------
// prime(): Option<AccountId32>
// interface: api.query.council.prime
// summary: The prime member that helps determine the default vote behavior in case of absentations.
// output
// ---------------------
// proposalCount(): u32
// interface: api.query.council.proposalCount
// summary: Proposals so far.
// ---------------------
// proposalOf(H256): Option<Call>
// interface: api.query.council.proposalOf
// summary: Actual proposal for a given hash, if it's current.
// ---------------------
// proposals(): Vec<H256>
// interface: api.query.council.proposals
// summary: The hashes of the active proposals.
// ---------------------
// voting(H256): Option<PalletCollectiveVotes>
// interface: api.query.council.voting
// summary: Votes on a given proposal, if it is ongoing.
// ---------------------

export default function Main(props) {
//test array - remove for production
// let dataArray = [
//     { id: '0001', name: 'alice  ', type: 'member   ', yourVote: '👍 Yay',  totalVotes: '10', voteBlock: '1001'},
//     { id: '0002', name: 'bob    ', type: 'member   ', yourVote: '👎 Nay',  totalVotes: '1', voteBlock: '1001'},
//     { id: '0003', name: 'charlie', type: 'member   ', yourVote: '👍 Yay',  totalVotes: '3', voteBlock: '1001'},
//     { id: '0004', name: 'dave   ', type: 'member   ', yourVote: '👍 Yay',  totalVotes: '2', voteBlock: '1001'},
//     { id: '0005', name: 'eve    ', type: 'member   ', yourVote: '👍 Yay',  totalVotes: '6', voteBlock: '1001'},
//     { id: '0006', name: 'ferdie ', type: 'member   ', yourVote: '👎 Nay',  totalVotes: '5', voteBlock: '1001'},
//     { id: '0007', name: 'gus    ', type: 'member   ', yourVote: '👎 Nay',  totalVotes: '7', voteBlock: '1001'},
//     { id: '0008', name: 'gropo  ', type: 'runner up', yourVote: '👍 Yay',  totalVotes: '3', voteBlock: '1001'},
//     { id: '0009', name: 'monkey ', type: 'runner up', yourVote: '👍 Yay',  totalVotes: '5', voteBlock: '1001'},
//     { id: '0010', name: 'moose  ', type: 'runner up', yourVote: '👍 Yay',  totalVotes: '9', voteBlock: '1001'},
//     { id: '0011', name: 'goose  ', type: 'runner up', yourVote: '👍 Yay',  totalVotes: '10', voteBlock: '1001'},
//     { id: '0012', name: 'amy    ', type: 'runner up', yourVote: '👍 Yay',  totalVotes: '12', voteBlock: '1001'},
//     { id: '0013', name: 'nala   ', type: 'runner up', yourVote: '👍 Yay',  totalVotes: '14', voteBlock: '1001'},
//     { id: '0014', name: 'max    ', type: 'runner up', yourVote: '👍 Yay',  totalVotes: '15', voteBlock: '1001'},
//   ];
  
const coinName = ' Geode';
    //transfers
    const [status, setStatus] = useState(null)
    const [formState, setFormState] = useState({ addressTo: '', amount: 0 })
  
    const onChange = (_, data) =>
      setFormState(prev => ({ ...prev, [data.state]: data.value }))
  
    const { addressTo, amount } = formState

 //   const [voteArray, setVoteArray] = useState({})
//transfers  
  const infoBalances ='The Substrate Balances pallet managers user funds for accounts. Use this user interface to \n(1) view the distribution of account balances, \n(2) transfer funds between accounts'
  const infoName ='This is the Public Key Address for the account. ';
  //const infoNameAdditional = 'NOTE: Please keep secret keys in a secure location and \nnot stored in locations that can be accessed when your computer is connected to the internet.'
  //const infoAvailableBalance = 'Available Balance for transactions, fees, etc.\n Use the green transaction button to transfer funds to other account addresses.'
  //const infoTotalBalance = 'There are four (4) types of balances, free, reserved, \nmiscFrozen and feeFrozen. Usable balance = free - miscFrozen - feeFrozen.'
  //const infoFreeBalance = 'On Geode, four different balance types indicate whether your balance can be used for transfers, to pay fees, or must remain frozen and unused due to an on-chain requirement. \nThe AccountData struct defines the balance types in Substrate. \nThe four types of balances include free, reserved, misc_frozen (miscFrozen in camel-case), and fee_frozen (feeFrozen in camel-case). \nIn general, the usable balance of the account is the amount that is free minus any funds that are considered frozen (either misc_frozen or fee_frozen), depending on the reason for which the funds are to be used. If the funds are to be used for transfers, then the usable amount is the free amount minus any misc_frozen funds. However, if the funds are to be used to pay transaction fees, the usable amount would be the free funds minus fee_frozen. \nThe total balance of the account is considered to be the sum of free and reserved funds in the account. Reserved funds are held due to on-chain requirements and can usually be freed by taking some on-chain action. For example, the Identity pallet reserves funds while an on-chain identity is registered, but by clearing the identity, you can unreserve the funds and make them free again.'
  const { api, keyring } = useSubstrateState()
  const accounts = keyring.getPairs()
  const [balances, setBalances] = useState({})

  const [open, setOpen] = React.useState(false)

  //- dev info. - need to find these from api - define as const for now
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

  const totalWithdrawls=1000000;
  const totalFeesPaid=10000;
  const totalTxRx=1000000;

  const countMembers = useRef(13);
  const countRunnerUps = useRef(16);
  const countYourVotes = useRef(0);
  const valueVoteBond = useRef(0);
  const d = new Date();
  //let dayStartVote = d.getDate();
  let dayStartVote = d.toDateString();
//  const totalMembers = 13;
//  const totalTransferrable = 4.800007
//  const totalLocked = 5.200034
//  const bonded = 2.20087
  
// useEffect(() => {
//   const getInfo = async () => {
//     try {
//       const [proposalCount, 
//              approvals,  
//              balance, 
//              proposals,
//              blockNumber,
//              chain
//             ] = await Promise.all([
//         api.query.treasury.proposalCount(),
//         api.query.treasury.approvals(), 
//         api.query.system.account(treasuryAddress),
//         api.query.treasury.proposals(proposalIndex.current),
//         api.query.system.number(),
//         api.rpc.system.chain()
//     ])
//       setChainData({ proposalCount, 
//                      approvals, 
//                      balance, 
//                      proposals, 
//                      blockNumber,
//                      chain })
//     } catch (e) {
//       console.error(e)
//     }
//   }
//   getInfo()
// })



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
        setBalances(balancesMap)
        //setVoteArray(dataArray)
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

  //  setVoteArray(dataArray)

  return (
    <Grid.Column>

      <h1>
      <Modal trigger={<Icon link name="info circle" />}>
                    <Modal.Header>Information - Vote for Council</Modal.Header>
                    <Modal.Content scrolling wrapped>
                    <Modal.Description>
                           <strong>Description: </strong>{infoBalances} <br></br>
                           <br></br>
                           <br></br>
                    </Modal.Description>
                    </Modal.Content>
                    </Modal>        
        Vote for Council Members</h1>    
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
                <Statistic.Label> Council Members</Statistic.Label>
                <Statistic.Value>{countMembers.current} </Statistic.Value>
                </Statistic>   
        </Table.Cell>
        <Table.Cell>
                <Statistic size='mini'>
                <Statistic.Label> Runner Ups</Statistic.Label>
                <Statistic.Value>{countRunnerUps.current} </Statistic.Value>
                </Statistic>                 
        </Table.Cell>
        <Table.Cell>
                <Statistic size='mini'>
                <Statistic.Label> Your Votes</Statistic.Label>
                <Statistic.Value>{countYourVotes.current} </Statistic.Value>
                </Statistic>    
        </Table.Cell>
        <Table.Cell>
                <Statistic size='mini'>
                <Statistic.Label> Your Bond</Statistic.Label>
                <Statistic.Value>{valueVoteBond.current} </Statistic.Value>
                </Statistic>    
        </Table.Cell>
        <Table.Cell>
                <Statistic size='mini'>
                <Statistic.Label> Period Starts</Statistic.Label>
                <Statistic.Value>{dayStartVote} </Statistic.Value>
                </Statistic>    
        </Table.Cell>
        <Table.Cell>
                <Statistic size='mini'>
                <Statistic.Label> Vote Duration</Statistic.Label>
                <Statistic.Value> 7 Days </Statistic.Value>
                </Statistic>    
        </Table.Cell>
      </Table.Row>
      </Table>
 
      {accounts.length === 0 ? (
        <Label basic color="yellow">
          No accounts to be shown
        </Label>
      ) : (
        <Table celled striped size="small">
          <Table.Body>
            <Table.Row>
              <Table.Cell width={3} textAlign="left">
              <Modal trigger={<Icon link name="info circle" />}>
                    <Modal.Header>Information - Council Member</Modal.Header>
                    <Modal.Content scrolling wrapped>
                    <Modal.Description>
                           <strong>Description: </strong>{infoName} <br></br>
                            <br></br>
                    </Modal.Description>
                    </Modal.Content>
                    </Modal>


                <Label color='teal'><strong>Council Member</strong></Label>
              </Table.Cell>
              <Table.Cell width={4}>
              <Modal trigger={<Icon link name="info circle" />}>
                    <Modal.Header>Information - Public Key Address</Modal.Header>
                    <Modal.Content scrolling wrapped>
                    <Modal.Description>
                           <strong>Description: </strong>{infoName} <br></br>
                            <br></br>
                    </Modal.Description>
                    </Modal.Content>
                </Modal>

                <Label color='teal'><strong>Public Key Address</strong></Label> 
                <Label>Vote Here!</Label>
            <Modal 
                  onClose={() => setOpen(false)}
                  onOpen={() => setOpen(true)}
                  open={open}                  
                  trigger={<Button basic circular compact size='mini' color='blue' icon='thumbs up'/>}>
            <Modal.Header>VOTE HERE!</Modal.Header>

            <Modal.Content scrolling wrapped>
            <Modal.Description>
                    <pre>
                        <code>                             
                        </code>
                    </pre>
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
                    style={{ marginLeft: 0, marginTop: '.5em' }}
                    >
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
                    onChange={onChange}
                />
                </Form.Field>

                <Form.Field>
                <Input
                    fluid
                    label="To"
                    type="text"
                    placeholder="address"
                    value={addressTo}
                    state="addressTo"
                    onChange={onChange}
                />
                </Form.Field>
                <Form.Field>
                <Input
                    fluid
                    label="Amount"
                    type="number"
                    state="amount"
                    defaultValue={addressTo}
                    onChange={onChange}
                />
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
                    }}
                />
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
              <Table.Cell width={5}>
              <Modal trigger={<Icon link name="info circle" />}>
                    <Modal.Header>Information - Your Vote</Modal.Header>
                    <Modal.Content scrolling wrapped>
                    <Modal.Description>
                         <br></br> 
                    </Modal.Description>
                    </Modal.Content>
                </Modal>
                <Label color='teal'><strong>Your Vote</strong></Label>
                  


              </Table.Cell>
              <Table.Cell width={4}>  
              <Modal trigger={<Icon link name="info circle" />}>
                    <Modal.Header>Information - Your Bond</Modal.Header>
                    <Modal.Content scrolling wrapped>
                    <Modal.Description>
                           <br></br> 
                    </Modal.Description>
                    </Modal.Content>
                </Modal>

                <Label color='teal'><strong>Your Bond </strong></Label>  
              </Table.Cell>

            </Table.Row>
            {accounts.map(account => (
              <Table.Row key={account.address}>
                <Table.Cell width={3} textAlign="right">
                  {account.meta.name}
                </Table.Cell>
                <Table.Cell width={8}>
                  <span style={{ display: 'inline-block', minWidth: '31em' }}>
                    {account.address}
                  </span>
                  <CopyToClipboard text={account.address}>
                    <Button
                      basic
                      circular
                      compact
                      size="mini"
                      color="blue"
                      icon="copy outline"
                    />
                  </CopyToClipboard>

                  <Modal trigger={<Button basic circular compact size='mini' color='blue' icon='info'/>}>
                    <Modal.Header>Member Information </Modal.Header>
                    <Modal.Content scrolling wrapped>
                    <Modal.Description>
                        <strong>Identity: </strong><Label color='teal'>{account.meta.name}</Label>
                        <br></br><br></br>
                        <strong>Public Key Address: </strong>
                        <Label basic color='teal'>{account.address}</Label>
                        <br></br>
                        
                        <br></br>
                        <Button circular icon='settings' />
                        <strong> Member Information: </strong><br></br>
                        <Segment>
                           Total balance: {balances[account.address]} {coinName}<br></br>
                           E-mail address gropo@blockandpurpose.com <br></br>
                           Judgement: ✅ Reasonable <br></br>
                           Discord: <br></br>
                        </Segment>
                           <br></br>
                           <Button circular icon='settings' />
                           <strong> Activity for this Account per Era:</strong><br></br>
                        <Segment>
                           total fees paid on all transactions: {totalFeesPaid} {coinName}<br></br>
                           total withdrawls from Account: {totalWithdrawls} {coinName}<br></br>
                           total transfers received: {totalTxRx} {coinName}<br></br>
                           <br></br>
                        </Segment>
                           <Button circular icon='settings' />
                           <strong> Voting History:</strong><br></br>
                           <Table celled>
                                <Table.Header>
                                <Table.Row>
                                    <Table.HeaderCell>Proposal</Table.HeaderCell>
                                    <Table.HeaderCell>Block</Table.HeaderCell>
                                    <Table.HeaderCell>Vote</Table.HeaderCell>
                                </Table.Row>
                                </Table.Header>

                                <Table.Body>
                                <Table.Row>
                                    <Table.Cell>
                                    <Label ribbon color='teal'>Proposal Id: 0001 - Tip Monkey</Label>
                                    </Table.Cell>
                                    <Table.Cell>1001</Table.Cell>
                                    <Table.Cell>👍 Yay</Table.Cell>
                                </Table.Row>
                                <Table.Row>
                                    <Table.Cell>Proposal Id: 0002 - Feed the dogs.</Table.Cell>
                                    <Table.Cell>1002</Table.Cell>
                                    <Table.Cell>👎 Nay</Table.Cell>
                                </Table.Row>
                                <Table.Row>
                                    <Table.Cell>Proposal Id: 0003 - Fund Poka-Your Gropo 2023</Table.Cell>
                                    <Table.Cell>9999</Table.Cell>
                                    <Table.Cell>👎 Nay</Table.Cell>
                                </Table.Row>
                                </Table.Body>

                                <Table.Footer>
                                <Table.Row>
                                    <Table.HeaderCell colSpan='3'>
                                    <Menu floated='right' pagination>
                                        <Menu.Item as='a' icon>
                                        <Icon name='chevron left' />
                                        </Menu.Item>
                                        <Menu.Item as='a'>1</Menu.Item>
                                        <Menu.Item as='a'>2</Menu.Item>
                                        <Menu.Item as='a'>3</Menu.Item>
                                        <Menu.Item as='a'>4</Menu.Item>
                                        <Menu.Item as='a' icon>
                                        <Icon name='chevron right' />
                                        </Menu.Item>
                                    </Menu>
                                    </Table.HeaderCell>
                                </Table.Row>
                                </Table.Footer>
                            </Table>

                           <br></br>
                    </Modal.Description>
                    </Modal.Content>
                </Modal>


                </Table.Cell>
                <Table.Cell width={4}>
                  {//balances && balances[account.address] && balances[account.address]
                  }
                </Table.Cell>
                <Table.Cell width={4}>
                  {balances &&
                    balances[account.address] &&
                    balances[account.address]}



                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      )}
    </Grid.Column>
  )
}
