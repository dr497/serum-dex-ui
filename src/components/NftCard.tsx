import React from 'react';
import { Col, Row } from 'antd';
import { PublicKey } from '@solana/web3.js';
import { findNftFromMint, useNftInfo } from '../utils/nfts/utils';
import { getExceptionalStyle } from '../utils/nfts';
import { useHistory } from 'react-router-dom';
import LazyLoad from 'react-lazyload';

interface TagI {
  style?: any;
}

export const RedeemableTag = (prop: TagI): JSX.Element => {
  return (
    <div className="redeemable-tag" style={prop.style}>
      Redeemable
    </div>
  );
};

export const OwnedTag = () => {
  return <div className="owned-tag">Owned by you</div>;
};

export const NftCard = ({
  mintAddress,
}: {
  mintAddress: PublicKey;
}): JSX.Element | null => {
  const nft = findNftFromMint(mintAddress);
  const { bestAsk, supply, quoteCurrency } = useNftInfo(
    mintAddress,
    nft?.marketAddress,
  );

  const history = useHistory();

  const onClick = (): void => {
    history.push(`/market/${nft?.marketAddress}`);
  };

  if (!nft) {
    return null;
  }
  return (
    <div className="nft-card" onClick={onClick}>
      {nft.redeembable && (
        <RedeemableTag style={getExceptionalStyle(nft.mintAddress)} />
      )}
      {nft.type === 'IMAGE' ? (
        <LazyLoad height={300}>
          <img
            // @ts-ignore
            src={nft.imgSmall}
            alt=""
          />
        </LazyLoad>
      ) : (
        <>
          <LazyLoad height={300}>
            <video
              width="400"
              muted
              loop
              autoPlay
              playsInline
              style={getExceptionalStyle(nft.mintAddress)}
            >
              <source
                // @ts-ignore
                src={nft.imgSmall}
                type="video/mp4"
              />
            </video>
          </LazyLoad>
        </>
      )}
      <div className="bottom">
        <Row justify="space-between">
          <Col style={{ paddingLeft: 15 }}>
            <span className="text-bold">{nft.name}</span>
            <br />
            {bestAsk && (
              <>
                <span className="text-bold">
                  {bestAsk} {quoteCurrency}
                </span>
                <br />
                <span className="text-light">Price</span>
              </>
            )}
          </Col>
          <Col style={{ textAlign: 'right', paddingRight: 15 }}>
            <b>{supply}</b>
            <br />
            Supply
          </Col>
        </Row>
      </div>
    </div>
  );
};
