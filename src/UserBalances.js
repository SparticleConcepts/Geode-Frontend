import React, { useEffect, useState } from 'react'
import { Divider, Statistic, Dropdown, Container, Form, Icon, Input, Modal, Table, Grid, Button, Label } from 'semantic-ui-react'
import { CopyToClipboard } from 'react-copy-to-clipboard'
import { useSubstrateState } from './substrate-lib'
import { TxButton } from './substrate-lib/components'


export default function Main(props) {
//transfers
    const [status, setStatus] = useState(null)
    const [formState, setFormState] = useState({ addressTo: '', amount: 0 })
  
    const onChange = (_, data) =>
      setFormState(prev => ({ ...prev, [data.state]: data.value }))
  
    const { addressTo, amount } = formState
//transfers  
  const infoBalances ='The Substrate Balances pallet managers user funds for accounts. Use this user interface to \n(1) view the distribution of account balances, \n(2) transfer funds between accounts'
  const infoName ='This is the Public Key Address for the account. ';
  const infoNameAdditional = 'NOTE: Please keep secret keys in a secure location and \nnot stored in locations that can be accessed when your computer is connected to the internet.'
  const infoAvailableBalance = 'Available Balance for transactions, fees, etc.\n Use the green transaction button to transfer funds to other account addresses.'
  const infoTotalBalance = 'There are four (4) types of balances, free, reserved, \nmiscFrozen and feeFrozen. Usable balance = free - miscFrozen - feeFrozen.'
  const infoFreeBalance = 'On Geode, four different balance types indicate whether your balance can be used for transfers, to pay fees, or must remain frozen and unused due to an on-chain requirement. \nThe AccountData struct defines the balance types in Substrate. \nThe four types of balances include free, reserved, misc_frozen (miscFrozen in camel-case), and fee_frozen (feeFrozen in camel-case). \nIn general, the usable balance of the account is the amount that is free minus any funds that are considered frozen (either misc_frozen or fee_frozen), depending on the reason for which the funds are to be used. If the funds are to be used for transfers, then the usable amount is the free amount minus any misc_frozen funds. However, if the funds are to be used to pay transaction fees, the usable amount would be the free funds minus fee_frozen. \nThe total balance of the account is considered to be the sum of free and reserved funds in the account. Reserved funds are held due to on-chain requirements and can usually be freed by taking some on-chain action. For example, the Identity pallet reserves funds while an on-chain identity is registered, but by clearing the identity, you can unreserve the funds and make them free again.'
  const { api, keyring } = useSubstrateState()
  const accounts = keyring.getPairs()
  const [balances, setBalances] = useState({})

  const [open, setOpen] = React.useState(false)

  //- dev info. - need to find these from api - define as const for now
  const reserved =1000000;
  const feeFrozen=1000000000;
  const miscFrozen=100000;
  const numberTransactions = 1;
  const accountWhereBonded=['staking', 'voting'] //check these??
  const accountWhereLocked=['staking', 'voting'] //check these??
  const accountWhereReserved=['proposal', 'referendum'] //check these??
  const existentialDeposit = 10000000000;
  const maxReserves = 50;
  const maxLocks = 50;

  const totalWithdrawls=1000000;
  const totalFeesPaid=10000;
  const totalTxRx=1000000;

  const totalBalance = 10.0002
  const totalTransferrable = 4.800007
  const totalLocked = 5.200034
  const bonded = 2.20087
  
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
                    <Modal.Header>Information - Balances</Modal.Header>
                    <Modal.Content scrolling wrapped>
                    <Modal.Description>
                           <strong>Description: </strong>{infoBalances} <br></br>
                           <br></br>
                           <strong>The Balances Pallet has three constants as follow:</strong> <br></br>
                           Minimum Account Balance: {existentialDeposit} [exitentialDeposit] <br></br>
                           Maximum number of Account Reserves: {maxReserves} [maxReserves] <br></br>
                           Maximum number of Account Locks: {maxLocks} [maxLocks]<br></br>
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
                <Statistic.Label> total balance</Statistic.Label>
                <Statistic.Value>{totalBalance} B </Statistic.Value>
                </Statistic>   
        </Table.Cell>
        <Table.Cell>
                <Statistic size='mini'>
                <Statistic.Label> total transferrable</Statistic.Label>
                <Statistic.Value>{totalTransferrable} B </Statistic.Value>
                </Statistic>                 
        </Table.Cell>
        <Table.Cell>
                <Statistic size='mini'>
                <Statistic.Label> total locked</Statistic.Label>
                <Statistic.Value>{totalLocked} B </Statistic.Value>
                </Statistic>    
        </Table.Cell>
        <Table.Cell>
                <Statistic size='mini'>
                <Statistic.Label> total bonded</Statistic.Label>
                <Statistic.Value>{bonded} B </Statistic.Value>
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
                    <Modal.Content scrolling wrapped>
                    <Modal.Description>
                           <strong>Description: </strong>{infoName} <br></br>
                           {infoNameAdditional} <br></br>
                    </Modal.Description>
                    </Modal.Content>
                    </Modal>


                <Label color='teal'><strong>Name</strong></Label>
              </Table.Cell>
              <Table.Cell width={4}>
              <Modal trigger={<Icon link name="info circle" />}>
                    <Modal.Header>Information - Account Public Key Address</Modal.Header>
                    <Modal.Content scrolling wrapped>
                    <Modal.Description>
                           <strong>Description: </strong>{infoName} <br></br>
                           {infoNameAdditional} <br></br>
                    </Modal.Description>
                    </Modal.Content>
                </Modal>

                <Label color='teal'><strong>Address</strong></Label> 
                <Label>Add Account</Label>
                <Modal 
                  trigger={<Button basic circular compact size='mini' color='blue' icon='plus'/>}>
                  <Modal.Header>Add an Account</Modal.Header>
                  <Modal.Content scrolling wrapped>
                  <Modal.Description>
                    
                  <Form>
                    <Form.Field>
                    <input type='text' placeholder='First name' />
                    <Label basic color='red' pointing>
                    Please enter a value
                     </Label>
                      </Form.Field>
                        <Divider />

                    <Form.Field>
                     <Label basic color='red' pointing='below'>
                       Please enter a value
                            </Label>
                    <input type='text' placeholder='Last Name' />
                    </Form.Field>
                    <Divider />

                    <Form.Field inline>
                    <input type='text' placeholder='Username' />
                   <Label basic color='red' pointing='left'>
                  That name is taken!
                    </Label>
                  </Form.Field>
                  <Divider />

                <Form.Field inline>
                <Label basic color='red' pointing='right'>
                Your password must be 6 characters or more
                 </Label>
                <input type='password' placeholder='Password' />
                </Form.Field>
                </Form>

                  <Modal.Actions>
                  </Modal.Actions>
                  </Modal.Description>
                  </Modal.Content>
                </Modal>
              <Label>MultiSig</Label>
              <Modal 
                  trigger={<Button basic circular compact size='mini' color='blue' icon='plus'/>}>
                  <Modal.Header>Add a MultiSig</Modal.Header>
                  <Modal.Content scrolling wrapped>
                  <Modal.Description>
                    <pre>
                        <code>                             
                        </code>
                    </pre>
                  <Modal.Actions>
                  </Modal.Actions>
                  </Modal.Description>
                  </Modal.Content>
                </Modal>

                <Label>Proxied</Label>
              <Modal 
                  trigger={<Button basic circular compact size='mini' color='blue' icon='plus'/>}>
                  <Modal.Header>Add a Proxy</Modal.Header>
                  <Modal.Content scrolling wrapped>
                  <Modal.Description>
                    <pre>
                        <code>                             
                        </code>
                    </pre>
                  <Modal.Actions>
                  </Modal.Actions>
                  </Modal.Description>
                  </Modal.Content>
                </Modal>


              </Table.Cell>
              <Table.Cell width={5}>
              <Modal trigger={<Icon link name="info circle" />}>
                    <Modal.Header>Information - Available - Free - Balance</Modal.Header>
                    <Modal.Content scrolling wrapped>
                    <Modal.Description>
                           {infoAvailableBalance} <br></br> {infoFreeBalance}
                    </Modal.Description>
                    </Modal.Content>
                </Modal>
                <Label color='teal'><strong>Available Balance</strong></Label>
                <Label>Transfer</Label>
            <Modal 
                  onClose={() => setOpen(false)}
                  onOpen={() => setOpen(true)}
                  open={open}                  
                  trigger={<Button basic circular compact size='mini' color='green' icon='dollar sign'/>}>
            <Modal.Header>Transfer</Modal.Header>

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
              <Table.Cell width={4}>  
              <Modal trigger={<Icon link name="info circle" />}>
                    <Modal.Header>Information - Total Balance</Modal.Header>
                    <Modal.Content scrolling wrapped>
                    <Modal.Description>
                           {infoTotalBalance} <br></br> {infoFreeBalance}
                    </Modal.Description>
                    </Modal.Content>
                </Modal>

                <Label color='teal'><strong>Total Balance </strong></Label>  
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
                    <Modal.Header>Breakdown of Total Balance </Modal.Header>
                    <Modal.Content scrolling wrapped>
                    <Modal.Description>
                        <strong>Name: </strong><Label color='teal'>{account.meta.name}</Label>
                        <br></br><br></br>
                        <strong>Account Address: </strong>
                        <Label basic color='teal'>{account.address}</Label>
                        <br></br>
                        
                        <br></br>
                        <Button circular icon='settings' />
                        <strong> Breakdown of your Account Balances: </strong><br></br>
                           total balance: {balances[account.address]} 
                           <br></br>
                           transferrable, free balance: {balances[account.address]}<br></br>
                           locked: {feeFrozen} with {accountWhereLocked[0]}<br></br>
                           bonded: {miscFrozen} with {accountWhereBonded[1]}<br></br>
                           reserved: {reserved} with {accountWhereReserved[0]}<br></br>
                           No. of Transactions:  {numberTransactions}<br></br>
                           <br></br>
                           miscFrozen = {miscFrozen} with {accountWhereBonded[0]}<br></br>
                           feeFrozen = {feeFrozen} with {accountWhereLocked[0]}<br></br>
                           <br></br>
                           <Button circular icon='settings' />
                           <strong> Activity for this Account per Era:</strong><br></br>
                           total fees paid on all transactions: <Label basic color='orange'>{totalFeesPaid}</Label><br></br>
                           total withdrawls from Account: <Label basic color='orange'>{totalWithdrawls}</Label><br></br>
                           total transfers received: <Label basic color='orange'>{totalTxRx}</Label><br></br>
                           <br></br>
                           <strong>Description: </strong> {infoTotalBalance} <br></br> {infoFreeBalance}
                    </Modal.Description>
                    </Modal.Content>
                </Modal>


                </Table.Cell>
                <Table.Cell width={4}>
                  {balances &&
                    balances[account.address] &&
                    balances[account.address]}
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
