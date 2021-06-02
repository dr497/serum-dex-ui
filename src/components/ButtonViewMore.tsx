import React from 'react';
import { Button } from 'antd';
import { useHistory } from 'react-router-dom';

const ButtonViewMore = ({
  redeemable,
}: {
  redeemable: boolean;
}): JSX.Element => {
  const history = useHistory();
  const onClick = () => {
    history.push(
      redeemable ? '/explore?redeemable=true' : '/explore?redeemable=false',
    );
  };
  return (
    <Button className="button-view-more" onClick={onClick}>
      View more items
    </Button>
  );
};

export default ButtonViewMore;
