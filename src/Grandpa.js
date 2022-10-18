import React, { useEffect, useState } from 'react'
import { Container, Table, Grid, Button, Modal, Statistic} from 'semantic-ui-react'

import { useSubstrateState } from './substrate-lib'

import { CircularProgressbar } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

//import { AnimatedCircularProgress } from 'react-native-circular-progress';  
//<AnimatedCircularProgress   size={120}   width={15}   fill={100}   tintColor="#00e0ff"   onAnimationComplete={() => console.log('onAnimationComplete')}   backgroundColor="#3d5875" />

// retrieve the last header (hash optional)
// const header = await api.derive.chain.getHeader();
// console.log(`#${header.number}: ${header.author}`);

function Main(props) {
  const { api } = useSubstrateState()
 // const { finalized } = props

  const [roundState, setRoundState] = useState(0)
  const [block, setBlock] = useState(0)
  const [authorities, setAuthorities] = useState(0)
  const [stalled, setStalled] = useState([])
// api.query.grandpa.stalled
//const maxAuthorities = api.consts.maxAthorities


useEffect(() => {
    const getInfo =async () => {
        try {
            const stalled = await Promise.all([
                api.query.grandpa.stalled(),
            ])
            setStalled( stalled )
        } catch (e) {
            console.error(e)
        }
    }
    getInfo()
}, [])

  useEffect(() => {
    const getInfo =async () => {
        try {
            const authorities = await Promise.all([
                  api.call.grandpaApi.grandpaAuthorities(),
            ])
            setAuthorities( authorities )
        } catch (e) {
            console.error(e)
        }
    }
    getInfo()
}, [])

  useEffect(() => {
    const getInfo =async () => {
        try {
            const block = await Promise.all([
                api.query.system.number(),
            ])
            setBlock( block )
        } catch (e) {
            console.error(e)
        }
    }
    getInfo()
}, [])

  useEffect(() => {
      const getInfo = async () => {
          try {
              const roundState = await Promise.all([
                api.rpc.grandpa.roundState(),
              ])
              setRoundState( roundState )
          } catch (e) {
              console.error(e)
          }
      }
      getInfo()
  },  []  )
//  const round = roundState
//        .toString()
//        .replace(/,"/g, ' \n ')
//        .replace(/"/g, '')
//        .replace(/{/g, '\n')
//        .replace(/}/g, '\n');
  const currentBlock = block.toString();
  const myArray = roundState
        .toString()
        .replace(/{/g, '')
        .replace(/}/g, '')
        .split(',');
 const setBest = "0"; //myArray[1] //.replace(':', '/n');  
 const setID = myArray[0]
        .replace('"setId":', '');
 //const setBest = myArray[1]
        //.replace(':', '/n');
let p0 = roundState.toString().search("round");  
let p1 = roundState.toString().search("totalWeight");
let p2 = roundState.toString().search("thresholdWeight");

const bestRound = roundState.toString().slice(p0 + 7, p1 - 2);
const totalWeight = roundState.toString().slice(p1 + 13 , p2 - 2);
 //const totalWeight = roundState.toString().slice(p1.toNumber, 36);
let p3 = roundState.toString().search("prevotes")
const thresholdWeight = roundState.toString().slice(p2 + 17, p3 - 2);

const percentFinalized = 75; 
//const currentAuthorities = authorities.toString();

//const isStalled = stalled.toString();
//bestRound.toNumber()/currentBlock.toNumber();
//let p4 = roundState.toString().search("prevotes");
//let p5 = roundState.toString().search("missing");
//let p6 = roundState.toString().search("precommits");
//let p7 = roundState.toString().search("background");
//const missing = roundState.toString().slice( p4 , p7 - 3);

//let p7 = roundState.toString().search("missing");

//{"setId":1,"best":{"round":1025,"totalWeight":1,"thresholdWeight":1,"prevotes":{"currentWeight":1,"missing":[]},"precommits":{"currentWeight":0,"missing":["5FA9nQDVg267DEd8m1ZypXLBnvN7SFxYwV7ndqSYGiN9TTpu"]}},"background":[]}

  return (
    <Container>  
    <Grid.Column>
      <h1>Block Finality Data</h1>
      <Table.Cell width={2} textAlign="center">
                <Statistic size='mini'>
                <Statistic.Label>Block:</Statistic.Label>
                <Statistic.Value>{currentBlock}</Statistic.Value>
                </Statistic>
                <Statistic size='mini'>
                <Statistic.Label>SetID:</Statistic.Label>
                <Statistic.Value>{setID}</Statistic.Value>
                </Statistic>
                <Statistic size='mini'>
                <Statistic.Label>Best: </Statistic.Label>
                <Statistic.Value>{setBest}</Statistic.Value>
                </Statistic>
                <Statistic size='mini'>
                <Statistic.Label>Round: </Statistic.Label>
                <Statistic.Value>{bestRound}</Statistic.Value>
                </Statistic>
                <Statistic size='mini'>
                <Statistic.Label>Total Weight: </Statistic.Label>
                <Statistic.Value>{totalWeight}</Statistic.Value>
                </Statistic>
                <Statistic size='mini'>
                <Statistic.Label>Threshold Weight: </Statistic.Label>
                <Statistic.Value>{thresholdWeight}</Statistic.Value>
                </Statistic>
                <Statistic size='mini'>
                <Statistic.Label>Stalled: </Statistic.Label>
                <Statistic.Value>{stalled.toString()}</Statistic.Value>
                </Statistic>
                <Statistic size='mini'>
                <Statistic.Label> Max Authorities: </Statistic.Label>
                <Statistic.Value>{100}</Statistic.Value>
                </Statistic>
                    
                </Table.Cell>
    <Table celled striped size="small">
        <Table.Body>
        <Table.Row>
        <Table.Cell width={2} testAlign="center">
        <Modal trigger={<Button circular color='teal' size='mini'> Show Round State </Button>}>
                    <Modal.Header>Round State</Modal.Header>
                    <Modal.Content scrolling wrapped>
                    <Modal.Description>
                    <pre>
                           <code>                             
                               {myArray[0]} <br>
                               </br> 
                               {myArray[1]} <br>
                               </br>
                               {myArray[2]} <br>
                               </br>
                               {myArray[3]} <br>
                               </br> 
                               {myArray[4]} <br>
                               </br>
                               {myArray[5]} <br>
                               </br>
                               {myArray[6]} <br>
                               </br>
                               {myArray[7]} <br>
                               </br>
                            </code>
                    </pre>
                    </Modal.Description>
                    </Modal.Content>
                </Modal>
                </Table.Cell>

        <Table.Cell width={2} textAlign="center">
        <strong> % of Blocks Finalized</strong>
                    <div style={{ width: 50, height: 50 }}>
                        <CircularProgressbar value={percentFinalized} text= {`${percentFinalized}%`} strokeWidth={12}/>
                    </div>
        </Table.Cell>
        <Table.Cell width={2} textAlign="center">
        <strong> % of Era</strong>
                    <div style={{ width: 50, height: 50 }}>
                        <CircularProgressbar value={66} text= {`${66}%`} strokeWidth={12}/>
                    </div>
        </Table.Cell>
        <Table.Cell width={2} textAlign="center">
        <strong> % of Epoch</strong>
                    <div style={{ width: 50, height: 50 }}>
                        <CircularProgressbar value={66} text= {`${66}%`} strokeWidth={12}/>
                    </div>
        </Table.Cell>
        <Table.Cell width={4} textAlign="left">
        <Modal trigger={<Button circular color='teal' size='mini'> Show Authorities </Button>}>
                    <Modal.Header>Authorities</Modal.Header>
                    <Modal.Content scrolling wrapped>
                    <Modal.Description>
                    <pre>
                           <code>                             
                            {authorities.toString()}
                            </code>
                    </pre>
                    </Modal.Description>
                    </Modal.Content>
                </Modal>
            
          
          
          
          
          
            </Table.Cell>
                </Table.Row>
            </Table.Body>
        </Table>
    </Grid.Column>
    </Container>
  )
}

export default function Grandpa(props) {
  const { api } = useSubstrateState()
  return api.rpc &&
    api.rpc.system ? (
    <Main {...props} />
  ) : null
}