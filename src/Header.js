import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Image } from 'react-native';

const Loading = () => {
  return (
    <View style={{backgroundColor: '#0CC0DF', width: '100%', height: '8%', justifyContent: 'center', alignItems: 'flex-end'}}>
        <Image
          style={{ width: 80, height: 80, }}
          source={require('../assets/Logo-Skool3.png')}
        />
      </View>
  );
};

export default Loading;