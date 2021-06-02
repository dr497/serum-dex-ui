import React, { useEffect, useState } from 'react';
import { Button, Col, Row, Input, Space, Grid, Statistic } from 'antd';
import { findNftFromMarket } from '../utils/nfts/utils';
import {
  useMarket,
  useBalances,
  useSelectedBaseCurrencyAccount,
  useSelectedQuoteCurrencyAccount,
  useFeeDiscountKeys,
  useLocallyStoredFeeDiscountKey,
  useOpenOrders,
} from '../utils/markets';
import { NFT } from '../utils/nfts';
import { useNftInfo } from '../utils/nfts/utils';
import { AddressLink } from './ExplorerLink';
import { RedeemableTag, OwnedTag } from './NftCard';
import { useWallet } from '../utils/wallet';
import { placeOrder, cancelOrder } from '../utils/send';
import { notify } from '../utils/notifications';
import { useSendConnection, useConnection } from '../utils/connection';
import { useHistory } from 'react-router-dom';
import { getProgramAccounts } from '../utils/wallet';

const { useBreakpoint } = Grid;

const { Countdown } = Statistic;

const Line = () => {
  return <div className="line" />;
};

const TradeForm = ({ nft }: { nft: NFT }): JSX.Element => {
  const history = useHistory();
  const [bidPrice, setBidPrice] = useState<string | null>(null);
  const [askPrice, setAskPrice] = useState<string | null>(null);
  const { wallet, connected } = useWallet();
  const [hasNft, setHasNft] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const balances = useBalances();
  const sendConnection = useSendConnection();
  const baseCurrencyAccount = useSelectedBaseCurrencyAccount();
  const quoteCurrencyAccount = useSelectedQuoteCurrencyAccount();
  useFeeDiscountKeys();
  const {
    storedFeeDiscountKey: feeDiscountKey,
  } = useLocallyStoredFeeDiscountKey();

  const openOrders = useOpenOrders();

  const [openOrder, setOpenOrder] = useState<any | null>(null);
  const connection = useConnection();

  let loaded = openOrders?.length;

  useEffect(() => {
    openOrders?.map((o) => {
      if (o.market.address.toBase58() === nft.marketAddress.toBase58()) {
        setOpenOrder(o);
      }
    });
  }, [loaded]);

  useEffect(() => {
    balances?.forEach((b) => {
      if (b.wallet && b.coin === nft.name && b.wallet > 0) {
        setHasNft(true);
      }
    });
  }, []);

  useEffect(() => {
    const get = async () => {
      let result = await getProgramAccounts(wallet?.publicKey);

      result = result?.map((t) => {
        return {
          mint: t?.account?.data?.parsed?.info?.mint,
          amount: t?.account?.data?.parsed?.info?.tokenAmount?.uiAmount,
        };
      });
      return result;
    };
    get().then((result) => {
      result?.forEach((e) => {
        if (e.mint === nft.mintAddress.toBase58() && e.amount > 0) {
          setHasNft(true);
        }
      });
    });
  }, [connected]);

  const { market } = useMarket();
  const { bestBid, bestAsk, quoteCurrency: quote, supply } = useNftInfo(
    nft.mintAddress,
    market?.address,
  );

  const placeBid = async () => {
    if (!bidPrice) {
      console.warn('Missing price');
      notify({ message: 'Missing price', type: 'error' });
      return;
    }
    setSubmitting(true);
    try {
      await placeOrder({
        side: 'buy',
        price: parseFloat(bidPrice),
        size: 1,
        orderType: 'limit',
        market: market,
        connection: sendConnection,
        wallet: wallet,
        baseCurrencyAccount: baseCurrencyAccount?.pubkey,
        quoteCurrencyAccount: quoteCurrencyAccount?.pubkey,
        feeDiscountPubkey: feeDiscountKey,
      });
    } catch (e) {
      console.warn(e);
      notify({
        message: 'Error placing order',
        description: e.message,
        type: 'error',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const buyBestOffer = async () => {
    console.log('Accepting offer');
    if (!bestAsk) {
      console.warn('No offer to take');
      notify({ message: 'No offer to take', type: 'error' });
      return;
    }
    setSubmitting(true);
    try {
      await placeOrder({
        side: 'buy',
        price: bestAsk,
        size: 1,
        orderType: 'limit',
        market: market,
        connection: sendConnection,
        wallet: wallet,
        baseCurrencyAccount: baseCurrencyAccount?.pubkey,
        quoteCurrencyAccount: quoteCurrencyAccount?.pubkey,
        feeDiscountPubkey: feeDiscountKey,
      });
    } catch (e) {
      console.warn(e);
      notify({
        message: 'Error placing order',
        description: e.message,
        type: 'error',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const placeAsk = async () => {
    console.log('Placing ask');
    if (!askPrice) {
      console.warn('Missing Price');
      notify({ message: 'Missing Price', type: 'error' });
      return;
    }
    setSubmitting(true);
    try {
      await placeOrder({
        side: 'sell',
        price: parseFloat(askPrice),
        size: 1,
        orderType: 'limit',
        market: market,
        connection: sendConnection,
        wallet: wallet,
        baseCurrencyAccount: baseCurrencyAccount?.pubkey,
        quoteCurrencyAccount: quoteCurrencyAccount?.pubkey,
        feeDiscountPubkey: feeDiscountKey,
      });
    } catch (e) {
      console.warn(e);
      notify({
        message: 'Error placing order',
        description: e.message,
        type: 'error',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const sellBestBid = async () => {
    console.log('Taking best bid');
    if (!bestBid) {
      console.warn('No bid');
      notify({ message: 'No Bid', type: 'error' });
      return;
    }
    setSubmitting(true);
    try {
      await placeOrder({
        side: 'sell',
        price: bestBid,
        size: 1,
        orderType: 'limit',
        market: market,
        connection: sendConnection,
        wallet: wallet,
        baseCurrencyAccount: baseCurrencyAccount?.pubkey,
        quoteCurrencyAccount: quoteCurrencyAccount?.pubkey,
        feeDiscountPubkey: feeDiscountKey,
      });
    } catch (e) {
      console.warn(e);
      notify({
        message: 'Error placing order',
        description: e.message,
        type: 'error',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const cancelOpenOrder = async () => {
    setSubmitting(true);
    try {
      if (!openOrder) {
        return;
      }
      await cancelOrder({
        order: openOrder,
        market: openOrder.market,
        connection,
        wallet,
      });
    } catch (e) {
      notify({
        message: 'Error cancelling openOrder',
        description: e.message,
        type: 'error',
      });
      return;
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Space direction="vertical" style={{ width: '100%' }}>
      {hasNft && nft.redeembable && (
        <>
          <Row justify="end" align="middle" style={{ paddingBottom: 20 }}>
            <Button
              className="buy-button"
              disabled={submitting}
              onClick={() => history.push(`/redeem/${nft.mintAddress}`)}
            >
              Redeem
            </Button>
          </Row>
        </>
      )}
      {!hasNft && !(openOrder?.side === 'sell') && (
        <>
          <Row
            justify="space-between"
            align="middle"
            style={{ paddingTop: 20 }}
          >
            <Col className="trade-form-label">Price:</Col>
            <Col className="trade-form-description">
              {bestAsk} {quote}
            </Col>
          </Row>
          <Row justify="end" align="middle" style={{ paddingBottom: 20 }}>
            <Button
              className="buy-button"
              disabled={submitting}
              onClick={buyBestOffer}
            >
              Buy now
            </Button>
          </Row>
          <Row
            align="middle"
            justify="space-between"
            style={{ paddingTop: 20 }}
          >
            <Col className="trade-form-label">Place Bid</Col>
            <Col className="trade-form-description">
              <Input
                placeholder="Bid price"
                suffix={quote}
                style={{ width: 200, borderColor: '#b3b3ff', marginRight: 10 }}
                onChange={(e) => {
                  setBidPrice(e.target.value.trim());
                }}
              />
              <Button className="button-place-bid" onClick={placeBid}>
                Place bid
              </Button>
            </Col>
          </Row>
        </>
      )}
      {hasNft && (
        <>
          <Row
            align="middle"
            justify="space-between"
            style={{ paddingTop: 20 }}
          >
            <Col className="trade-form-label">Sell price</Col>
            <Col className="trade-form-description">
              <Input
                placeholder="Sell price"
                suffix={quote}
                style={{ width: 200, borderColor: '#b3b3ff', marginRight: 10 }}
                onChange={(e) => {
                  setAskPrice(e.target.value.trim());
                }}
              />
              <Button className="button-place-bid" onClick={placeAsk}>
                Set price
              </Button>
            </Col>
          </Row>
          <Row
            align="middle"
            justify="space-between"
            style={{ paddingTop: 20 }}
          >
            <Col className="trade-form-label">Bids</Col>
            <Col className="trade-form-description">
              Highest Bid: {bestBid} {quote}
              <Button
                className="button-place-bid"
                onClick={sellBestBid}
                style={{ marginLeft: 20 }}
              >
                Accept Bid
              </Button>
            </Col>
          </Row>
        </>
      )}
      {!hasNft && bestBid && !(openOrder?.side === 'sell') && (
        <Row justify="start" align="middle" style={{ paddingBottom: 10 }}>
          <Col flex="auto" />
          <Col>
            Highest Bid: {bestBid} {quote}
          </Col>
        </Row>
      )}
      {openOrder?.side === 'buy' && (
        <>
          <Row
            align="middle"
            justify="space-between"
            style={{ paddingTop: 20 }}
          >
            <Col className="trade-form-label">Your bid</Col>
            <Col className="trade-form-description">
              <Input
                // @ts-ignore
                placeholder={openOrder.price}
                disabled={true}
                suffix={quote}
                style={{
                  width: 200,
                  borderColor: '#b3b3ff',
                  marginRight: 10,
                }}
                onChange={(e) => {
                  setBidPrice(e.target.value.trim());
                }}
              />
              <Button
                className="button-place-bid"
                onClick={() => cancelOpenOrder()}
              >
                Cancel
              </Button>
            </Col>
          </Row>
        </>
      )}
      {openOrder?.side === 'sell' && (
        <>
          <Row
            align="middle"
            justify="space-between"
            style={{ paddingTop: 20 }}
          >
            <Col className="trade-form-label">Your offer</Col>
            <Col className="trade-form-description">
              <Input
                // @ts-ignore
                placeholder={openOrder.price}
                disabled={true}
                suffix={quote}
                style={{
                  width: 200,
                  borderColor: '#b3b3ff',
                  marginRight: 10,
                }}
                onChange={(e) => {
                  setBidPrice(e.target.value.trim());
                }}
              />
              <Button
                className="button-place-bid"
                onClick={() => cancelOpenOrder()}
              >
                Cancel
              </Button>
            </Col>
          </Row>
        </>
      )}
      <Row
        justify="space-between"
        align="middle"
        style={{ paddingTop: 20, paddingBottom: 20 }}
      >
        <Col className="trade-form-label">Supply</Col>
        <Col className="trade-form-description">1 of {supply}</Col>
      </Row>

      {nft.description && (
        <Row
          justify="space-between"
          align="middle"
          style={{ paddingTop: 20, paddingBottom: 20 }}
        >
          <Col className="trade-form-label">Description</Col>
          <Col className="trade-form-description">{nft.description}</Col>
        </Row>
      )}
      <Row
        justify="space-between"
        align="middle"
        style={{ paddingTop: 20, paddingBottom: 20 }}
      >
        <Col className="trade-form-label">Mint address</Col>
        <Col className="trade-form-description">
          <AddressLink address={nft.mintAddress} />
        </Col>
      </Row>
      {nft.description && (
        <Row
          justify="space-between"
          align="middle"
          style={{ paddingTop: 20, paddingBottom: 20 }}
        >
          {nft.description}
        </Row>
      )}
      {nft.redeemDescription && (
        <Row
          justify="space-between"
          align="middle"
          style={{ paddingTop: 20, paddingBottom: 20 }}
        >
          {nft.redeemDescription}
        </Row>
      )}
      {nft.redeembable &&
        nft.auctionDeadLine &&
        new Date().getTime() < Date.parse(nft.auctionDeadLine) && (
          <Countdown
            title="Auction will end in"
            value={Date.parse(nft.auctionDeadLine)}
          />
        )}
    </Space>
  );
};

const TradePanel = (): JSX.Element | null => {
  const smallScreen = !useBreakpoint().lg;
  const { market } = useMarket();
  const nft = findNftFromMarket(market?.address);
  const [hasNft, setHasNft] = useState(false);
  const balances = useBalances();

  useEffect(() => {
    balances?.forEach((b) => {
      if (b.wallet && b.coin === nft?.name && b.wallet > 0) {
        setHasNft(true);
      }
    });
  }, [balances, nft]);
  if (!nft) {
    return null;
  }
  return (
    <div
      className="trade-panel"
      style={{ height: smallScreen ? '60%' : '658px' }}
    >
      <Row align="middle" justify="start">
        <Col>
          <h1 className="title">{nft.name}</h1>
        </Col>
        <Col style={{ paddingLeft: 20, paddingRight: 10 }}>
          {nft.redeembable && <RedeemableTag />}
        </Col>
        {hasNft && <Col>{true && <OwnedTag />}</Col>}
      </Row>
      <Line />
      <Row align="middle" justify="space-around" style={{ height: '80%' }}>
        <Col flex="auto" />
        <Col>
          <img
            // @ts-ignore
            src={nft.img}
            alt=""
          />
        </Col>
        <Col flex="auto" />
        <Col flex="auto">
          <TradeForm nft={nft} />
        </Col>
        <Col flex="auto" />
      </Row>
    </div>
  );
};

export default TradePanel;
