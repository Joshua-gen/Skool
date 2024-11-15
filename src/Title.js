// SwipeableModal.js
import React from 'react';
import { View, Text, StyleSheet,} from 'react-native';


const PoppinsReg = ({title, style, ...props}) => {
  return (
    <Text style={[styles.Text, style]} {...props}>{title}</Text>
  );
};

const styles = StyleSheet.create({
    Text:{
        fontSize: 16,
        fontFamily: 'Poppins-Meduim',
    }
  
 
});

export default PoppinsReg;