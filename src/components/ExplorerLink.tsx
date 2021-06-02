import React from 'react';
import { PublicKey } from '@solana/web3.js';
import Link from './Link';

const EXPLORER = 'https://explorer.solana.com/address/';

export const AddressLink = ({ address }: { address: PublicKey }) => {
  return (
    <Link
      external
      to={EXPLORER + address.toBase58()}
      style={{ color: 'white', fontWeight: 'bold' }}
    >
      {address.toBase58().slice(0, 6)}...
      {address
        .toBase58()
        .slice(address.toBase58().length - 6, address.toBase58().length)}
    </Link>
  );
};
