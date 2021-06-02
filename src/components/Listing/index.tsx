import React, { useState, useEffect } from 'react';
import { Row, Select, Form, Input, Button, Typography } from 'antd';
import { isValidPublicKey, isValidMarket } from '../../utils/utils';
import { notify } from '../../utils/notifications';
import { useConnection } from '../../utils/connection';
import { PublicKey, Connection } from '@solana/web3.js';
import { NFT } from '../../utils/nfts';
import Link from '../Link';

const { Title, Paragraph } = Typography;
const { Option } = Select;

const styles = {
  formContainer: {
    maxWidth: 500,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    maxWidth: 800,
  },
  title: {
    margin: 40,
  },
  leftAlign: {
    textAlign: 'left',
  } as React.CSSProperties,
};

const URLS = {
  githubPr:
    'https://github.com/dr497/serum-dex-ui/edit/solible/src/utils/nfts/nfts.json',
  pinata: 'https://pinata.cloud/',
  listMarket: 'https://dex.bonfida.com/#/list-new-market',
  github: 'https://github.com',
  mint: 'https://www.spl-token-ui.com/#/',
};

const ListingExplainer = () => {
  return (
    <>
      <Row justify="center">
        <Title level={1} style={styles.title}>
          Solible - Listing
        </Title>
      </Row>

      <Row justify="center">
        <Title level={2}>How to list on Solible?</Title>
      </Row>
      <Paragraph>
        We want Solible to be open source and self maintained. What does it mean
        in practice?
        <ul>
          <li>Solible repository is open source on Github</li>
          <li>Anyone can submit a pull request (PR) to list an NFT</li>
          <li>Listing an NFT is free</li>
        </ul>
      </Paragraph>

      <Row justify="center">
        <Title level={2}>What do you need to list on Solible?</Title>
      </Row>
      <Paragraph>
        <ul>
          <li>
            A{' '}
            <Link external to={URLS.github}>
              GitHub
            </Link>{' '}
            account
          </li>
          <li>
            You need to mint the token you want to list. It needs to be a token
            with 0 decimals. You can mint tokens here{' '}
            <Link external to={URLS.mint}>
              SPL Token Creator
            </Link>
          </li>
          <li>
            You need to have created the market on which you want the NFT to be
            traded on. You can create a Serum market here:{' '}
            <Link external to={URLS.listMarket}>
              Add a Serum market
            </Link>
          </li>
          <li>A high resolution version of the art piece hosted on IPFS</li>
          <li>
            A low resolution (300 x 300px) of the art piece hosted on IPFS
          </li>
          <li>
            Use the form below to generate the meta data needed for listing
          </li>
          <li>
            Once you have generated the meta data click on{' '}
            <b>Submit Pull Request on GitHub</b> to add the metadata to the list
            of NFTs available on Solible
          </li>
        </ul>
      </Paragraph>

      <Row justify="center">
        <Title level={2}>Why host on IPFS?</Title>
      </Row>
      <Paragraph>
        The InterPlanetary File System (IPFS) is a protocol and peer-to-peer
        network for storing and sharing data in a distributed file system. IPFS
        uses content-addressing to uniquely identify each file in a global
        namespace connecting all computing devices. Files uploaded on IPFS have
        a unique identifier called CID or hash. Therefore each piece of art can
        be uniquely identified by this cryptographic hash.
      </Paragraph>
      <Paragraph>
        The main issue with traditional hosting is that a file could be modified
        without modifying the URL to access it. While with IPFS any small
        modification would result in a completely different hash. Therefore the
        hash contained in the meta data guarantees the originality of the art.
      </Paragraph>
      <Paragraph>
        You can use Pinata to host your art on IPFS:{' '}
        <Link external to={URLS.pinata}>
          Pinata
        </Link>
        .
      </Paragraph>
    </>
  );
};

const formItemLayout = {
  labelCol: {
    xs: {
      span: 24,
    },
    sm: {
      span: 12,
    },
  },
  wrapperCol: {
    xs: {
      span: 24,
    },
    sm: {
      span: 16,
    },
  },
};

const tailFormItemLayout = {
  wrapperCol: {
    xs: {
      span: 24,
      offset: 0,
    },
    sm: {
      span: 16,
      offset: 12,
    },
  },
};

