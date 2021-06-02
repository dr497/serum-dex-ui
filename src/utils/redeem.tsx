import { Connection, PublicKey, Transaction, Account } from '@solana/web3.js';
import Wallet from '@project-serum/sol-wallet-adapter';
import { Token, TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { sendTransaction } from './send';

const Urls = {
  postRedeemForm: 'https://wallet-api.bonfida.com/redeem',
};

export const sendSplToken = async ({
  connection,
  owner,
  sourceSpl,
  destination,
  amount,
  wallet,
}: {
  connection: Connection;
  owner: PublicKey;
  sourceSpl: PublicKey;
  destination: PublicKey;
  amount: number;
  wallet: Wallet;
}) => {
  const signers: Array<Account> = [];
  const tx = new Transaction();
  tx.add(
    Token.createTransferInstruction(
      TOKEN_PROGRAM_ID,
      sourceSpl,
      destination,
      owner,
      signers,
      amount,
    ),
  );

  return await sendTransaction({
    transaction: tx,
    signers: signers,
    wallet: wallet,
    connection: connection,
    sendingMessage: 'Sending NFT to burn authority...',
  });
};

export async function apiPost(path, body, headers) {
  try {
    let response = await fetch(path, {
      method: 'POST',
      body: JSON.stringify(body),
      headers: headers,
    });
    if (!response.ok) {
      return [];
    }
    let json = await response.json();
    return json;
  } catch (err) {
    console.log(err);
    return [];
  }
}

export const postRedeemForm = async (data) => {
  const result = await apiPost(Urls.postRedeemForm, data, {
    'Content-Type': 'application/json',
  });
  return result;
};
