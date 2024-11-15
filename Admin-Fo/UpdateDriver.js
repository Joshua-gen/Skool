import React, { useState } from 'react';
import { View, Text, TextInput, Button, TouchableOpacity, Image, ScrollView, StyleSheet,  } from 'react-native';
import { doc, updateDoc } from 'firebase/firestore';
import { firestore } from '../Config';
import Ionicons from '@expo/vector-icons/Ionicons';

const UpdateDriver = ({ route, navigation }) => {
  const { user } = route.params;

  // State to manage updated user data
  const [updatedUser, setUpdatedUser] = useState(user);

  // Update state when input changes
  const handleInputChange = (field, value) => {
    setUpdatedUser({ ...updatedUser, [field]: value });
  };

  // Update Firestore with the new data
  const updateProfile = async () => {
    try {
      const docRef = doc(firestore, 'users', user.id); // Use user.id if the document ID is stored here
      await updateDoc(docRef, updatedUser);
      alert('Profile updated successfully');
      navigation.goBack();
    } catch (error) {
      console.error('Error updating profile: ', error);
      alert('Failed to update profile');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={{backgroundColor: '#0CC0DF', width: '100%', height: 50, alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between'}}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{marginLeft: 5}}
        >
          <Ionicons name="arrow-back" size={28} color="white" />
        </TouchableOpacity>
          <Text style={{fontFamily: 'Poppins-Medium', fontSize: 18, marginRight: 10, color: 'white'}}>Update Driver Account</Text>
        </View>
      {/* Input Fields */}
      <TextInput
        style={styles.input}
        value={updatedUser.idNumber}
        placeholder="ID Number"
        onChangeText={(value) => handleInputChange('idNumber', value)}
      />
      <TextInput
        style={styles.input}
        value={updatedUser.institution}
        placeholder="Institution"
        onChangeText={(value) => handleInputChange('institution', value)}
      />
      <TextInput
        style={styles.input}
        value={updatedUser.lastName}
        placeholder="Last Name"
        onChangeText={(value) => handleInputChange('lastName', value)}
      />
      <TextInput
        style={styles.input}
        value={updatedUser.mobileNo}
        placeholder="Mobile Number"
        onChangeText={(value) => handleInputChange('mobileNo', value)}
      />
      <TextInput
        style={styles.input}
        value={updatedUser.model}
        placeholder="Vehicle Model"
        onChangeText={(value) => handleInputChange('model', value)}
      />
      <TextInput
        style={styles.input}
        value={updatedUser.plateNo}
        placeholder="Plate Number"
        onChangeText={(value) => handleInputChange('plateNo', value)}
      />
      <TextInput
        style={styles.input}
        value={updatedUser.vehicleColor}
        placeholder="Vehicle Color"
        onChangeText={(value) => handleInputChange('vehicleColor', value)}
      />
      <TextInput
        style={styles.input}
        value={updatedUser.vehicleClass}
        placeholder="Vehicle Class"
        onChangeText={(value) => handleInputChange('vehicleClass', value)}
      />

      {/* Display Images */}
      <Text style={styles.label}>NBI Clearance</Text>
      <Image source={{ uri: updatedUser.nbiClear }} style={styles.image} />
      <Text style={styles.label}>Police Clearance</Text>
      <Image source={{ uri: updatedUser.policeClear }} style={styles.image} />
      <Text style={styles.label}>Vehicle Back</Text>
      <Image source={{ uri: updatedUser.vehicleBack }} style={styles.image} />
      {/* Add other images as needed */}

      <TouchableOpacity style={styles.button} onPress={() => navigation.goBack()}>
        <Text>Cancle</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={updateProfile}>
        <Text>Update</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center'
  },
  input: {
    borderWidth: 1,
    borderColor: '#0CC0DF',
    borderRadius: 5,
    padding: 10,
    width: '90%',
    marginBottom: 5,
    marginTop: 5
  },
  button: {
    backgroundColor: '#0CC0DF',
    padding: 10,
    borderRadius: 5,
    width: '90%',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,        
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 10,
  },
  image: {
    width: 300,
    height: 300,
    resizeMode: 'contain',
    marginBottom: 20,
  },
});

export default UpdateDriver;
