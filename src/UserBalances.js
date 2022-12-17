import React, { useEffect, useState } from 'react'
import { Statistic, Dropdown, Container, Form, Icon, Input, Modal, Table, Grid, Button, Label } from 'semantic-ui-react'
import { CopyToClipboard } from 'react-copy-to-clipboard'
import { useSubstrateState } from './substrate-lib'
import { TxButton } from './substrate-lib/components'
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';


export default function Main(props) {
//transfers
    const [status, setStatus] = useState(null)
    const [formState, setFormState] = useState({ addressTo: '', amount: 0 })
  
    const onChange = (_, data) =>
      setFormState(prev => ({ ...prev, [data.state]: data.value }))
  
    const { addressTo, amount } = formState
//transfers  

// { "nonce":0,
//  "consumers":0,
//  "providers":1,
//  "sufficients":0,
//  "data":{"free":"0x00000000000000000de0b6b3a7640000",
//         "reserved":0,
//         "miscFrozen":0,
//         "feeFrozen":0}
// }

  let tokenName = 'coin'
  const blockTime = 6;
  const microToCoin = 1000000000000;
  const blksToDays = blockTime / 86400;
  const blksToHrs = blockTime / 3600;
  const blksToMins = blockTime / 60;
  const infoBalances ='This is a summary of your accounts.  Additional accounts can be added as necessary. The Substrate Balances pallet managers user funds for accounts. Use this user interface to \n(1) view the distribution of account balances, \n(2) transfer funds between accounts'
  const infoName ='This is the Public Key Address for the account. ';
  const infoNameAdditional = 'NOTE: Please keep secret keys in a secure location and \nnot stored in locations that can be accessed when your computer is connected to the internet.'
  const infoAvailableBalance = 'Available Balance for transactions, fees, etc.\n Use the green transaction button to transfer funds to other account addresses.'
  const infoTotalBalance = 'There are four (4) types of balances, free, reserved, \nmiscFrozen and feeFrozen. Usable balance = free - miscFrozen - feeFrozen.'
  const infoFreeBalance = 'On Geode, four different balance types indicate whether your balance can be used for transfers, to pay fees, or must remain frozen and unused due to an on-chain requirement. \nThe AccountData struct defines the balance types in Substrate. \nThe four types of balances include free, reserved, misc_frozen (miscFrozen in camel-case), and fee_frozen (feeFrozen in camel-case). \nIn general, the usable balance of the account is the amount that is free minus any funds that are considered frozen (either misc_frozen or fee_frozen), depending on the reason for which the funds are to be used. If the funds are to be used for transfers, then the usable amount is the free amount minus any misc_frozen funds. However, if the funds are to be used to pay transaction fees, the usable amount would be the free funds minus fee_frozen. \nThe total balance of the account is considered to be the sum of free and reserved funds in the account. Reserved funds are held due to on-chain requirements and can usually be freed by taking some on-chain action. For example, the Identity pallet reserves funds while an on-chain identity is registered, but by clearing the identity, you can unreserve the funds and make them free again.'

  const { api, keyring } = useSubstrateState()
  const accounts = keyring.getPairs()

  const [balances, setBalances] = useState({})
  const [reserved, setReserved] = useState({})
  const [miscFrozen, setMiscFrozen] = useState({})
  const [feeFrozen, setFeeFrozen] = useState({})

  const [open, setOpen] = React.useState(false)
  const [statData, setStatData] = useState({})

  
  useEffect(() => {
    const addresses = keyring.getPairs().map(account => account.address)
    let unsubscribeAll = null
    // query for free balance
    api.query.system.account
      .multi(addresses, balances => {
        const balancesMap = addresses.reduce(
          (acc, address, index) => ({
            ...acc,
            [address]: balances[index].data.free.toString(), //toHuman(),
          }),
          {}
        )
        setBalances(balancesMap)
      })
      // query for reserved balance
      api.query.system.account
      .multi(addresses, balances => {
        const balancesMap = addresses.reduce(
          (acc, address, index) => ({
            ...acc,
            [address]: balances[index].data.reserved.toString(), //toHuman(),
          }),
          {}
        )
        setReserved(balancesMap)
      })

      // query for miscFrozen balance
      api.query.system.account
      .multi(addresses, balances => {
        const balancesMap = addresses.reduce(
          (acc, address, index) => ({
            ...acc,
            [address]: balances[index].data.miscFrozen.toString(), //toHuman(),
          }),
          {}
        )
        setMiscFrozen(balancesMap)
      })

      // query for feeFrozen balance
      api.query.system.account
      .multi(addresses, balances => {
        const balancesMap = addresses.reduce(
          (acc, address, index) => ({
            ...acc,
            [address]: balances[index].data.feeFrozen.toString(), //toHuman(),
          }),
          {}
        )
        setFeeFrozen(balancesMap)
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
 
function AccountsModal() {
 try {
  const existentialDeposit = (api.consts.balances.existentialDeposit).toString();
  const maxReserves = (api.consts.balances.maxReserves).toString();
  const maxLocks = (api.consts.balances.maxLocks).toString();
  const blkStarting = (statData.syncState.startingBlock).toString();
  const blkCurrent = (statData.syncState.currentBlock).toString();
  const blkHighest = (statData.syncState.highestBlock).toString();
  const timeStampNow = (statData.timeStamp).toString();
  const timeDateNow = new Intl.DateTimeFormat('en-US', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' }).format(timeStampNow)
  const bondingDuration =(api.consts.staking.bondingDuration).toString();
  const slashDeferDuration = (api.consts.staking.slashDeferDuration).toString();
  const votingBondBase = (api.consts.elections.votingBondBase).toString();
  const candidacyBond = (api.consts.elections.candidacyBond).toString();
  const termDuration = (api.consts.elections.termDuration).toString();
  const desiredMembers = (api.consts.elections.desiredMembers).toString();
  const desiredRunnersUp = (api.consts.elections.desiredRunnersUp).toString();
  return(
  <div>
  <strong>Description: </strong>{infoBalances} <br></br>
  <br></br>
  <strong>Basic Chain Information:</strong><br></br>
  Now: {timeDateNow}<br></br>
  Current Time Stamp: {timeStampNow}<br></br>
  Coin Name: {tokenName}<br></br>
  Block Time in Seconds: {blockTime} seconds <br></br>
  Starting Block: {blkStarting}<br></br>
  Current Block: {blkCurrent}<br></br>
  Highest Block: {blkHighest}<br></br>
  <br></br>
  <strong>Balances Information:</strong><br></br>
  Total Balance of Listed Accounts: {totalBalance/microToCoin} {tokenName}<br></br>
  Total Transferrable of Listed Accounts: {transferrable/microToCoin} {tokenName}<br></br>
  Percent Transferrable of Listed Accounts: {percentOfBalance} {tokenName}<br></br>
  Total Reserved of Listed Accounts: {totalReserved/microToCoin} {tokenName}<br></br>
  Total Misc Frozen of Listed Accounts: {totalMiscFrozen/microToCoin} {tokenName}<br></br>
  Total Fee Frozen of Listed Accounts: {totalFeeFrozen/microToCoin} {tokenName}<br></br>
  Total Locked of Listed Accounts: {totalLocked/microToCoin} {tokenName}<br></br>
  <br></br>
  <strong>Important Balances Info:</strong> <br></br>
  Minimum Account Balance: <strong>{existentialDeposit/microToCoin}</strong>  <br></br>
  Maximum number of Account Reserves: <strong>{maxReserves}</strong>  <br></br>
  Maximum number of Account Locks: <strong>{maxLocks}</strong> <br></br>
  <br></br>
  <strong>Important Staking Info:</strong> <br></br>
  Bonding Duration in Blocks: <strong>{bondingDuration}</strong> Blocks <br></br>
  Bonding Duration in Hours:  <strong>{blksToHrs * bondingDuration}</strong> Hours <br></br>
  Slashing Deferred Duration in Blocks: <strong>{slashDeferDuration}</strong> Blocks <br></br>
  Slashing Deferred Duration in Minutes: <strong>{blksToMins * slashDeferDuration}</strong> Minutes <br></br>
  <br></br>
  <strong>Important Elections Info:</strong> <br></br>
  Bonding for Voting: <strong>{votingBondBase/microToCoin}</strong> {tokenName}  <br></br>
  Bonding for Candidacy: <strong>{candidacyBond/microToCoin}</strong> {tokenName} <br></br>
  Councile Term Duration:  <strong>{termDuration}</strong> Blocks <br></br>
  Councile Term Duration: <strong>{blksToDays * termDuration}</strong> Days <br></br>
  Desired Number of Council Members: <strong>{desiredMembers}</strong> <br></br>
  Desired Number of Runners Up: <strong>{desiredRunnersUp}</strong> <br></br>
  </div>
  )
 } catch(e) {
   console.error(e)
   return (
     <>Data unavailable</> 
   )
 }
 }

 function AddMultiSigModal() {
   return(
    <div>
    <strong>Multisig</strong> - This pallet contains functionality for 
    multi-signature dispatch, a (potentially) stateful operation, allowing 
    multiple signed origins (accounts) to coordinate and dispatch a call 
    from a well-known origin, derivable deterministically from the set of 
    account IDs and the threshold number of accounts from the set that must 
    approve it. In the case that the threshold is just one then this is a 
    stateless operation. This is useful for multisig wallets where 
    cryptographic threshold signatures are not available or desired.<br></br><br></br>
    depositBase: u128 <br></br>
      •	interface: api.consts.multisig.depositBase <br></br>
      •	summary: The base amount of currency needed to reserve for creating 
      a multisig execution or to store a dispatch call for later. <br></br>
      This is held for an additional storage item whose value size is
      4 + sizeof((BlockNumber, Balance, AccountId)) bytes and whose key size is
      32 + sizeof(AccountId) bytes. <br></br>
    <br></br>
    depositFactor: u128<br></br>
      •	interface: api.consts.multisig.depositFactor<br></br>
      •	summary: The amount of currency needed per unit threshold when creating 
      a multisig execution.<br></br>
      This is held for adding 32 bytes more into a pre-existing storage 
      value.<br></br><br></br>
    maxSignatories: u32<br></br>
      •	interface: api.consts.multisig.maxSignatories<br></br>
      •	summary: The maximum amount of signatories allowed in the multisig.<br></br>
    </div>
   )
 }

 //function AddProxy
 function AddProxyModal() {
	// Modal for adding a proxy --> Add code in next version
		return(
		<div>
			<strong>Proxy</strong> - A pallet allowing accounts to give permission to other accounts to dispatch types of calls from their signed origin.
The accounts to which permission is delegated may be required to announce the action that they wish to execute some duration prior to execution happens. In this case, the target account may reject the announcement and in doing so, veto the execution.
<br ></br><br></br>
announcementDepositBase: u128 <br ></br>
	•	interface: api.consts.proxy.announcementDepositBase <br ></br>
	•	summary: The base amount of currency needed to reserve for creating an announcement. <br ></br>This is held when a new storage item holding a Balance is created (typically 16 bytes). <br ></br> <br ></br>
announcementDepositFactor: u128 <br ></br>
	•	interface: api.consts.proxy.announcementDepositFactor <br ></br>
	•	summary: The amount of currency needed per announcement made. <br ></br>This is held for adding an AccountId, Hash and BlockNumber (typically 68 bytes) into a pre-existing storage value. <br ></br> <br ></br>
maxPending: u32 <br ></br>
	•	interface: api.consts.proxy.maxPending <br ></br>
	•	summary: The maximum amount of time-delayed announcements that are allowed to be pending. <br ></br> <br ></br>
maxProxies: u32 <br ></br>
	•	interface: api.consts.proxy.maxProxies <br ></br>
	•	summary: The maximum amount of proxies allowed for a single account. <br ></br> <br ></br>
proxyDepositBase: u128 <br ></br>
	•	interface: api.consts.proxy.proxyDepositBase <br ></br>
	•	summary: The base amount of currency needed to reserve for creating a proxy. <br ></br>This is held for an additional storage item whose value size is sizeof(Balance) bytes and whose key size is sizeof(AccountId) bytes. <br ></br> <br ></br>
proxyDepositFactor: u128 <br ></br>
	•	interface: api.consts.proxy.proxyDepositFactor <br ></br>
	•	summary: The amount of currency needed per proxy added. <br ></br>This is held for adding 32 bytes plus an instance of ProxyType more into a pre-existing storage value. Thus, when  <br ></br>
	•	configuring ProxyDepositFactor one should take into account 32 + proxy_type.encode().len() bytes of data. <br ></br>
</div>
		)
}

 // - end proxy modal
let totalBalance = 0;  
let totalReserved = 0;
let totalMiscFrozen = 0;
let totalFeeFrozen = 0;
let totalLocked = 0;
let transferrable = 0;
let percentOfBalance = 0;
let existentialDeposit = 1000000000000;
try {

  tokenName = String(statData.chain);
  existentialDeposit = (api.consts.balances.existentialDeposit).toString();

  totalBalance = accounts.map(account => (1 * balances
               [account.address])).reduce((sum, a) => 
               sum + a, 0);
  
  totalReserved = accounts.map(account => (1 * reserved
               [account.address])).reduce((sum, a) =>
               sum + a, 0);

  totalMiscFrozen = accounts.map(account => (1 * miscFrozen
               [account.address])).reduce((sum, a) =>
               sum + a, 0);

  totalFeeFrozen = accounts.map(account => (1 * feeFrozen
               [account.address])).reduce((sum, a) =>
               sum + a, 0);
  totalLocked = Math.max(totalMiscFrozen, totalFeeFrozen)
  //totalLocked = totalMiscFrozen + totalFeeFrozen;  //should be max of the two
  transferrable = totalBalance - totalReserved - totalLocked;
  percentOfBalance = Math.round((transferrable / totalBalance) * 100);
  } catch(e) {
    totalBalance = 'Unavailable';
    totalReserved = 'Unavailable';
//    existentialDeposit = 'Unavailable'
    console.error(e)
  }


  return (
    <Grid.Column>

      <h1>
      <Modal trigger={<Icon link name="info circle" />}>
                    <Modal.Header>Information - Balances</Modal.Header>
                    <Modal.Content scrolling wrapped="true">
                    <Modal.Description>
                    <AccountsModal />

                    </Modal.Description>
                    </Modal.Content>
                    </Modal>        
        Accounts and Balances</h1>    
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
                <Statistic.Label> total balance (in {tokenName})</Statistic.Label>
                <Statistic.Value>{((totalBalance)/microToCoin).toString()} </Statistic.Value>
                </Statistic>   
        </Table.Cell>
        <Table.Cell>
        <div style={{ width: 50, height: 50 }}>        
                Percent Transferrable
        </div>
        </Table.Cell>

        <Table.Cell>
        <div style={{ width: 50, height: 50 }}>
        <CircularProgressbar
                value={percentOfBalance}
                text={`${percentOfBalance}%`}
                styles={buildStyles({
                        textSize: '18px',
                        pathColor: `rgba(255, 0, 0, ${percentOfBalance / 100})`,
                        textColor: 'white',
                        trailColor: '#d6d6d6',
                        backgroundColor: '#3e98c7',
                })}/>
        </div>
        </Table.Cell>

        <Table.Cell>
                <Statistic size='mini'>
                <Statistic.Label> transferrable (in {tokenName})</Statistic.Label>
                <Statistic.Value>{transferrable/microToCoin} </Statistic.Value>
                </Statistic>                 
        </Table.Cell>
        <Table.Cell>
                <Statistic size='mini'>
                <Statistic.Label> reserved (in {tokenName})</Statistic.Label>
                <Statistic.Value>{totalReserved/microToCoin} </Statistic.Value>
                </Statistic>    
        </Table.Cell>
        <Table.Cell>
                <Statistic size='mini'>
                <Statistic.Label> total locked (in {tokenName})</Statistic.Label>
                <Statistic.Value>{totalLocked/microToCoin} </Statistic.Value>
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
                    <Modal.Header>Information - Name</Modal.Header>
                    <Modal.Content scrolling wrapped="true">
                    <Modal.Description>
                           <strong>Description: </strong>{infoName} <br></br>
                           {infoNameAdditional} <br></br>
                    </Modal.Description>
                    </Modal.Content>
                    </Modal>

                <Label color='teal'> <strong>Name</strong> </Label>
              </Table.Cell>
              <Table.Cell width={4}>
              <Modal trigger={<Icon link name="info circle" />}>
                    <Modal.Header>Information - Account Public Key Address</Modal.Header>
                    <Modal.Content scrolling wrapped="true">
                    <Modal.Description>
                           <strong>Description: </strong>{infoName} <br></br>
                           {infoNameAdditional} <br></br>
                    </Modal.Description>
                    </Modal.Content>
                </Modal>

                <Label color='teal'> <strong>Address</strong></Label>
                <Modal 
                  trigger={<Button basic circular='true' compact size='mini' color='blue' icon='plus'/>}>
                  <Modal.Header>Add an Account</Modal.Header>
                  <Modal.Content scrolling wrapped="true">
                  <Modal.Description>
                  { 'Add the polkadot{.js} extensions to your browser to add and manage your accounts. Vist https://polkadot.js.org/extension/ '}
                  <Modal.Actions>
                  </Modal.Actions>
                  </Modal.Description>
                  </Modal.Content>
                </Modal>
                <Label tag as='a' >Add Account</Label>
              <Modal
                  trigger={<Button  basic circular='true' compact size='mini' color='blue' icon='plus'/>}>
                  <Modal.Header>Add a MultiSig</Modal.Header>
                  <Modal.Content scrolling wrapped="true">
                  <Modal.Description>
                    <AddMultiSigModal />
                  <Modal.Actions>
                  </Modal.Actions>
                  </Modal.Description>
                  </Modal.Content>
                </Modal>
                <Label tag as='a'>MultiSig</Label>              

              <Modal 
                  trigger={<Button basic circular='true' compact size='mini' color='blue' icon='plus'/>}>
                  <Modal.Header>Add a Proxy</Modal.Header>
                  <Modal.Content scrolling wrapped="true">
                  <Modal.Description>
                  <AddProxyModal />
                  <Modal.Actions>
                  </Modal.Actions>
                  </Modal.Description>
                  </Modal.Content>
                </Modal>
                <Label tag as='a'>Proxied</Label>

              </Table.Cell>
              <Table.Cell width={5}>
              <Modal trigger={<Icon link name="info circle" />}>
                    <Modal.Header>Information - Available - Free - Balance</Modal.Header>
                    <Modal.Content scrolling wrapped="true">
                    <Modal.Description>
                           {infoAvailableBalance} <br></br> {infoFreeBalance}
                    </Modal.Description>
                    </Modal.Content>
                </Modal>
                <Label color='teal' ><strong>Total Balance</strong></Label>
            <Modal 
                  onClose={() => setOpen(false)}
                  onOpen={() => setOpen(true)}
                  open={open}                  
                  trigger={<Button basic circular='true' compact size='mini' color='green' icon='dollar sign'/>}>
            <Modal.Header>Transfer</Modal.Header>

            <Modal.Content scrolling wrapped="true">
            <Modal.Description>
              <Button circular='true' icon='settings' />
              <strong>Use this form to Transfer {tokenName}. </strong> 
              <strong>The Existential Depoist is {existentialDeposit} or 
              {1 * existentialDeposit / microToCoin} {tokenName}</strong><br></br>
            <Modal.Actions>
                <Container> 
                <Grid.Column width={8}>
                    <Form>
                    <Form.Field>
                    <Label color="blue">
                    <Icon name="hand point right" />1 Unit = 1000000000000&nbsp;
                    </Label>
                    <Label color="teal" style={{ marginLeft: 0, marginTop: '.5em' }}>
                    <Icon name="hand point right" />
                    Transfer more than the existential amount for account with 0 balance
                    </Label>
                    <Button Button 
                    basic 
                    circular='true' 
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
        <Label tag as='a' color='gray'>Transfer</Label>

              </Table.Cell>
              <Table.Cell width={4}>  
              <Modal trigger={<Icon link name="info circle" />}>
                    <Modal.Header>Information - Total Balance</Modal.Header>
                    <Modal.Content scrolling wrapped="true">
                    <Modal.Description>
                           {infoTotalBalance} <br></br> {infoFreeBalance}
                    </Modal.Description>
                    </Modal.Content>
                </Modal>
                <Label color='teal'><strong>Available</strong></Label>
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
                      circular='true'
                      compact
                      size="mini"
                      color="blue"
                      icon="copy outline"
                    />
                  </CopyToClipboard>

                  <Modal trigger={<Button basic circular='true' compact size='mini' color='blue' icon='info'/>}>
                    <Modal.Header>Breakdown of Total Balance </Modal.Header>
                    <Modal.Content scrolling wrapped="true">
                    <Modal.Description>
                        <strong>Name: </strong><Label color='teal'>{account.meta.name}</Label>
                        <br></br><br></br>
                        <strong>Account Address: </strong>
                        <Label basic color='teal'>{account.address}</Label>
                        <br></br>
                        
                        <br></br>
                        <Button circular='true' icon='settings' />
                        <strong> Breakdown of your Account Balances: </strong><br></br>
                           total balance: {balances[account.address]/microToCoin} {tokenName}
                           <br></br>
                           transferrable, free balance: {
                             (1 * balances[account.address]
                            - 1 * reserved[account.address]
                            - Math.max(
                              miscFrozen[account.address],
                              feeFrozen[account.address]
                            ))/microToCoin} {tokenName}<br></br>
                           balance reserved: {reserved[account.address]/microToCoin} {tokenName}<br></br>
                           misc. frozen: {miscFrozen[account.address]/microToCoin}  {tokenName}<br></br>
                           fee frozen: {feeFrozen[account.address]/microToCoin}  {tokenName}<br></br>
                           <br></br>
                           <Button circular='true' icon='settings' />
                           <strong> Activity for this Account per Era:</strong><br></br>
                           total fees paid on all transactions: <br></br>
                           total withdrawls from Account: <br></br>
                           total transfers received: <br></br>
                           <br></br>
                           <strong>Description: </strong> {infoTotalBalance} <br></br> {infoFreeBalance}
                    </Modal.Description>
                    </Modal.Content>
                </Modal>


                </Table.Cell>
                <Table.Cell width={3}>
                  {balances &&
                    balances[account.address]/microToCoin &&
                    balances[account.address]/microToCoin} 
                </Table.Cell>
                <Table.Cell width={8}>
                  {reserved &&
                    (1 * balances[account.address] - 1 * reserved[account.address])/microToCoin &&
                    (1 * balances[account.address] - 1 * reserved[account.address])/microToCoin} 



                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      )}
    </Grid.Column>
  )
}
