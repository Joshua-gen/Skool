import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import LottieView from 'lottie-react-native';

const Loading = () => {
  return (
    <View style={styles.loadingContainer}>
        <Image
            style={{ width: 100, height: 100, marginBottom: -50}}
            source={require('../assets/Logo-Skool.png')}
        />
        <LottieView
          source={require('../assets/Carload.json')}  
          autoPlay
          loop
          style={styles.lottie}  
      />
   </View>
  );
};

const styles = StyleSheet.create({
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'white',
      },
      lottie: {
        width: 150, // Set the desired width
        height: 150, // Set the desired height
      },
 
});

export default Loading;
