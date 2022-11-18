import { defaultSnapOrigin } from '../config';
import { GetSnapsResponse, Snap } from '../types';
import { getBIP44AddressKeyDeriver } from '@metamask/key-tree';

import { Group } from "@semaphore-protocol/group"

const VOTE_CONTRACT_ADDR = "0xbFF54DEA53D243E35389e3f2C7F9c148b0113104"
const GROUP_CONTRACT_ADDR = "0x0A7C5f090Be105EfAb0Cf6705e4f7135c267A3E9"
const ETHERSCAN_IO = "https://goerli-optimism.etherscan.io/tx/"
import voteJson from "../../public/Vote.json"
import groupJson from "../../public/Group.json"


import { FullProof as groupFullProof} from "../../prover/group/proof";
import { FullProof as signalFullProof} from "../../prover/signal/proof";
function packToSolidityProof(proof) {
  return [
      proof.pi_a[0],
      proof.pi_a[1],
      proof.pi_b[0][1],
      proof.pi_b[0][0],
      proof.pi_b[1][1],
      proof.pi_b[1][0],
      proof.pi_c[0],
      proof.pi_c[1]
  ];
}
import { SolidityProof } from "@semaphore-protocol/proof"

import "@ethersproject/shims"
import { BigNumber, ethers } from 'ethers';

function getContract() {
  const provider = new ethers.providers.Web3Provider(window.ethereum)
  const signer = provider.getSigner(window.ethereum.selectedAddress)
  const voteContract = new ethers.Contract(VOTE_CONTRACT_ADDR, voteJson.abi, signer)
  const groupContract = new ethers.Contract(GROUP_CONTRACT_ADDR, groupJson.abi, signer)
  return [voteContract, groupContract]
}

let voteContract : ethers.Contract
let groupContract : ethers.Contract
if (typeof window !== `undefined`) {
  voteContract = getContract()[0]
  groupContract = getContract()[1]
}

/**
 * Get the installed snaps in MetaMask.
 *
 * @returns The snaps installed in MetaMask.
 */
export const getSnaps = async (): Promise<GetSnapsResponse> => {
  return (await window.ethereum.request({
    method: 'wallet_getSnaps',
  })) as unknown as GetSnapsResponse;
};

/**
 * Connect a snap to MetaMask.
 *
 * @param snapId - The ID of the snap.
 * @param params - The params to pass with the snap to connect.
 */
export const connectSnap = async (
  snapId: string = defaultSnapOrigin,
  params: Record<'version' | string, unknown> = {},
) => {
  await window.ethereum.request({
    method: 'wallet_enable',
    params: [
      {
        wallet_snap: {
          [snapId]: {
            ...params,
          },
        },
      },
    ],
  });
};

/**
 * Get the snap from MetaMask.
 *
 * @param version - The version of the snap to install (optional).
 * @returns The snap object returned by the extension.
 */
export const getSnap = async (version?: string): Promise<Snap | undefined> => {
  try {
    const snaps = await getSnaps();

    return Object.values(snaps).find(
      (snap) =>
        snap.id === defaultSnapOrigin && (!version || snap.version === version),
    );
  } catch (e) {
    console.log('Failed to obtain installed snap', e);
    return undefined;
  }
};

export function requestSnap(
    method: string,
    params?: unknown[],
): Promise<unknown> {
    const result = window.ethereum.request({
      method : "wallet_invokeSnap",
      params : [
        defaultSnapOrigin,
        {
          method : method, 
          params : params
        }
      ]
    });
    console.log({ method, params, result });
    return result;
}

export const isLocalSnap = (snapId: string) => snapId.startsWith('local:');

export const sendHello = async () => {
  return await requestSnap('hello')
};

