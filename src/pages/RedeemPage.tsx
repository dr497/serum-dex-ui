import React from 'react';
import RedeemForm from '../components/RedeemForm';
import { useParams, useHistory } from 'react-router-dom';
import { PublicKey } from '@solana/web3.js';
import { Row } from 'antd';
import { findNftFromMint } from '../utils/nfts/utils';

const RedeemPage = () => {
  const { mintAddress } = useParams();
  const history = useHistory();
  const nft = findNftFromMint(new PublicKey(mintAddress));
  if (!nft || !nft?.redeembable || !nft?.redeemAddress) {
    history.push('/');
  }

  return (
    <Row justify="center" style={{ paddingTop: 50 }}>
      <RedeemForm
        nftMint={new PublicKey(mintAddress)}
        // @ts-ignore
        destination={nft?.redeemAddress}
      />
    </Row>
  );
};

export default RedeemPage;
