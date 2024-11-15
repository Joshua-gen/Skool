// SwipeableModal.js
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Modal from 'react-native-modal';
import Ionicons from '@expo/vector-icons/Ionicons';

const SwipeableModal = ({ isVisible, onSwipeComplete, onClose, children }) => {
  return (
    <Modal
      isVisible={isVisible}
      swipeDirection={['down']}
      onSwipeComplete={onSwipeComplete}
      style={styles.modal}
    >
      <View style={styles.modalContent}>
        <View style={{width: '110%',justifyContent: 'space-between', flexDirection: 'row'}}>
          <Text style={{fontSize: 20, fontFamily: 'Poppins-Medium', marginLeft: 15}}>Schedule Ride</Text>

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
    padding: 22,
    height: '90%' == 'auto',
    borderTopLeftRadius: 17,
    borderTopRightRadius: 17,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    alignItems: 'center',
  },
 
});

export default SwipeableModal;
