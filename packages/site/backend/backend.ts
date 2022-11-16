import { default as express } from 'express'
import { ethers } from "ethers";

import { Group } from "@semaphore-protocol/group"
import { Identity } from "@semaphore-protocol/identity"
import { MerkleProof } from "@zk-kit/incremental-merkle-tree"

const VOTE_CONTRACT_ADDR = "0x0f5D1ef48f12b6f691401bfe88c2037c690a6afe"
const VOTE_CONTRACT_ABI = [
  "event GroupCreated(uint256 indexed groupId, uint256 merkleTreeDepth, uint256 zeroValue)",
  "event MemberAdded(uint256 indexed groupId, uint256 index, uint256 identityCommitment, uint256 merkleTreeRoot)",
  "function voteStat(uint256,bytes32) returns (uint256)",
  "function createGroup(uint256 groupId,uint256 merkleTreeDepth,address admin)",
  "function addMember(uint256 groupId,uint256 identityCommitment)",
  "function vote(uint256 rc,uint256 groupId,uint256[8] group_proof,bytes32 voteMsg,uint256 nullifierHash,uint256 externalNullifier,uint256[8] signal_proof)",
]

const PROVIDER = new ethers.providers.JsonRpcProvider("http://localhost:8545")
const PRIV_KEY = `0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d` // 0x70997970c51812dc3a010c7d01b50e0d17dc79c8
const signer = new ethers.Wallet(PRIV_KEY, PROVIDER)
console.log("signer.address : ", signer.address)
const voteContract = new ethers.Contract(VOTE_CONTRACT_ADDR, VOTE_CONTRACT_ABI, signer)

let GROUPS = {}
async function constructGroupFromOnchain() {
  // 1. parse onchain GroupCreated event, create group
	let filter = {}
  const events = await voteContract.queryFilter(filter, 0)
  console.log("events : ", events)
  // const group = new Group(TREE_DEPTH)
  // GROUPS[id] = group

  // 2. parse onchain MemberAdded event , add member in right order
  // group.addMembers([identityCommitment])
}

async function getMerkleProof(
  group_id : number,
  identityCommitment : string
) {
  // const group = GROUPS[group_id]
  // const merkleProof: MerkleProof = group.generateProofOfMembership(group.indexOf(identityCommitment))
  // return merkleProof
}

const app = express()
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

var CUR_GROUP_ID = 105

app.get('/', function (req, res) {
  res.send('Manta-voting backend!!!')
})

// app.get('/create_group', async function (req, res) {

//   console.log(req.query)

//   // on-chain create group
//   CUR_GROUP_ID++
//   let tx = await voteContract.createGroup(CUR_GROUP_ID, 10, signer.address)

//   var response = {
//     "group_id" : CUR_GROUP_ID,
//     "txHash" : tx.hash
//   }
//   res.end(JSON.stringify(response));
// })

// app.post('/join_group', async function (req, res) {
//   console.log(req.body)

//   const id = new Identity(req.body.seed)
//   let tx = await voteContract.addMember(CUR_GROUP_ID, id.getCommitment())

//   var response = {
//     "txHash" : tx.hash
//   }
//   res.end(JSON.stringify(response));
// })

app.get('/get_merkle_proof', async function (req, res) {
  await constructGroupFromOnchain()

  console.log(req.body)
  var response = {
  }
  //const merkleProof = await getMerkleProof(gid, idc)
  res.end(JSON.stringify(response));
})



app.listen(8081)
