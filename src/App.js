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
//import BlockNumber from './BlockNumber'
import SpendPeriod from './SpendPeriod'
import MarketPrice from './MarketPrice'
import Events from './Events'
import Interactor from './Interactor'
//import Metadata from './Metadata'
import GeodeCoin from './GeodeCoin'
import TemplateModule from './TemplateModule'
import Transfer from './Transfer'
import Upgrade from './Upgrade'
//import StakingInfo from './StakingInfo'
import NextBurn from './NextBurn'
//import StatData from './StatData'
import AdvertCards from './AdvertCards'
import UserBalances from './UserBalances'
import Council from './Council'
//import ChainData from './ChainData'
//import Grandpa from './Grandpa'
//import LatestActivity from'./LatestActivity'
import SubmitProposal from'./SubmitProposal'

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
            <GeodeCoin />
            <MarketPrice />
            <SpendPeriod finalized />
            <NextBurn />
          </Grid.Row>
          <Grid.Row stretched><AdvertCards /></Grid.Row>
          <Grid.Row stretched><UserBalances /></Grid.Row>
          <Grid.Row stretched><SubmitProposal /></Grid.Row>
          <Grid.Row stretched><Council /></Grid.Row>
          <Grid.Row stretched><Transfer /></Grid.Row>
          <Grid.Row>
            <Upgrade />
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
