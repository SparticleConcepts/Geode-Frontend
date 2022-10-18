import React, { useEffect, useState } from 'react'
import { Card, Icon, Grid, List } from 'semantic-ui-react'

import { useSubstrateState } from './substrate-lib'

function Main(props) {
  const { api, socket } = useSubstrateState()
  const [nodeInfo, setNodeInfo] = useState({})
  
  useEffect(() => {
    const getInfo = async () => {
      try {
        const [chain, nodeName, nodeVersion, peerId] = await Promise.all([
          api.rpc.system.chain(),
          api.rpc.system.name(),
          api.rpc.system.version(),
          api.rpc.system.localPeerId(),
        ])

        setNodeInfo({ chain, nodeName, nodeVersion, peerId })
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
          <Card.Header>{nodeInfo.nodeName}</Card.Header>
          <Card.Meta>
            <span> Node Information </span>
          </Card.Meta>
          <Card.Description> 
            <List>
            <List.Item><List.Header>Chain:</List.Header>🔆 {nodeInfo.chain}</List.Item>
            <List.Item>🔆 Health: Ok</List.Item>
            <List.Item><List.Header>Stuff:</List.Header>🌀</List.Item>
            <List.Item>🔆 Coin Name: Geode</List.Item>
            <List.Item>🌀 Ver: {nodeInfo.nodeVersion} </List.Item>
            <List.Item>🌀 {api.libraryInfo} </List.Item>
            </List>
             </Card.Description>
        </Card.Content>
        <Card.Content extra>
          <Icon name="setting" />v{socket}
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
    api.rpc.system.version &&
    api.rpc.system.localPeerId ? (
    <Main {...props} />
  ) : null
}
