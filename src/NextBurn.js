import React, { useEffect, useState, useRef } from 'react'
import { Table, Label, Icon, Modal, Card, Grid, Statistic } from 'semantic-ui-react'
import { useSubstrateState } from './substrate-lib'
import { CircularProgressbar } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { stringToU8a } from '@polkadot/util';
import { encodeAddress } from '@polkadot/util-crypto';


function Main(props) {
  const treasuryAddress = encodeAddress(stringToU8a("modlpy/trsry".padEnd(32, '\0')))
  const { api } = useSubstrateState()
  const [geodeInfo, setGeodeInfo] = useState({})
  const idealStaked = '50%';
  const prevEra = useRef(482)

  useEffect(() => {
    const getInfo = async () => {
      try {
        const [chain, era, staked, balance, totalIssuance] = await Promise.all([
          api.rpc.system.chain(),
          api.query.staking.activeEra(),
          api.query.staking.erasTotalStake(prevEra.current),
          api.query.system.account(treasuryAddress),
          api.query.balances.totalIssuance(),
        ])

        setGeodeInfo({ chain, era, staked, balance, totalIssuance})
      } catch (e) {
        console.error(e)
      }
    }
    getInfo()
  }, )

  function Token() {
    const errorMessage = 'unavailable';
    let coinName = 'Coin'; //public/assets/IMG_2103.jpeg
    try {
      coinName = geodeInfo.chain.toString()
      return (
        <>
          {coinName}
        </>
      )
    } catch(e) {
      console.error(e)
      return(
          <>
          {errorMessage}<br></br>
          </>
      )
    }
  }

  function NextTreasuryBurn() {
    const errorMessage = 'Burn Data not Available';
    let freeBalance = 0 
    let burnAmount = 9999 ; 
    try {
      const burnPercent = (api.consts.treasury.burn.toString())/1000000;  
      freeBalance = geodeInfo.balance.data.free.toString() //toHuman();
      burnAmount = ((burnPercent * freeBalance / 1000000000) /1000000).toString().substring(0,6)
      return (
        <>
          {burnAmount} K <Token /> <br></br>
        </>
      )
      } catch(e) {
      console.error(e)
      return (
        <>
          {errorMessage}<br></br>
        </>
      )
      }
  }  

  function TotalTreasuryAfterBurn() {
    let treasuryBalance = 0; 
    let treasuryAfterBurn = 0;
    try {
      const burnPercent = (api.consts.treasury.burn.toString())/1000000;  
      treasuryBalance = geodeInfo.balance.data.free.toString() //toHuman();
      const burnAmount = (burnPercent * treasuryBalance)
      treasuryAfterBurn = (( (treasuryBalance - burnAmount) / 1000000000 ) / 1000000).toString().substring(0,9)
    } catch(e) {
      console.error(e)
    }
    return (
      <>
       <Label basic >After Burn: {treasuryAfterBurn} K <Token /></Label>
      </>
    )
  }

  function PercentSpenableAvailable() {
    const txErrorMessage ="Data Unavailable";
    let treasuryBalance = 0; 
    try {
      const burnPercent = (api.consts.treasury.burn.toString())/10000;  
      treasuryBalance = (.000000001 * (geodeInfo.balance.data.free.toString())/1000000000).toString().substring(0,6) //toHuman();
    return(
          <div>
            <Table>
              <Table.Row>
                <Table.Cell >
                <Icon name="toggle on" /> Spendable: <strong>{treasuryBalance} M <Token /> </strong><br></br>
                <Icon name="toggle on" /> Available: <strong>{treasuryBalance} M <Token /> </strong><br></br>
                <Icon name="toggle on" /> % Burn of Treasury
                      <div style={{ width: 50, height: 50 }}>
                          <CircularProgressbar value={burnPercent} text= {`${burnPercent}%`} strokeWidth={12}/>
                      </div>
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
  
  function StakingInfo() {
        const errorMessage = 'Burn Data not Available';
        let totalStaked = 9999 ; 
        let totalIssue = 9999 ;
        let stakedPercent = 0;
        try {
          const newEraJSON = JSON.parse(geodeInfo.era);
          const currentEra = String(newEraJSON.index);
          totalStaked = Math.round((geodeInfo.staked.toString())/1000000000);
          totalIssue = Math.round((geodeInfo.totalIssuance.toString())/1000000000);
          stakedPercent = (100 * totalStaked/totalIssue).toString().substring(0,5);
          prevEra.current = currentEra;
          return (
            <>
              <Icon name="percent" /> Ideal Staked: {idealStaked} <br></br>
              <Icon name="percent" /> Staked: {stakedPercent}% @ Era: {currentEra} <br></br>
            </>
          )
          } catch(e) {
          console.error(e)
          return (
            <>
              {errorMessage}<br></br>
            </>
          )}
  }  
  
  function NextBurnModal() {
    const infoIcon = 'If the Treasury ends a spend period without spending all of its funds, \nit suffers a burn of a percentage of its funds.'
    return(
      <>
      <strong><Icon name="info circle" />Next Burn Information: </strong><br></br>
      🔹 Next Burn: {infoIcon} <br></br>
      🔹 Next Burn Total: Total to be burned after the spend period. <br></br>
      🔹 Spendable: Total amount in Treasury that is spendable. <br></br>
      🔹 Available: Total amount in Treasury that is available for use. <br></br>
      🔹 % Burn of Treasury: The percent of the Treasury that will burned at each spend period. <br></br>
      🔹 After Burn: The amount left in Treasury after the current period is completed.<br></br>
      🔹 % Ideal Staked: Ideal Amount staked in the system. Total Staked / Total Issuance <br></br>
      🔹 % Staked: The current ammount in the Era staked. Total Staked / Total Issuance <br></br>
      </>
    )
  }



  return (
    <Grid.Column>
      <Card color='teal'>
        <Card.Content>
        <Card.Meta>
            <Modal trigger={<Icon link name="info circle" />}>
                    <Modal.Header>Information - Next Burn</Modal.Header>
                    <Modal.Content scrolling wrapped="true">
                    <Modal.Description>
                      <NextBurnModal />     
                    </Modal.Description>
                    </Modal.Content>
                </Modal>
                <span> Next Burn </span>
          </Card.Meta>
          <Card.Header> 
          <Statistic size='tiny'>
                <Statistic.Label></Statistic.Label>
                <Statistic.Value>
                <NextTreasuryBurn />
                 </Statistic.Value>
                </Statistic>    
               </Card.Header>
               Total
          <Card.Description> 
          <PercentSpenableAvailable />
        </Card.Description>
        </Card.Content>
        <TotalTreasuryAfterBurn />
        <Card.Content extra>
        <StakingInfo />        
        </Card.Content>
      </Card>
    </Grid.Column>
  )
}

export default function NodeInfo(props) {
  const { api } = useSubstrateState()
  return api.rpc &&
    api.rpc.system &&
    api.rpc.system.chain &&
    api.query.staking.activeEra &&
    api.query.staking.erasTotalStake &&
    api.query.system.account &&
    api.query.balances.totalIssuance ? (
    <Main {...props} />
  ) : null
}
// api.rpc.system.chain(),
// api.query.staking.activeEra(),
// api.query.staking.erasTotalStake(prevEra.current),
// api.query.system.account(treasuryAddress),
// api.query.balances.totalIssuance(),
