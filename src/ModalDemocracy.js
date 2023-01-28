import React, { useEffect, useState } from 'react'
import { Segment, Statistic, Dropdown, Container, Form, Icon, Input, Modal, Table, Grid, Button, Label } from 'semantic-ui-react'
//import { CopyToClipboard } from 'react-copy-to-clipboard'
import { useSubstrateState } from './substrate-lib'
import { TxButton } from './substrate-lib/components'

export default function Main(props) {
    try{
      const cooloffPeriod = (api.consts.democracy.cooloffPeriod).toString();
      const enactmentPeriod = (api.consts.democracy.enactmentPeriod).toString();
      const fastTrackVotingPeriod = (api.consts.democracy.fastTrackVotingPeriod).toString();
      const instantAllowed = (api.consts.democracy.instantAllowed).toString();
      const launchPeriod = (api.consts.democracy.launchPeriod).toString();
      //const maxBlacklisted = (api.consts.democracy.maxBlacklisted).toString();
      //const maxDeposits = (api.consts.democracy.maxDeposits).toString();
  
      const preimageByteDeposit = (api.consts.democracy.preimageByteDeposit).toString();
      const maxProposals = (api.consts.democracy.maxProposals).toString();
      const maxVotes = (api.consts.democracy.maxVotes).toString();
      const minimumDeposit = (api.consts.democracy.minimumDeposit).toString();
      const voteLockingPeriod = (api.consts.democracy.voteLockingPeriod).toString();
      const votingPeriod = (api.consts.democracy.votingPeriod).toString();
      return (
        <div>
        <strong>Democracy - </strong> 
        <br></br><br></br>
        <strong>Cool off Period: {cooloffPeriod} Blocks </strong><br></br>
        • Summary: Period in blocks where an external proposal may not be re-submitted after being vetoed. <br></br>
        • Duration in Days: <strong>{blksToDays * cooloffPeriod}</strong> <br /><br />
        <strong>Enactment Period: {enactmentPeriod} Blocks </strong><br></br>
        • Summary: The period between a proposal being approved and enacted. It should 
        generally be a little more than the unstake period to ensure that voting stakers 
        have an opportunity to remove themselves from the system in the case where they 
        are on the losing side of a vote. <br />
        • Duration in Days: <strong>{blksToDays * enactmentPeriod}</strong> <br /><br />
        <strong>Fast Track Voting Period: {fastTrackVotingPeriod} Blocks </strong><br></br> 
        • Summary: Minimum voting period allowed for a fast-track referendum. <br></br> 
        • Duration in Days: <strong>{blksToDays * fastTrackVotingPeriod}</strong> <br /><br />
        <strong>Instant Allowed:  {instantAllowed} </strong><br></br>
        • Summary: Indicator for whether an emergency origin is even allowed to happen. 
        Some chains may want to set this permanently to false, others may want to condition 
        it on things such as an upgrade having happened recently. <br></br>
        <br></br>
        <strong>LaunchPeriod:  {launchPeriod} Blocks</strong><br></br>
        • Summary: How often (in blocks) new public referenda are launched. <br />
        • Duration in Days: <strong>{blksToDays * launchPeriod}</strong>
        <br /><br />
        <strong>Preimage Byte Deposite:  {preimageByteDeposit/microToCoin} {tokenName}</strong><br></br>
        • Summary: The deposit required based on storage size of the pre-Image.<br></br>
        <br></br>
        <strong>Max Deposits: </strong><br></br>
        • Summary: The maximum number of deposits a public proposal may have at any time. <br></br>
        <br></br>
        <strong>Max Proposals:  {maxProposals} </strong><br></br>
        • Summary: The maximum number of public proposals that can exist at any time. <br></br>
        <br></br>
        <strong>Max Votes:  {maxVotes} </strong><br></br>
        • Summary: The maximum number of votes for an account. <br></br>
        Also used to compute weight, an overly big value can lead to extrinsic 
        with very big weight: see delegate for instance. <br></br>
        <br></br>
        <strong>Minimum Deposit:  {minimumDeposit/microToCoin} {tokenName}</strong> <br></br>
        • Summary: The minimum amount to be used as a deposit for a public 
        referendum proposal. <br></br>
        <br></br>
        <strong>Vote Locking Period: {voteLockingPeriod} </strong><br></br>
        • Summary: The minimum period of vote locking. <br></br>
          It should be no shorter than enactment period to ensure that in 
          the case of an approval, those successful voters are locked into 
          the consequences that their votes entail. <br></br>
        • Duration in Days: <strong>{blksToDays * voteLockingPeriod} </strong><br></br>
        <br></br>
        <strong>Voting Period:  {votingPeriod} </strong><br></br>
        • summary: How often (in blocks) to check for new votes. <br></br>
        • Duration in Days: <strong>{blksToDays * votingPeriod}</strong> <br />
        </div>
      )
    } catch(e) {
       console.error(e)
       return (
         <>Data unavailable</> 
       )
    }
} 