import React, { useEffect, useState } from 'react';
import { Row, Col, Spin } from 'antd';
import { NftCard } from '../components/NftCard';
import { getNftList } from '../utils/nfts';
import { useLocation } from 'react-router-dom';
import { useTokenAccounts } from '../utils/utils';
import { useWallet } from '../utils/wallet';
import { useConnection } from '../utils/connection';
import { NFT } from '../utils/nfts';
import { LoadingOutlined } from '@ant-design/icons';
import { getProgramAccounts } from '../utils/wallet';

const antIcon = <LoadingOutlined style={{ fontSize: 80 }} spin />;

const CollectionPage = (): JSX.Element => {
  let allNfts = getNftList();
  const [nfts, setNfts] = useState<Array<NFT>>([]);
  const { wallet, connected } = useWallet();
  const connection = useConnection();
  const { balances, loaded } = useTokenAccounts(wallet?.publicKey, connection);
  const rows = [...Array(Math.ceil(nfts?.length / 4))];
  const productRows = rows.map((row, idx) => nfts?.slice(idx * 4, idx * 4 + 4));
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const keywords = params.get('keywords')?.split('-');

  useEffect(() => {
    let intersection: NFT[] = [];
    const get = async () => {
      if (!connected) {
        return;
      }
      let result = await getProgramAccounts(wallet?.publicKey);
      result = result?.map((t) => {
        return {
          amount: t?.account?.data?.parsed?.info?.tokenAmount?.uiAmount,
          mint: t?.account?.data?.parsed?.info?.mint,
        };
      });

      return result?.filter((e) => e.amount > 0);
    };
    get().then((r) => {
      let result = r?.map((e) => e.mint);
      allNfts.forEach((x) => {
        if (result?.includes(x.mintAddress.toBase58())) {
          intersection.push(x);
        }
      });
    });

    setNfts(intersection);
  }, [connected]);

  if (!connected) {
    return (
      <Row align="middle" justify="center" style={{ paddingTop: 50 }}>
        <h1 className="explore-page-title">Please connect your wallet</h1>
      </Row>
    );
  }

  return (
    <>
      <Row align="middle" justify="space-around" style={{ paddingTop: 50 }}>
        <Col>
          <h1 className="explore-page-title">Your collection</h1>
        </Col>
        {/* <Col>Sort options</Col> */}
      </Row>
      {productRows.map((row, idx) => {
        return (
          <Row
            align="middle"
            justify="center"
            style={{ paddingBottom: 20 }}
            key={`collection-${idx}`}
          >
            {row.map((nft, i) => {
              if (nfts.length > 0) {
                return (
                  <Col style={{ padding: 20 }} key={`col-collection-${i}`}>
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

export default CollectionPage;
