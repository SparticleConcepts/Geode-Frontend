import React, { useEffect, useState } from 'react'
import { Label, Modal, Card, Icon, Grid, List, Statistic } from 'semantic-ui-react'

import { useSubstrateState } from './substrate-lib'

import { CircularProgressbar } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
//question circle

function Main(props) {
  const { api } = useSubstrateState()
  const [geodeInfo, setGeodeInfo] = useState({})
  const coinName = 'geode'; //public/assets/IMG_2103.jpeg
  const assetsMintedInB =    1000000 ;
  const assetsAvailableInB = 100000 ;
  const inflationRate = 'Inflation Rate:' + '4.5%' ;

  
  //const percentOfIssue = 85
  const infoIcon = ' Funds collected through a portion of block production rewards, \ntransaction fees, slashing, staking inefficiencies, etc. '

  useEffect(() => {
    const getInfo = async () => {
      try {
        const [proposalCount, approvals, totalIssuance] = await Promise.all([
          api.query.treasury.proposalCount(),
          api.query.treasury.approvals(), 
          api.query.balances.totalIssuance(),
        ])
//        const [chain, nodeName, nodeVersion] = await Promise.all([
//          api.rpc.system.chain(),
//          api.rpc.system.name(),
//          api.rpc.system.version(),
//        ])

        setGeodeInfo({ proposalCount, approvals, totalIssuance})
      } catch (e) {
        console.error(e)
      }
    }
    getInfo()
  }, [])

  const propCount = JSON.stringify(geodeInfo.proposalCount);
  //const approves = JSON.stringify(geodeInfo.approvals);
  //const txapproves = ('🌀 No. of Approvals:' + approves).replace("[]", " None");

    
   // const totalIssue = 'Max: ' + geodeInfo.totalIssuance + '\n'; //'12000000000000000' 
    const totalMint =  'Total Minted: ' + assetsMintedInB + 'B';
    const percentOfIssue = 100 * (assetsAvailableInB / assetsMintedInB) ; 

  return (
    <Grid.Column>
      <Card color='teal'>
        <Card.Content>
        <Card.Meta>
            <span> Available </span>       
        <Modal trigger={<Icon link name="info circle" />}>
                    <Modal.Header>Information - Available Geode</Modal.Header>
                    <Modal.Content scrolling wrapped>
                    <Modal.Description>
                           <Label color='teal'> available Geode </Label>  <br></br>                           
                           {infoIcon} <br></br><br></br>
                           <Label color='teal'> treasuryInfo </Label>  <br></br>
                           <strong>Treasury Information: </strong><br></br>
                           Max Proposal Bond: {0}<br></br>
                           Min Proposal Bond: {0}<br></br>
                           Proposal Bond: <br></br>
                           Burn Amount:<br></br>
                           Max Approvals: {0}<br></br>

                           <br></br>
                    </Modal.Description>
                    </Modal.Content>
                </Modal>
          </Card.Meta>
          <Card.Header> 
          <Statistic size='tiny'>
                <Statistic.Label></Statistic.Label>
                <Statistic.Value>{assetsAvailableInB} B {coinName} </Statistic.Value>
                </Statistic>    
               </Card.Header>
                 available from Treasury
          <Card.Description> 

          <strong> % of Total Issued: </strong>
                    <div style={{ width: 50, height: 50 }}>
                        <CircularProgressbar value={percentOfIssue} text= {`${percentOfIssue}%`} strokeWidth={12}/>
                    </div>

             </Card.Description>
        </Card.Content>
        <Label Basic ><weak>{inflationRate}</weak></Label>
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
  api.query.treasury.approvals ? (
    <Main {...props} />
  ) : null
}
