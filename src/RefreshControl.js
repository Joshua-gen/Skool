import React from 'react';
import { RefreshControl } from 'react-native';

const RefreshComponent = ({ refreshing, onRefresh }) => {
  return <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />;
};

export default RefreshComponent;
