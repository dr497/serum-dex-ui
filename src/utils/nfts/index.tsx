import { mintTo } from '@project-serum/serum/lib/token-instructions';
import { PublicKey } from '@solana/web3.js';
import nftsJson from './nfts.json';
import redeemableNftsJson from './redeemable.json';

enum NFT_Types {
  VIDEO = 'VIDEO',
  IMAGE = 'IMAGE',
  REDEEMABLE = 'REDEEMABLE',
}

export class NFT {
  img: string;
  imgSmall: string;
  name: string;
  supply: number;
  mintAddress: PublicKey;
  marketAddress: PublicKey;
  redeembable: boolean;
  keywords: string[];
  type: NFT_Types;
  redeemAddress?: PublicKey;
  redeemDescription?: string;
  auctionDeadLine?: string;
  description?: string;
  constructor(
    img: string,
    imgSmall: string,
    name: string,
    supply: number,
    mintAddress: string,
    marketAddress: string,
    redeembable: boolean,
    keywords: string[],
    type: NFT_Types,
    redeemAddress?: string,
    redeemDescription?: string,
    auctionDeadLine?: string,
    description?: string,
  ) {
    this.img = img;
    this.imgSmall = imgSmall;
    this.name = name;
    this.supply = supply;
    this.mintAddress = new PublicKey(mintAddress);
    this.marketAddress = new PublicKey(marketAddress);
    this.redeembable = redeembable;
    this.keywords = keywords;
    this.type = type;
    this.redeemAddress = redeemAddress
      ? new PublicKey(redeemAddress)
      : undefined;
    this.redeemDescription = redeemDescription;
    this.auctionDeadLine = auctionDeadLine;
    this.description = description;
  }
  toJson() {
    let nft: any = { ...this };
    nft.mintAddress = nft.mintAddress.toBase58();
    nft.marketAddress = nft.marketAddress.toBase58();
    return JSON.stringify(nft, null, 2);
  }
}

// @ts-ignore
const NFTS = nftsJson.map(
  ({
    img,
    imgSmall,
    name,
    supply,
    mintAddress,
    marketAddress,
    // @ts-ignore
    redeem,
    keywords,
    type,
    // @ts-ignore
    description,
  }) =>
    new NFT(
      img,
      imgSmall,
      name,
      supply,
      mintAddress,
      marketAddress,
      redeem,
      keywords,
      // @ts-ignore
      type,
      description,
    ),
);

const REDEEMABLE_NFTS = redeemableNftsJson.map(
  ({
    img,
    imgSmall,
    name,
    supply,
    mintAddress,
    marketAddress,
    // @ts-ignore
    redeem,
    keywords,
    type,
    redeemAddress,
    redeemDescription,
    auctionDeadLine,
    // @ts-ignore
    description,
  }) =>
    new NFT(
      img,
      imgSmall,
      name,
      supply,
      mintAddress,
      marketAddress,
      redeem,
      keywords,
      // @ts-ignore
      type,
      redeemAddress,
      redeemDescription,
      auctionDeadLine,
      description,
    ),
);

export default NFTS;

export const ALL = [...REDEEMABLE_NFTS, ...NFTS];

export const DEFAULT_NFT = new NFT(
  'https://gateway.pinata.cloud/ipfs/QmfFrkRRv4Lanpe3dEK3p1rRdKwspZXh8kBWLXZBRJaRyy/AcstFzGGawvvdVhYV9bftr7fmBHbePUjhv53YK1W3dZo/AcstFzGGawvvdVhYV9bftr7fmBHbePUjhv53YK1W3dZo.gif',
  'https://gateway.pinata.cloud/ipfs/QmfFrkRRv4Lanpe3dEK3p1rRdKwspZXh8kBWLXZBRJaRyy/AcstFzGGawvvdVhYV9bftr7fmBHbePUjhv53YK1W3dZo/small.mp4',
  'LSD',
  1,
  'AcstFzGGawvvdVhYV9bftr7fmBHbePUjhv53YK1W3dZo',
  'DG7rHpfmQ1CHi1KvvpTM9ffyGkZHuFXEQyPKrWXL8rCW',
  false,
  ['lsd', 'gif'],
  NFT_Types.VIDEO,
);

export const getNftList = () => {
  return ALL;
};

export const getRedeemableNftList = () => {
  return REDEEMABLE_NFTS;
};

export const getNonRedeemableNftList = () => {
  return NFTS;
};

export const getExceptionalStyle = (mint: PublicKey): any => {
  switch (mint.toBase58()) {
    case '94w8qHS4XFadqJhWZzyfAS2bbj55ReFnVYB8BwewMNmf':
      return { top: 80 };
    default:
      return null;
  }
};
