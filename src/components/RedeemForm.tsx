import React, { useState, useRef } from 'react';
import {
  Form,
  Input,
  InputNumber,
  Button,
  Spin as SpinAntd,
  Row,
  Col,
  Alert,
} from 'antd';
import {
  LoadingOutlined,
  GlobalOutlined,
  UserOutlined,
  PhoneOutlined,
  FileSearchOutlined,
  MailOutlined,
} from '@ant-design/icons';
import { PublicKey } from '@solana/web3.js';
import { postRedeemForm, sendSplToken } from '../utils/redeem';
import { useWallet } from '../utils/wallet';
import { useTokenAccounts } from '../utils/markets';
import { useConnection } from '../utils/connection';
import { notify } from '../utils/notifications';
import styled from 'styled-components';
import { findNftFromMint } from '../utils/nfts/utils';
import { NFT } from '../utils/nfts';
import waves from '../assets/homepage/bonfida_waves.svg';

const StyledInput = styled(Input)`
  .ant-input {
    color: white;
  }
`;

const StyledInputNumber = styled(InputNumber)`
  .ant-input-number-input {
    color: white;
  }
`;

const Spin = () => {
  const antIcon = <LoadingOutlined style={{ fontSize: 24 }} spin />;
  return <SpinAntd indicator={antIcon} />;
};

const layout = {
  labelCol: {
    span: 8,
  },
  wrapperCol: {
    span: 16,
  },
};
const validateMessages = {
  required: '${label} is required!',
  types: {
    email: '${label} is not a valid email!',
    number: '${label} is not a valid number!',
  },
  number: {
    range: '${label} must be between ${min} and ${max}',
  },
};

