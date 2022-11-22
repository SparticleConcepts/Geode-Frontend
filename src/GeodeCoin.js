import React, { useEffect, useState } from 'react'
import { Table, Label, Modal, Card, Icon, Grid, List, Statistic } from 'semantic-ui-react'
import { useSubstrateState } from './substrate-lib'
import { CircularProgressbar } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { stringToU8a } from '@polkadot/util';
import { encodeAddress } from '@polkadot/util-crypto';

function Main(props) {
  const treasuryAddress = encodeAddress(stringToU8a("modlpy/trsry".padEnd(32, '\0')))
  const { api } = useSubstrateState()
  const [geodeInfo, setGeodeInfo] = useState({})
  const coinName = 'gropo'; 
  const shortCoinName = 'g'
  const coinFraction ='milli-'
  const treasuryRef = 'available from Treasury';
  const infoIcon = ' Funds collected through a portion of block production rewards, \ntransaction fees, slashing, staking inefficiencies, etc. '
  //const [freeJson, setFreeJason] = useState({});
  useEffect(() => {
    const getInfo = async () => {
      try {
        const [proposalCount, 
               approvals, 
               totalIssuance, 
               balance, 
               proposals,
               activeEra
              ] = await Promise.all([
          api.query.treasury.proposalCount(),
          api.query.treasury.approvals(), 
          api.query.balances.totalIssuance(),
          api.query.system.account(treasuryAddress),
          api.query.treasury.proposals(1),
          api.query.staking.activeEra()
          //api.query.balances.account('5EYCAe5ijiYfyeZ2JJCGq56LmPyNRAKzpG4QkoQkkQNB5e6Z')
      ])
        setGeodeInfo({ proposalCount, approvals, totalIssuance, balance, proposals, activeEra })
        
      } catch (e) {
        console.error(e)
      }
    }
    getInfo()
  })
// - inflation rate --
  const testJSON = JSON.stringify({"index":271,"start":1668976344010});
  const [activeEraLast, setActiveEraLast] = useState(testJSON);
  const [totalIssuanceLast, setTotalIssuanceLast] = useState(2203502338698);
  const [rateOfInflation, setRateOfInflation] = useState(2.5);

function Inflation() {
  let inflationRate = 2.5//rateOfInflation(); 
  let eraNow = 999; // 
  let eraLast = 999; //
  let issuanceNow = 9999; //
  let issuanceLast = 9999; //

  try {
     const newEraJSON = JSON.parse(geodeInfo.activeEra);
     const lastEraJSON = JSON.parse(activeEraLast);
    //newEraJSON = {"index":271,"start":1668976344010} 
    //lastEraJSON = {"index":270,"start":1668976344000}

    issuanceNow = String(geodeInfo.totalIssuance);
    issuanceLast = String(totalIssuanceLast);       
    eraNow = newEraJSON.index;
    eraLast = lastEraJSON.index;
    if (eraNow > eraLast) {
      inflationRate = ((issuanceNow * 52560) / issuanceLast);
      setRateOfInflation(inflationRate);
      setActiveEraLast( geodeInfo.activeEra );   
      setTotalIssuanceLast( issuanceNow ); 
    } else {
      inflationRate = rateOfInflation();
    }
  } catch(e) {
     console.error(e)
  }
return (
    <>
      Era: {eraNow}  Inflation Rate: {inflationRate}%  <br></br>
      Era Last: {eraLast} Inflation: {rateOfInflation} <br></br>
      Iss Now: {issuanceNow} <br></br>
      Iss Last: {issuanceLast}
    </>
  )
}  

  const propCount = JSON.stringify(geodeInfo.proposalCount);
  const approves = geodeInfo.approvals + '\n';
  const totalIssue = geodeInfo.totalIssuance + '\n'; //'12000000000000000' 
  
  const assetsMintedInB =    totalIssue/1000000000000000000 ;
  const totalMint =  '💰 Minted: ' + assetsMintedInB + 'B';

function TotalTreasury() {
  let freeBalance = 0 
  try {
    freeBalance = geodeInfo.balance.data.free.toHuman().substring(0,5);
  } catch(e) {
    console.error(e)
  }
  return (
    <div>
      {freeBalance} K {coinName} <br></br>
    </div>
  )
}  

function PercentTotalIssue() {
// Formats for JSON data --
// propData = {"proposer":"5ECBkFwiqyQ6PJLMbcfTrRkGfijm9y1LgXc1vWPwTce3tpjE","value":"0x00000000000000000de0b6b3a7640000","beneficiary":"5DFBnZ5oHDxQbvf8vE8LjGHB4y272VmaF7DuqBR81qZFkkJM","bond":"0x000000000000000000b1a2bc2ec50000"}
// JSONdata = {"nonce":0,"consumers":0,"providers":1,"sufficients":0,"data":{"free":"0x000000000000000036ad1f87299cb7da","reserved":0,"miscFrozen":0,"feeFrozen":0}};
  const txstrOne = "Proposed";
  const txstrTwo = "Bonded";
  const txErrorMessage ="Data Unavailable";

try {
    const propData=JSON.parse(geodeInfo.proposals);
    const JSONdata=JSON.parse(geodeInfo.balance);
    const freeBalance = JSONdata.data.free
    const intFreeBalance=Math.round(freeBalance/1000000000);
    const totalProposals = String(propData.value);
    const intTotalProposals = Math.round(totalProposals/1000000000);
    const intTotalBond = Math.round(propData.bond/1000000000)
    const percentOfIssue = intFreeBalance > 0 ? Math.round(100 * (intTotalProposals / intFreeBalance)) : 0; 

  return(
    <div>
      <Table>
        <Table.Row>
          <Table.Cell >
    			     Percent of Treasury Proposed: 
    			    <div style={{ width: 50, height: 50 }}>
      		    <CircularProgressbar value={percentOfIssue} text= {`${percentOfIssue}%`} strokeWidth={12}/>
    			    </div>
		      </Table.Cell>
          <Table.Cell>
          <Label ribbon color='teal' style={{ width: 100}}>{txstrOne}</Label> <br></br>
            <strong> {intTotalProposals + shortCoinName} </strong><br></br>
          <Label ribbon color='blue' style={{ width: 100}}>{txstrTwo}  </Label> <br></br>
			      <strong>{intTotalBond + shortCoinName}</strong><br></br>
		        </Table.Cell>
        </Table.Row>
      </Table>
  </div>
  )
} catch(e) {
  console.error(e)
  return (
    <div>{txErrorMessage}</div>
  )
}
}

function TreasuryBalances() {
  const txErrorMessage ="Treasury Balance Unavailable";
  try {  
  const freeBalance = geodeInfo.balance.data.free.toHuman(); 
  const reservedBalance = JSON.stringify(geodeInfo.balance.data.reserved); 
  const miscFrozenBalance = JSON.stringify(geodeInfo.balance.data.miscFrozen); 
  const feeFrozenBalance = JSON.stringify(geodeInfo.balance.data.feeFrozen); 
  return (
    <div>
      🔹 Total free: <strong>{freeBalance}</strong> {coinName} <br></br>
      🔹 Reserved: <strong>{reservedBalance}</strong> {coinName} <br></br>
      🔹 Misc Frozen: <strong>{miscFrozenBalance}</strong> {coinName} <br></br>
      🔹 Fee Frozen: <strong>{feeFrozenBalance}</strong> {coinName} <br></br>
      <br></br>
    </div>
  )
} catch(e) {
  console.error(e)
  return (
    <div>{txErrorMessage}</div>
  )
}  
}

function TreasuryDescription() {
  const txErrorMessage ="Treasury Information Unavailable";
try {
  return (
    <div>
    <strong>Treasury Information: </strong><br></br>
    🔹 Total Issuance: <strong>{totalIssue} </strong>{coinName}<br></br>
    🔹 Total Issuance in B {coinName}: <strong>{assetsMintedInB} </strong><br></br>
    🔹 Burn Amount: <strong>{api.consts.treasury.burn.toString()}</strong> {coinName}- Percentage of spare funds (if any) that are burnt per spend period <br></br>
    🔹 Spend Period: <strong>{api.consts.treasury.spendPeriod.toString()}</strong> - in Blocks, period between successive spends.<br></br>
    🔹 Proposal Count: <strong>{propCount}</strong> - Number of current proposals <br></br>
    🔹 Max Approvals in Spending Queue: <strong>{api.consts.treasury.maxApprovals.toString()}</strong> - The maximum number of approvals that can wait in the spending queue.<br></br>
    🔹 Number of Approved Proposals: <strong></strong>{approves} <br></br>
    🔹 Max Proposal Bond: <strong>{api.consts.treasury.proposalBondMaximum.toString()}</strong> - Maximum amount of funds in {coinName} that should be placed in a deposit for making a proposal.<br></br>
    🔹 Min Proposal Bond: <strong>{api.consts.treasury.proposalBondMinimum.toString()}</strong> - Minimum amount of funds in {coinFraction} {coinName} that should be placed in a deposit for making a proposal.<br></br>
    🔹 Proposal Bond: <strong>{api.consts.treasury.proposalBond.toString()}</strong> {coinName} - Fraction of a proposal's value that should be bonded in order to place the proposal. <br></br>
    An accepted proposal gets these back. A rejected proposal does not.<br></br>
    <br></br>
    </div>
  )
  } catch(e) {
    console.error(e)
    return (
    <div>{txErrorMessage}</div>
    )
  }
}

function StakingDescription() {
  const txErrorMessage ="Staking Information Unavailable";
  try {
    return (
      <div>
      <strong>Staking Information:</strong><br></br>
      🔹 Bonding Duration: <strong>{api.consts.staking.bondingDuration.toString()}</strong> - Number of eras that staked funds must remain bonded for.<br></br>
      🔹 Max Nominations: <strong>{api.consts.staking.maxNominations.toString()}</strong> - Maximum number of nominations per nominator.<br></br>
      🔹 Max Nominations Rewarded Per Validator: <strong>{api.consts.staking.maxNominatorRewardedPerValidator.toString()}</strong> - The maximum number of nominators rewarded for each validator. <br></br>
      🔹 Sessions per Era: <strong>{api.consts.staking.sessionsPerEra.toString()}</strong> - Number of sessions per era. <br></br>
      🔹 Slash Defer Duration: <strong>{api.consts.staking.slashDeferDuration.toString()}</strong> - Number of eras that slashes are deferred by, after computation. <br></br>
      🔹 Eras of Staker Unbonding: <strong>{api.consts.staking.maxUnlockingChunks.toString()}</strong> - How many unique eras a staker may be unbonding in. <br></br>
      <br></br>                            
      </div>
    )
  } catch(e) {
    console.error(e)
    return (
      <div>{txErrorMessage}</div>
    )
  }
}

  return (
    <Grid.Column>
      <Card color='teal'>
        <Card.Content>
        <Card.Meta>
        <Modal trigger={<Icon link name="info circle" />}>
                    <Modal.Header>Information - Available {coinName} in Treasury</Modal.Header>
                    <Modal.Content scrolling wrapped="true">
                    <Modal.Description>                   
                           <Label color='teal'> Treasury in {coinName} </Label>  <br></br>                           
                           {infoIcon} <br></br><br></br>
                           💰 Treasury Address: <strong>{treasuryAddress.toString()} </strong><br></br>
                           <br></br>
                           <strong>Treasury:</strong><br></br>
                            <TreasuryBalances />
                            <TreasuryDescription />
                            <StakingDescription />
                    </Modal.Description>
                    </Modal.Content>
                </Modal>
                <span> Available </span>  <br></br>     
          </Card.Meta>
          <Card.Header> 
          <Statistic size='tiny'>
              <Statistic.Label></Statistic.Label>
              <Statistic.Value><TotalTreasury /></Statistic.Value>
          </Statistic>    
          </Card.Header>
              {treasuryRef}                 
          <Card.Description> 
          <PercentTotalIssue />
          </Card.Description>
        </Card.Content>
        <Label ><Inflation /></Label>
        <Card.Content extra>
        <List>
        <List.Item>{totalMint}</List.Item>
        <List.Item>🌀 No. of Proposals: {propCount} </List.Item>
        </List>
        </Card.Content>
      </Card>
    </Grid.Column>
  )
}

export default function GeodeCoin(props) {
  const { api } = useSubstrateState()
  return api.query &&
  api.query.treasury &&
  api.query.treasury.proposalCount &&
  api.query.treasury.approvals &&
  api.query.balances.totalIssuance &&
  api.query.balances.account ? (
    <Main {...props} />
  ) : null
}
