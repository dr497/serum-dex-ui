import React from 'react';
import { notification } from 'antd';
import Link from '../components/Link';

export function notify({
  message,
  description,
  txid,
  type = 'info',
  placement = 'bottomLeft',
}: {
  message: string;
  description?: string | JSX.Element;
  txid?: string;
  type?: string;
  placement?: string;
}) {
  if (txid) {
    description = (
      <Link
        external
        to={'https://explorer.solana.com/tx/' + txid}
        style={{ color: '#0000ff' }}
      >
        View transaction {txid.slice(0, 8)}...{txid.slice(txid.length - 8)}
      </Link>
    );
  }
  notification[type]({
    message: <span style={{ color: '#FFFFFF' }}>{message}</span>,
    description: (
      <span style={{ color: 'color: rgba(255, 255, 255, 0.6)' }}>
        {description}
      </span>
    ),
    placement,
    style: {
      backgroundColor: '#0a0d1f',
      boxShadow:
        '0px 3px 6px -4px rgba(0, 0, 0, 0.12), 0px 6px 16px rgba(0, 0, 0, 0.08), 0px 9px 28px 8px rgba(0, 0, 0, 0.05)',
    },
  });
}
