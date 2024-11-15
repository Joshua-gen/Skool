// SwipeableModal.js
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Modal from 'react-native-modal';
import Ionicons from '@expo/vector-icons/Ionicons';
import Octicons from '@expo/vector-icons/Octicons';

const SwipeableModal8 = ({ isVisible, onSwipeComplete, onClose, children }) => {
  return (
    <Modal
      isVisible={isVisible}
      swipeDirection={['down']}
      onSwipeComplete={onSwipeComplete}
      style={styles.modal}
    >
      <View style={styles.modalContent}>
        <View style={{width: '110%', alignItems: 'center', height: 25,}}>
         <Octicons name="horizontal-rule" size={40} color="grey" style={{top: -5}} />
        </View>

        <View style={{width: '110%',justifyContent: 'space-between', flexDirection: 'row'}}>
          <Text style={{fontSize: 20, fontFamily: 'Poppins-Medium', marginLeft: 15,}}>You want to logout? </Text>

          <TouchableOpacity onPress={onClose} >
            <Ionicons name="close" size={24} color="#0CC0DF" />
          </TouchableOpacity>
        </View>

        {children}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modal: {
    justifyContent: 'flex-end',
    margin: 0,
  },
  modalContent: {
    backgroundColor: 'white',
    paddingHorizontal: 22,
    height: '20%',
    borderTopLeftRadius: 17,
    borderTopRightRadius: 17,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    alignItems: 'center',
  },
 
});

export default SwipeableModal8;