const RedeemForm = ({
  nftMint,
  destination,
}: {
  nftMint: PublicKey;
  destination: PublicKey;
}) => {
  const [submitting, setSubmitting] = useState(false);
  const connection = useConnection();
  const { wallet } = useWallet();
  const [tokenAccounts] = useTokenAccounts();
  const source = tokenAccounts?.filter(
    (e) => e.effectiveMint.toBase58() === nftMint.toBase58(),
  );
  const [submitted, setSubmitted] = useState(false);

  const emailRef = useRef<string | null>(null);
  const nameRef = useRef<string | null>(null);
  const phoneRef = useRef<string | null>(null);
  const amountRef = useRef(0);
  const countryRef = useRef<string | null>(null);
  const cityRef = useRef<string | null>(null);
  const addressRef = useRef<string | null>(null);
  const postCodeRef = useRef<string | null>(null);
  const additionalRef = useRef<string | null>(null);

  const nft = findNftFromMint(nftMint);
  if (!nft) {
    return null;
  }

  if (!source || source?.length === 0) {
    console.log('Error getting source');
    return null;
  }

  const styles = {
    icon: { color: 'white' },
    label: { color: 'white', fontSize: 16, fontWeight: 700 },
    placeHolder: { color: 'white' },
  };

  const onFinish = async (values) => {
    setSubmitting(true);
    try {
      const amount = Math.round(amountRef.current);
      if (!amount || amount <= 0) {
        throw new Error('Invalid amount');
      }
      const txid = await sendSplToken({
        connection: connection,
        owner: wallet.publicKey,
        sourceSpl: source[0]?.pubkey,
        destination: destination,
        amount: amount,
        wallet: wallet,
      });

      const postBody = {
        email: emailRef.current,
        name: nameRef.current,
        phone: phoneRef.current,
        amount: amountRef.current,
        country: countryRef.current,
        city: cityRef.current,
        address: addressRef.current,
        postcode: postCodeRef.current,
        'additional-information': additionalRef.current,
        txId: txid,
      };

      await postRedeemForm(postBody);
      notify({ message: 'Redeem request successful', type: 'success', txid });
      setSubmitted(true);
    } catch (err) {
      console.log(`Error redeeming: ${err}`);
      notify({
        message: 'Error redeeming',
        type: 'error',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Row className="redeem-form" justify="center">
        <h1 style={{ paddingLeft: 40, paddingTop: 30 }}>Redeem {nft?.name}</h1>
        <Col style={{ color: 'white', padding: 50 }}>
          <Form
            {...layout}
            name="redeem"
            onFinish={onFinish}
            validateMessages={validateMessages}
            style={{ paddingTop: 10, paddingRight: 40, color: 'white' }}
          >
            <Form.Item
              name={['user', 'email']}
              label={<div style={styles.label}>Email</div>}
              rules={[
                {
                  type: 'email',
                  required: true,
                },
              ]}
              style={styles.icon}
            >
              <StyledInput
                prefix={<MailOutlined style={styles.icon} />}
                onChange={(e) => (emailRef.current = e.target.value)}
              />
            </Form.Item>
            <Form.Item
              name={['user', 'name']}
              label={<div style={styles.label}>Name</div>}
              rules={[
                {
                  required: true,
                  message: 'Please enter your name',
                },
              ]}
            >
              <StyledInput
                prefix={<UserOutlined style={styles.icon} />}
                onChange={(e) => (nameRef.current = e.target.value)}
              />
            </Form.Item>
            <Form.Item
              name={['user', 'phone']}
              label={<div style={styles.label}>Phone Number</div>}
              rules={[
                {
                  required: true,
                  message: 'Please input your phone number',
                },
              ]}
            >
              <StyledInput
                prefix={<PhoneOutlined style={styles.icon} />}
                onChange={(e) => (phoneRef.current = e.target.value)}
              />
            </Form.Item>
            <Form.Item
              name={['user', 'amount']}
              label={<div style={styles.label}>Amount to redeem</div>}
              rules={[
                {
                  required: true,
                  message:
                    'Please enter the amount of token you want to redeem',
                  type: 'number',
                  min: 0,
                  max: 99,
                },
              ]}
            >
              <StyledInputNumber
                onChange={(e) => {
                  if (e) {
                    amountRef.current = parseFloat(e.toString());
                  }
                }}
              />
            </Form.Item>

            <Form.Item
              name={['user', 'country']}
              label={<div style={styles.label}>Country</div>}
              rules={[
                {
                  required: true,
                  message: 'Please enter your country',
                },
              ]}
            >
              <StyledInput
                prefix={<GlobalOutlined style={styles.icon} />}
                onChange={(e) => (countryRef.current = e.target.value)}
              />
            </Form.Item>
            <Form.Item
              name={['user', 'City']}
              label={<div style={styles.label}>City</div>}
              rules={[
                {
                  required: true,
                  message: 'Please enter your city',
                },
              ]}
            >
              <StyledInput
                prefix={<GlobalOutlined style={styles.icon} />}
                onChange={(e) => (cityRef.current = e.target.value)}
              />
            </Form.Item>
            <Form.Item
              name={['user', 'address']}
              label={<div style={styles.label}>Address</div>}
              rules={[
                {
                  required: true,
                  message: 'Please enter your address',
                },
              ]}
            >
              <StyledInput
                prefix={<GlobalOutlined style={styles.icon} />}
                onChange={(e) => (addressRef.current = e.target.value)}
              />
            </Form.Item>
            <Form.Item
              name={['user', 'postcode']}
              label={<div style={styles.label}>Postcode</div>}
              rules={[
                {
                  required: true,
                  message: 'Please enter your postcode',
                },
              ]}
            >
              <StyledInput
                prefix={<GlobalOutlined style={styles.icon} />}
                onChange={(e) => (postCodeRef.current = e.target.value)}
              />
            </Form.Item>
            <Form.Item
              name={['user', 'additional-information']}
              label={<div style={styles.label}>Additional info.</div>}
              rules={[
                {
                  required: false,
                },
              ]}
            >
              <StyledInput
                onChange={(e) => (additionalRef.current = e.target.value)}
                prefix={<FileSearchOutlined style={styles.icon} />}
              />
            </Form.Item>
            <Form.Item wrapperCol={{ ...layout.wrapperCol, offset: 8 }}>
              <Row align="middle" justify="center" style={{ paddingTop: 10 }}>
                <Button
                  className="buy-button"
                  type="primary"
                  htmlType="submit"
                  disabled={submitting}
                >
                  {submitting ? <Spin /> : 'Submit'}
                </Button>
              </Row>
            </Form.Item>
          </Form>
          {submitted && (
            <Alert
              style={{
                background: 'transparent',
                border: '1px solid',
                borderColor: '#51D07B',
              }}
              message={
                <div style={{ fontSize: 14, textAlign: 'start' }}>
                  Successfully redeemed. You will receive an email shortly to
                  confirm the redemption
                </div>
              }
              type="success"
              showIcon
            />
          )}
          <Help />
        </Col>
      </Row>
      <Row></Row>
    </>
  );
};

const Help = () => {
  const styles = {
    root: {
      textAlign: 'center',
      paddingLeft: 60,
      paddingTop: 20,
    } as React.CSSProperties,
  };
  return (
    <div style={styles.root}>
      If you are having issues redeeming please email{' '}
      <a href="mailto:redeem@solible.com">redeem@solible.com</a>
    </div>
  );
};

export const NftImage = ({ nft }: { nft: NFT }) => {
  return (
    <div
      style={{
        background: 'rgb(18, 24, 55)',
        height: 500,
        width: 500,
      }}
    >
      <Row
        align="middle"
        justify="center"
        style={{
          backgroundImage: `url(${waves})`,
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundSize: 'cover',
        }}
      >
        <img
          //@ts-ignore
          src={nft.imgSmall}
          style={{ margin: 'auto' }}
          alt=""
        />
      </Row>
    </div>
  );
};

export default RedeemForm;
