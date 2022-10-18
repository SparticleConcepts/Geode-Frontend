import React, { useEffect, useState } from 'react'
import { Grid, Modal, Button, Card, List } from 'semantic-ui-react'

import { useSubstrateState } from './substrate-lib'

function Main(props) {
  const { api } = useSubstrateState()
  const [metadata, setMetadata] = useState({data: null, version: null })

  useEffect(() => {
    const getMetadata = async () => {
      try {
        const data = await api.rpc.state.getMetadata()
        setMetadata({data, version: data.version })
      } catch (e) {
        console.error(e)
      }
    }
    getMetadata()
  }, [api.rpc.state])

  return (
    <Grid.Column>
      <Card>
        <Card.Content>
          <Card.Header>Consensus</Card.Header>
          <Card.Meta>
            <span>Blk Consensus Information</span>
          </Card.Meta> 
          <Card.Description>
            <List>
              <List.Item>👶 Consensus Type: Babe</List.Item>
              <List.Item>👴 Finality: Grandpa</List.Item>
              <List.Item>⚙️ Epoch duration: {api.consts.babe.epochDuration.toNumber()}</List.Item>
              <List.Item>⚙️ Max Authorities: {api.consts.babe.maxAuthorities.toNumber()}</List.Item>
              <List.Item>⚙️ Expected Blk Time: {api.consts.babe.expectedBlockTime.toNumber()}</List.Item>
              <List.Item>🙋‍♀️ No. Nominators: </List.Item>
              <List.Item>👨‍🦲 No. Validators: </List.Item>
              <List.Item></List.Item>
              <List.Item>📱 Metadata version: V{metadata.version}</List.Item>
            </List>
          </Card.Description>
        </Card.Content>
        <Card.Content extra>
          <Modal trigger={<Button>Show Metadata</Button>}>
            <Modal.Header>Runtime Metadata</Modal.Header>
            <Modal.Content scrolling>
              <Modal.Description>
                <pre>
                  <code>{JSON.stringify(metadata.data, null, 2)}</code>
                </pre>
              </Modal.Description>
            </Modal.Content>
          </Modal>
        </Card.Content>
      </Card>
    </Grid.Column>
  )
}

export default function Metadata(props) {
  const { api } = useSubstrateState()
  return api.rpc && api.rpc.state && api.rpc.state.getMetadata ? (
    <Main {...props} />
  ) : null
}
