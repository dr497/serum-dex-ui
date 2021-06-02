import React from 'react';
import { Input } from 'antd';
import { useHistory } from 'react-router-dom';

const { Search } = Input;

const SearchBar = () => {
  const history = useHistory();
  const onSearch = (value) => {
    if (!value.trim()) {
      return;
    }
    history.push(
      `/explore?keywords=${value.trim().toLowerCase().replace(/ /g, '-')}`,
    );
  };
  return (
    <Search
      placeholder="Search items"
      onSearch={onSearch}
      enterButton
      style={{ maxWidth: 500 }}
    />
  );
};

export default SearchBar;
