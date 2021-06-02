import React from 'react';
import { Row, Col } from 'antd';
import { NftCard } from '../components/NftCard';
import { getNftList } from '../utils/nfts';
import { useLocation } from 'react-router-dom';

const ExplorePage = (): JSX.Element => {
  let nfts = getNftList();

  const rows = [...Array(Math.ceil(nfts.length / 4))];
  const productRows = rows.map((row, idx) => nfts.slice(idx * 4, idx * 4 + 4));

  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const keywords = params.get('keywords')?.split('-');

  // TODO Filter pour redeembale et sort option on the side

  return (
    <>
      <Row align="middle" justify="space-around" style={{ paddingTop: 50 }}>
        <Col>
          {keywords ? (
            <h1 className="explore-page-title">
              Search results for: {keywords.toString()}
            </h1>
          ) : null}
        </Col>
        {/* <Col>Sort options</Col> */}
      </Row>
      {productRows.map((row, idx) => {
        return (
          <Row align="middle" justify="center" style={{ paddingBottom: 20 }}>
            {row.map((nft) => {
              const intersection = nft.keywords.filter((x) =>
                keywords?.includes(x),
              );
              if (intersection.length > 0 || !keywords) {
                return (
                  <Col style={{ padding: 20 }}>
                    <NftCard mintAddress={nft.mintAddress} />
                  </Col>
                );
              }
            })}
          </Row>
        );
      })}
    </>
  );
};

export default ExplorePage;
