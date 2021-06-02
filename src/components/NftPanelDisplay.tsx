import React from 'react';
import { Col, Row } from 'antd';
import { NftCard } from './NftCard';
import { NFT } from '../utils/nfts';
import ButtonViewMore from './ButtonViewMore';

export const NftPanelDisplayHomePage = ({
  title,
  NftsArray,
}: {
  title: string;
  NftsArray: NFT[];
}): JSX.Element => {
  return (
    <div className="nft-panel">
      <Row align="middle" justify="center">
        <h3
          style={{ fontWeight: 400, fontSize: 20, textTransform: 'uppercase' }}
        >
          {title}
        </h3>
      </Row>
      <Row align="middle" justify="center">
        {NftsArray.map((nft, i) => {
          return (
            <Col
              style={{ padding: 20 }}
              key={`nft-card-homepage-${nft.mintAddress.toBase58()}`}
            >
              <NftCard mintAddress={nft.mintAddress} />
            </Col>
          );
        })}
      </Row>
      <Row justify="center">
        <ButtonViewMore redeemable={title === 'redeemable'} />
      </Row>
    </div>
  );
};
