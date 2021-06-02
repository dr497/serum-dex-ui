import React from 'react';
import { Row, Col, Grid } from 'antd';
import { NftCard } from './NftCard';
import { getNftList } from '../utils/nfts';
import ButtonViewMore from './ButtonViewMore';

const { useBreakpoint } = Grid;

const MoreNfts = (): JSX.Element => {
  const smallScreen = !useBreakpoint().lg;
  const nfts = getNftList()
    .map((a) => ({ sort: Math.random(), value: a }))
    .sort((a, b) => a.sort - b.sort)
    .map((a) => a.value)
    .slice(0, 4);
  return (
    <>
      {!smallScreen && (
        <>
          <Row
            align="middle"
            justify="center"
            style={{ paddingTop: 80, paddingBottom: 40 }}
          >
            <h2 className="more-nfts">More NFTs</h2>
          </Row>
          <Row align="middle" justify="space-around">
            <Col flex="auto" />
            {nfts.map((nft) => {
              return (
                <Col
                  style={{ padding: 20 }}
                  key={`more-nfts-${nft.mintAddress.toBase58()}`}
                >
                  <NftCard mintAddress={nft.mintAddress} />
                </Col>
              );
            })}
            <Col flex="auto" />
          </Row>
        </>
      )}
      <Row
        align="middle"
        justify="center"
        style={{ marginBottom: 50, marginTop: smallScreen ? '30px' : 'unset' }}
      >
        <ButtonViewMore redeemable={false} />
      </Row>
    </>
  );
};

export default MoreNfts;
