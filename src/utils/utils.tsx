import { useCallback, useEffect, useMemo, useState } from 'react';
import { PublicKey, Connection, AccountInfo } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';
import BN from 'bn.js';
import { Market, MARKETS } from '@project-serum/serum';
import { MAINNET_ENDPOINT } from './connection';

// @ts-ignore
const dexProgramId = MARKETS?.find(({ deprecated }) => !deprecated).programId;

export function isValidPublicKey(key) {
  if (!key) {
    return false;
  }
  try {
    new PublicKey(key);
    return true;
  } catch {
    return false;
  }
}

export async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export const percentFormat = new Intl.NumberFormat(undefined, {
  style: 'percent',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function floorToDecimal(
  value: number,
  decimals: number | undefined | null,
) {
  return decimals ? Math.floor(value * 10 ** decimals) / 10 ** decimals : value;
}

export function roundToDecimal(
  value: number,
  decimals: number | undefined | null,
) {
  return decimals ? Math.round(value * 10 ** decimals) / 10 ** decimals : value;
}

export function getDecimalCount(value): number {
  if (
    !isNaN(value) &&
    Math.floor(value) !== value &&
    value.toString().includes('.')
  )
    return value.toString().split('.')[1].length || 0;
  if (
    !isNaN(value) &&
    Math.floor(value) !== value &&
    value.toString().includes('e')
  )
    return parseInt(value.toString().split('e-')[1] || '0');
  return 0;
}

export function divideBnToNumber(numerator: BN, denominator: BN): number {
  const quotient = numerator.div(denominator).toNumber();
  const rem = numerator.umod(denominator);
  const gcd = rem.gcd(denominator);
  return quotient + rem.div(gcd).toNumber() / denominator.div(gcd).toNumber();
}

export function getTokenMultiplierFromDecimals(decimals: number): BN {
  return new BN(10).pow(new BN(decimals));
}

const localStorageListeners = {};

export function useLocalStorageStringState(
  key: string,
  defaultState: string | null = null,
): [string | null, (newState: string | null) => void] {
  const state = localStorage.getItem(key) || defaultState;

  const [, notify] = useState(key + '\n' + state);

  useEffect(() => {
    if (!localStorageListeners[key]) {
      localStorageListeners[key] = [];
    }
    localStorageListeners[key].push(notify);
    return () => {
      localStorageListeners[key] = localStorageListeners[key].filter(
        (listener) => listener !== notify,
      );
      if (localStorageListeners[key].length === 0) {
        delete localStorageListeners[key];
      }
    };
  }, [key]);

  const setState = useCallback<(newState: string | null) => void>(
    (newState) => {
      const changed = state !== newState;
      if (!changed) {
        return;
      }

      if (newState === null) {
        localStorage.removeItem(key);
      } else {
        localStorage.setItem(key, newState);
      }
      localStorageListeners[key].forEach((listener) =>
        listener(key + '\n' + newState),
      );
    },
    [state, key],
  );

  return [state, setState];
}

export function useLocalStorageState<T = any>(
  key: string,
  defaultState: T | null = null,
): [T, (newState: T) => void] {
  let [stringState, setStringState] = useLocalStorageStringState(
    key,
    JSON.stringify(defaultState),
  );
  return [
    useMemo(() => stringState && JSON.parse(stringState), [stringState]),
    (newState) => setStringState(JSON.stringify(newState)),
  ];
}

export function useEffectAfterTimeout(effect, timeout) {
  useEffect(() => {
    const handle = setTimeout(effect, timeout);
    return () => clearTimeout(handle);
  });
}

export function useListener(emitter, eventName) {
  const [, forceUpdate] = useState(0);
  useEffect(() => {
    const listener = () => forceUpdate((i) => i + 1);
    emitter.on(eventName, listener);
    return () => emitter.removeListener(eventName, listener);
  }, [emitter, eventName]);
}

export function abbreviateAddress(address: PublicKey, size = 4) {
  const base58 = address.toBase58();
  return base58.slice(0, size) + '…' + base58.slice(-size);
}

export function isEqual(obj1, obj2, keys) {
  if (!keys && Object.keys(obj1).length !== Object.keys(obj2).length) {
    return false;
  }
  keys = keys || Object.keys(obj1);
  for (const k of keys) {
    if (obj1[k] !== obj2[k]) {
      // shallow comparison
      return false;
    }
  }
  return true;
}

export const useTokenAccounts = (owner: PublicKey, connection: Connection) => {
  const [tokenAccounts, setTokenAccounts] = useState<Array<string>>([]);
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    let filter = { programId: TOKEN_PROGRAM_ID };
    const get = async () => {
      if (!owner || !connection) {
        return;
      } else {
        const accounts = await connection.getTokenAccountsByOwner(
          owner,
          filter,
        );

        for (let i = 0; i < accounts.value.length; i++) {
          const balance = await connection.getTokenAccountBalance(
            accounts.value[i].pubkey,
          );
          const info = await connection.getParsedAccountInfo(
            accounts.value[i].pubkey,
          );
          if (balance.value.uiAmount > 1) {
            setTokenAccounts((prev) => [
              ...prev,
              // @ts-ignore
              info.value?.data.parsed.info.mint,
            ]);
          }
        }
      }
      setLoaded(true);
    };
    get();
  }, [owner]);
  return { balances: tokenAccounts, loaded };
};

export const rpcRequest = async (method: string, params: any) => {
  try {
    let response = await fetch(MAINNET_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: method,
        params: params,
      }),
    });
    if (!response.ok) {
      return [];
    }
    if (response.status !== 200 || !response.ok) {
      throw new Error(`Error rpcRequest `);
    }
    let json = await response.json();
    return json.result;
  } catch (err) {
    console.error(err);
    throw new Error(`Error rpcRequest = ${err}`);
  }
};

export const isValidMarket = async (
  connection: Connection,
  marketAddress: string,
) => {
  try {
    const market = await Market.load(
      connection,
      new PublicKey(marketAddress),
      {},
      dexProgramId,
    );
    return true;
  } catch (err) {
    return false;
  }
};
