import React from 'react';
import { Switch, Typography } from 'antd';
import { usePreferences } from '../utils/preferences';

export default function Settings({ autoApprove }) {
  const { autoSettleEnabled, setAutoSettleEnabled } = usePreferences();

  return (
    <div style={{ fontWeight: 400, fontSize: 16, color: 'white' }}>
      <Switch
        style={{
          marginRight: 2,
        }}
        disabled={!autoApprove}
        checked={autoApprove && autoSettleEnabled}
        onChange={setAutoSettleEnabled}
      />{' '}
      Auto settle
    </div>
  );
}
