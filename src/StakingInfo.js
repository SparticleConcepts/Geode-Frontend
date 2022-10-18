import React, { useEffect, useState } from 'react'
import { Card, Icon, Grid, List } from 'semantic-ui-react'

import { useSubstrateState } from './substrate-lib'

function Main(props) {
  const { api, socket } = useSubstrateState()
  const [nodeInfo, setStakeInfo] = useState({})

  useEffect(() => {
    const getInfo = async () => {
      try {
        const [chain, nodeName, nodeVersion] = await Promise.all([
          api.rpc.system.chain(),
          api.rpc.system.name(),
          api.rpc.system.version(),
        ])
        setStakeInfo({ chain, nodeName, nodeVersion })
      } catch (e) {
        console.error(e)
      }
    }
    getInfo()
  }, [api.rpc.system])

  return (
    <Grid.Column>
      <Card>
        <Card.Content>
          <Card.Header> {nodeInfo.nodeName} Staking Info: </Card.Header>
          <Card.Meta>
            <span> Staking Information </span>
          </Card.Meta>
            <Card.Description>
            <List>
            <List.Item>💵 Ideal stake: 50%</List.Item>
            <List.Item>💵 Staked:</List.Item>
            <List.Item>💸 Inflation:</List.Item>
            <List.Item></List.Item>    
            <List.Item></List.Item>
            <List.Item>💰 Min Balance: {api.consts.balances.existentialDeposit.toNumber()}</List.Item> 
            <List.Item>🔒 Max Locks: {api.consts.balances.maxLocks.toNumber()}</List.Item>
            <List.Item>🔏 Max Reserves: {api.consts.balances.maxReserves.toNumber()}</List.Item>
            </List>
            </Card.Description>
        </Card.Content>
        <Card.Content extra>
          <Icon name="setting" />v{nodeInfo.nodeVersion} {socket}
        </Card.Content>
      </Card>
    </Grid.Column>
  )
}

export default function StakingInfo(props) {
  const { api } = useSubstrateState()
  return api.rpc &&
    api.rpc.system &&
    api.rpc.system.chain &&
    api.rpc.system.name &&
    api.rpc.system.version ? (
    <Main {...props} />
  ) : null
}
