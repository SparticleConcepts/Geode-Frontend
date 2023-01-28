import React, { createRef } from 'react'
import {
  Container,
  Dimmer,
  Loader,
  Grid,
  Sticky,
  Message,
} from 'semantic-ui-react'
import 'semantic-ui-css/semantic.min.css'

import { SubstrateContextProvider, useSubstrateState } from './substrate-lib'
import { DeveloperConsole } from './substrate-lib/components'

import AccountSelector from './AccountSelector'
//import Balances from './Balances'
import BlockNumber from './BlockNumber'
import Events from './Events'
import Interactor from './Interactor'
//import Metadata from './Metadata'
import NodeInfo from './NodeInfo'
import TemplateModule from './TemplateModule'
//import Transfer from './Transfer'
//import Upgrade from './Upgrade'
import CardToken from './CardToken'
import CardMarket from './CardMarket'
import CardSpend from './CardSpend'
import CardNextBurn from './CardNextBurn'
import PanelBalances from './PanelBalances'
import PanelProposals from './PanelProposals'
//import PanelCouncil from './PanelCouncil'
//import PanelTips from './PanelTips'
//import PanelReferendum from './PanelReferendum'
import CardTokenTwo from './CardTokenTwo'

function Main() {
  const { apiState, apiError, keyringState } = useSubstrateState()

  const loader = text => (
    <Dimmer active>
      <Loader size="small">{text}</Loader>
    </Dimmer>
  )

  const message = errObj => (
    <Grid centered columns={2} padded>
      <Grid.Column>
        <Message
          negative
          compact
          floating
          header="Error Connecting to Substrate"
          content={`Connection to websocket '${errObj.target.url}' failed.`}
        />
      </Grid.Column>
    </Grid>
  )

  if (apiState === 'ERROR') return message(apiError)
  else if (apiState !== 'READY') return loader('Connecting to Substrate')

  if (keyringState !== 'READY') {
    return loader(
      "Loading accounts (please review any extension's authorization)"
    )
  }

  const contextRef = createRef()

  return (
    <div ref={contextRef}>
      <Sticky context={contextRef}>
        <AccountSelector />
      </Sticky>
      <Container>
        <Grid stackable columns="equal">
          <Grid.Row stretched>
            <CardToken />
            <CardMarket />
            <CardSpend />
            <CardNextBurn />
          </Grid.Row>
          <Grid.Row stretched><PanelBalances /></Grid.Row>
          <Grid.Row stretched><PanelProposals/></Grid.Row>
          <Grid.Row stretched></Grid.Row>
          <Grid.Row stretched>
          <CardTokenTwo />  
            <NodeInfo />          
            <BlockNumber />
            <BlockNumber finalized />
          </Grid.Row>
          <Grid.Row>
            <Interactor />
            <Events />
          </Grid.Row>
          <Grid.Row>
            <TemplateModule />
          </Grid.Row>
        </Grid>
      </Container>
      <DeveloperConsole />
    </div>
  )
}

export default function App() {
  return (
    <SubstrateContextProvider>
      <Main />
    </SubstrateContextProvider>
  )
}
