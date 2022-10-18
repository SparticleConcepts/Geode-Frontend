import React, { useEffect, useState } from 'react'
import { Label, Icon, Modal, Card, Grid, List, Statistic } from 'semantic-ui-react'

import { useSubstrateState } from './substrate-lib'

import { CircularProgressbar } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';


function Main(props) {
  const { api } = useSubstrateState()
  const [geodeInfo, setGeodeInfo] = useState({})
  
  const burnAmount = 349.2 ; 
  const treasuryBeforeBurn = 100000 ;
  const treasuryAfterBurn = ( ( ( 1000 * treasuryBeforeBurn ) - burnAmount) / 1000 )
  const coinName = 'geode'; //public/assets/IMG_2103.jpeg

  const percentOfTreasury = 5
  const infoIcon = 'If the Treasury ends a spend period without spending all of its funds, \nit suffers a burn of a percentage of its funds.'
  //const inflationRate = 'Inflation Rate:' + '4.5%' ;
  
  useEffect(() => {
    const getInfo = async () => {
      try {
        const [chain, nodeName, nodeVersion] = await Promise.all([
          api.rpc.system.chain(),
          api.rpc.system.name(),
          api.rpc.system.version(),
        ])

        setGeodeInfo({ chain, nodeName, nodeVersion})
      } catch (e) {
        console.error(e)
      }
    }
    getInfo()
  }, [api.rpc.system])

  return (
    <Grid.Column>
      <Card color='teal'>
        <Card.Content>
        <Card.Meta>
            <span> Next Burn </span>
            <Modal trigger={<Icon link name="info circle" />}>
                    <Modal.Header>Information - Next Burn</Modal.Header>
                    <Modal.Content scrolling wrapped>
                    <Modal.Description>
                    <pre>
                           <code>                             
                           {infoIcon} <br></br>
                            </code>
                    </pre>
                    </Modal.Description>
                    </Modal.Content>
                </Modal>
          </Card.Meta>
          <Card.Header> 
          <Statistic size='tiny'>
                <Statistic.Label></Statistic.Label>
                <Statistic.Value>{burnAmount} {coinName} </Statistic.Value>
                </Statistic>    
               </Card.Header>
               Total
          <Card.Description> 
          <strong> % of Treasury</strong>
                    <div style={{ width: 50, height: 50 }}>
                        <CircularProgressbar value={percentOfTreasury} text= {`${percentOfTreasury}%`} strokeWidth={12}/>
                    </div>

             </Card.Description>
        </Card.Content>
        <Label Basic ><weak>Treasury After Burn: {treasuryAfterBurn} M</weak></Label>
        <Card.Content extra>
        <List>
            <List.Item>🌀 Ideal Staked: {geodeInfo.chain} </List.Item>
            <List.Item>🌀 Staked: {geodeInfo.nodeName}</List.Item>
            </List>
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
    api.rpc.system.name &&
    api.rpc.system.version ? (
    <Main {...props} />
  ) : null
}