const Listing = () => {
  const connection = useConnection();
  const [name, setName] = useState('');
  const [mint, setMint] = useState('');
  const [ipfs, setIpfs] = useState('');
  const [ipfsSmall, setIpfsSmall] = useState('');
  const [decimals, setDecimals] = useState('');
  const [supply, setSupply] = useState('');
  const [market, setMarket] = useState('');
  const [type, setType] = useState('IMAGE');
  const [githubText, setGithubText] = useState<JSX.Element | null>(null);

  const handleChangeName = (e) => {
    setName(e.target.value);
  };

  const handleChangeMint = (e) => {
    setMint(e.target.value.trim());
  };

  const handleChangeIpfs = (e) => {
    setIpfs(e.target.value.trim());
  };

  const handleChangeType = (v) => {
    setType(v);
  };

  const handleChangeSupply = (e) => {
    setSupply(e.target.value.trim());
  };

  const handleChangeIpfsSmall = (e) => {
    const address = e.target.value.trim();
    if (type === 'IMAGE') {
      const img = new Image();
      img.onload = function () {
        // @ts-ignore
        const width = this.width;
        // @ts-ignore
        const height = this.height;
        console.log('white, heihgt', width, height);
        if (width <= 300 && height <= 300) {
          setIpfsSmall(address);
        } else {
          notify({
            message: 'Invalid size - needs to be < 300 x 300',
            type: 'error',
          });
          setIpfsSmall('');
        }
      };
      img.src = address;
    } else if (type === 'VIDEO') {
      let vid = document.createElement('video');
      vid.src = address;
      if (vid.height <= 300 && vid.width <= 300) {
        setIpfsSmall(address);
      } else {
        notify({
          message: 'Invalid size - needs to be < 300 x 300',
          type: 'error',
        });
        setIpfsSmall('');
      }
    }
  };

  const handleChangeMarket = (e) => {
    setMarket(e.target.value.trim());
  };

  const canSubmit = name && mint && ipfsSmall && ipfs && market && supply;

  const submit = async () => {
    const validMarket = await isValidMarket(connection, market);
    const validMint = isValidPublicKey(mint);
    if (!validMarket) {
      notify({
        message: 'Invalid Market address',
        type: 'error',
      });
      return;
    }
    if (!validMint) {
      notify({
        message: 'Invalid mint address',
        type: 'error',
      });
      return;
    }

    const nft = new NFT(
      ipfs,
      ipfsSmall,
      name,
      parseFloat(supply),
      mint,
      market,
      false,
      name.trim().split(' '),
      // @ts-ignore
      type,
    );
    setGithubText(
      <div>
        <pre>{nft.toJson()}</pre>
      </div>,
    );
  };

  return (
    <div style={styles.container}>
      <ListingExplainer />
      <Row justify="center">
        <Title level={2} style={styles.title}>
          Listing Form
        </Title>
      </Row>
      <div style={styles.formContainer}>
        <Form {...formItemLayout} name="listing-form">
          <Form.Item label="Name">
            <Input value={name} onChange={handleChangeName} />
          </Form.Item>
          <Form.Item label="Market">
            <Input value={market} onChange={handleChangeMarket} />
          </Form.Item>
          <Form.Item label="Mint">
            <Input value={mint} onChange={handleChangeMint} />
          </Form.Item>
          <Form.Item label="Supply">
            <Input value={supply} onChange={handleChangeSupply} />
          </Form.Item>
          <Form.Item label="NFT Type">
            <Select defaultValue="IMAGE" onChange={handleChangeType}>
              <Option value="IMAGE">IMAGE</Option>
              <Option value="VIDEO">VIDEO</Option>
            </Select>
          </Form.Item>
          <Form.Item label="High Resolution (IPFS link)">
            <Input value={ipfs} onChange={handleChangeIpfs} />
          </Form.Item>
          <Form.Item label="Low Res. (300 x 300) (IPFS link)">
            <Input value={ipfsSmall} onChange={handleChangeIpfsSmall} />
          </Form.Item>
          <Form.Item {...tailFormItemLayout}>
            <Button disabled={!canSubmit} onClick={submit}>
              Submit
            </Button>
          </Form.Item>
        </Form>
      </div>

      {githubText && (
        <Row justify="center">
          <Paragraph>{githubText}</Paragraph>
          <Paragraph>
            <Link external to={URLS.githubPr}>
              <Button>Submit Pull Request on GitHub</Button>
            </Link>
          </Paragraph>
        </Row>
      )}
    </div>
  );
};

export default Listing;