export const updatePrivSeed = async (seedSeeq : string) => {
  await reconstrctGroupFromOnchainEvent(9)
  const ethNode = await getBIP44()
  const deriveEthNodeddress = await getBIP44AddressKeyDeriver(ethNode);
  const addressKey = await deriveEthNodeddress(Number(seedSeeq)); // 0 is default walletAddress
  const res = await requestSnap('update_priv_seed', [addressKey.address.toString()])
  const storeSeed = await requestSnap('get_seed')
  const identityCommitment = await getIdentityCommitment()
  window.alert("Seed is \"" + storeSeed + "\" " + "commitment is \"" + identityCommitment + "\"")
  return res
};

export const getBIP44 = async () => {
    return await requestSnap('get_bip44')
};

export const getIdentityCommitment = async () => {
    return await requestSnap('get_identity_commitment')
};

export const getRC = async (rand : string) => {
    return await requestSnap('get_rc', [rand])
};

export const getGroupProof = async (rand : string, idcs : string[]) => {
    return await requestSnap('get_group_proof', [rand, idcs])
};

export const getSignalProof = async (rand : string, msg : string, externalNullifier : string) => {
    return await requestSnap('get_signal_proof', [rand, msg, externalNullifier])
};

const TREE_DEPTH = 10
export async function reconstrctGroupFromOnchainEvent(
  group_id : number
) {
  //const group = new Group(TREE_DEPTH)
  let idcs = []

  const filter = groupContract.filters.MemberAdded(group_id, null, null, null)
  const START_BLOCK = 2758972
  const events = await groupContract.queryFilter(filter, START_BLOCK)
  console.log("events : ", events)
  events.forEach(event => {
    const identityCommitment = event.args[2]
    idcs.push(identityCommitment.toBigInt().toString())
    //group.addMembers([identityCommitment])
  });
  console.log("idcs : ", idcs)

  //return group
  return idcs
}

export const createGroup = async (name : string) => {
  window.alert("Start : Create Group ")
  // await window.ethereum.enable()
  let tx = await voteContract.createGroup(TREE_DEPTH, window.ethereum.selectedAddress)
  const group_id = await voteContract.callStatic.GROUP_ID()
  window.alert("Done : Create Group " + group_id + ", see " + ETHERSCAN_IO  + tx.hash)
}

export const addMember = async (group_id : number) => {
  const identityCommitment = await getIdentityCommitment()
  window.alert("Start : add Memeber " + identityCommitment + " in Group " + group_id)
  let tx = await voteContract.addMember(group_id, identityCommitment, {gasLimit : 1000000})
  window.alert("Done : Add Memeber " + identityCommitment + " In  Group " + group_id + ", see " + ETHERSCAN_IO + tx.hash)
}

export const voteInGroup = async (group_id : number, msg : string) => {
  window.alert("Start : vote \"" + msg + "\" in Group " + group_id )

  const rand = Math.floor(Math.random() * 1000000).toString()
  const rc = await getRC(rand)

  //const group = await reconstrctGroupFromOnchainEvent(group_id)
  const idcs = await reconstrctGroupFromOnchainEvent(group_id)
  const identityCommitment = await getIdentityCommitment()
  //const merkleProof: MerkleProof = group.generateProofOfMembership(group.indexOf(identityCommitment))

  const groupProof = await getGroupProof(rand, idcs) as groupFullProof
  const solidityGroupProof: SolidityProof = packToSolidityProof(groupProof.proof) as SolidityProof

  const externalNullifier = BigNumber.from(Math.floor(Math.random() * 1000000)).toBigInt()
  const signalProof = await getSignalProof(rand, msg, externalNullifier.toString()) as signalFullProof
  const soliditySignalProof : SolidityProof = packToSolidityProof(signalProof.proof) as SolidityProof

  window.alert("ZKP Generated!!! Start Verify on-chain ")

  const bytes32msg = ethers.utils.formatBytes32String(msg)
  let tx = await voteContract.vote(
    rc, group_id, solidityGroupProof,
    bytes32msg,
    signalProof.publicSignals.nullifierHash,
    externalNullifier,
    soliditySignalProof,
    {gasLimit : 10000000})
  
  window.alert("Done  : vote \"" + msg + "\" in Group " + group_id + ", see " + ETHERSCAN_IO + tx.hash)
}

