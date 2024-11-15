import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import Header from '../src/Header';

const CanceledRides = () => {
  return (
    <View style={styles.container}>
        <Header/>
        <Text>SuccessfulRides</Text>
    </View>
  )
}

export default CanceledRides

const styles = StyleSheet.create({
    container:{
        flex: 1, 
        alignItems: 'center'
    }
})