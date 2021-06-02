import React, { useEffect } from 'react';
import { Row } from 'antd';
import TradePanel from '../components/TradePanel';
import { MarketProvider, getTradePageUrl } from '../utils/markets';
import { useParams, useHistory } from 'react-router-dom';
import MoreNfts from '../components/MoreNfts';

const TradePage = () => {
  const { marketAddress } = useParams();
  useEffect(() => {
    if (marketAddress) {
      localStorage.setItem('marketAddress', JSON.stringify(marketAddress));
    }
  }, [marketAddress]);
  const history = useHistory();
  function setMarketAddress(address) {
    history.push(getTradePageUrl(address));
  }

  return (
    <MarketProvider
      marketAddress={marketAddress}
      setMarketAddress={setMarketAddress}
    >
      <Row justify="center" style={{ paddingTop: 50 }}>
        <TradePanel />
      </Row>

      <MoreNfts />
    </MarketProvider>
  );
};

export default TradePage;
