import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { auth, firestore, storage } from '../Config'; // Import storage from Firebase config
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker'; // Import ImagePicker for selecting an image
import SwipeableModal8 from '../src/SwipeableModal8';
import Loading from '../src/loading';

import AntDesign from '@expo/vector-icons/AntDesign';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import Entypo from '@expo/vector-icons/Entypo';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import Octicons from '@expo/vector-icons/Octicons';

const DRProfile = ({ navigation, route }) => {
  const [user, setUser] = useState('');
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false); // To handle image upload state
  const [totalIncome, setTotalIncome] = useState(0);
  const [userRides, setUserRides] = useState([]);
  const [selectedSection, setSelectedSection] = useState('PersonalData'); // State for toggling view
  const [isModalVisible, setModalVisible] = useState(false); 
  
  const closeModal = () => {
    setModalVisible(false);
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userDoc = await firestore.collection('users').doc(auth.currentUser.uid).get();
        if (userDoc.exists) {
          setUser(userDoc.data());
        } else {
          console.log('User does not exist');
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
    fetchUserRides();
  }, []);

  const fetchUserRides = async () => {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      console.error('User not logged in!');
      return;
    }
  
    try {
      const ridesSnapshot = await firestore
        .collection('Ride')
        .where('driverId', '==', currentUser.uid)
        .where('isFinish', '==', true)
        .get();
  
      const ridesData = ridesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
  
      // Calculate total income by summing up the totalFare from each finished ride
      const totalIncome = ridesData.reduce((sum, ride) => sum + (ride.totalFare || 0), 0);
  
      setUserRides(ridesData);
      setTotalIncome(totalIncome); // Assuming you have a state variable for totalIncome
    } catch (error) {
      console.error('Error fetching rides:', error);
    } finally {
      setLoading(false);
    }
  };
  

  // Function to handle image selection
const pickImage = async () => {
  // Request permission to access the media library
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  
  if (status !== 'granted') {
    Alert.alert('Permission to access media library is required!');
    return;
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    aspect: [1, 1],
    quality: 1,
  });

  if (!result.canceled) { // Note: 'canceled' instead of 'cancelled'
    uploadImage(result.assets[0].uri); // Use `assets[0].uri` for the image URI in SDK 47+
  } else {
    Alert.alert('Edit profile picture canceled');
  }
};

  // Function to upload the image to Firebase Storage
  const uploadImage = async (uri) => {
    setUploading(true);
    const response = await fetch(uri);
    const blob = await response.blob();
    const storageRef = storage.ref().child(`profilePhotos/${auth.currentUser.uid}`);
    const uploadTask = storageRef.put(blob);

    uploadTask.on(
      'state_changed',
      (snapshot) => {},
      (error) => {
        Alert.alert('Upload failed', error.message);
        setUploading(false);
      },
      async () => {
        const downloadURL = await uploadTask.snapshot.ref.getDownloadURL();
        updateUserProfilePhoto(downloadURL);
      }
    );
  };

  // Function to update the Firestore document with the new profile photo URL
  const updateUserProfilePhoto = async (downloadURL) => {
    try {
      await firestore.collection('users').doc(auth.currentUser.uid).update({
        userProfile: downloadURL,
      });
      setUser((prevUser) => ({ ...prevUser, formalPhoto: downloadURL }));
      Alert.alert('Success', 'Profile photo updated successfully!');
    } catch (error) {
      Alert.alert('Error updating profile photo', error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await auth.signOut();
      Alert.alert('Logged out', 'You have been logged out successfully.');
      navigation.navigate('Login');
    } catch (error) {
      console.error('Logout Error:', error);
      Alert.alert('Logout Error', error.message);
    }
  };

  if (loading || uploading) {
    return (
      <Loading/>
    );
  }

  return (
    <View style={styles.container}>
      <View style={{ width: '100%', height: 'auto', backgroundColor: '#0CC0DF' }}>
        <View
          style={{
            width: '95%',
            height: 50,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <TouchableOpacity style={{ marginLeft: 5 }} onPress={() => navigation.navigate('Feed')}>
            <Ionicons name="arrow-back-circle" size={40} color="white" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              setModalVisible(true);     // Open the modal
            }}
          >
            <Entypo name="dots-three-horizontal" size={24} color="white" />
          </TouchableOpacity>
        </View>
        <View style={{ alignItems: 'center', justifyContent: 'center', width: '100%' }}>
          <View>
            {user.userProfile ? (
              <Image 
                source={{ uri: user.userProfile }} 
                style={{ width: 130, height: 130, borderRadius: 100 }} 
              />
            ) : user.formalPhoto?.image ? (
              <Image 
                source={{ uri: user.formalPhoto?.image }} 
                style={{ width: 130, height: 130, borderRadius: 100 }} 
              />
            ) : null }
            <TouchableOpacity style={{position: 'absolute', marginTop: 95, marginLeft: 95, borderRadius: 100, width: 35, height: 35, justifyContent: 'center', alignItems: 'center', backgroundColor: 'white'}} onPress={pickImage} >
              <FontAwesome5 name="edit" size={20} color="#0CC0DF"/>
            </TouchableOpacity>
          </View>
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <AntDesign name="star" size={24} color="#FFE234"  />
            <Text style={{ fontSize: 18, marginTop: 10, color: 'white', fontFamily: 'Poppins-Regular' }}>
              {user.rating?.toFixed(1)} 
            </Text>
          </View>
          <Text style={{ fontSize: 25, color: 'white', fontFamily: 'Poppins-Regular' }}>
            {user.firstName} {user.lastName}
          </Text>
          <Text style={{ fontSize: 14, color: 'white', fontFamily: 'Poppins-Regular' }}>{user.email}</Text>
          <Text style={{ fontSize: 20, color: 'white', fontFamily: 'Poppins-Regular' }}>Total Income: ₱{totalIncome}</Text>
        </View>
      </View>

      {!user.isVerified && (
        <TouchableOpacity  style={styles.verifCon}  onPress={() => navigation.navigate('AccountStatus', { item: user })}>
          <View style={{ width: '80%', marginLeft: 15}}>
            <Text style={{color: 'grey'}}>Account status</Text>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <Text >Your account is pending for verification.  </Text>
              <Octicons name="info" size={20} color="black" />
            </View>
          </View>
          <AntDesign name="right" size={24} color="black" style={{marginRight: 10}}/>
        </TouchableOpacity>
      )}

      {user.isRestricted && (
        <View style={styles.verifCon2}>
          <Text style={{color: 'grey'}}>Account status</Text>
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <Text style={{color: 'red', fontFamily: 'Poppins-Regular'}}>Your account is restricted contact support.</Text>
            <Octicons name="info" size={20} color="red" />
          </View>
        </View>
      )}

      <View style={styles.selectSc}>
        <TouchableOpacity onPress={() => setSelectedSection('PersonalData')}>
          <Text style={[styles.toggleButton, selectedSection === 'PersonalData' && styles.activeButton]}>
            Personal Data
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setSelectedSection('Documents')}>
          <Text style={[styles.toggleButton, selectedSection === 'Documents' && styles.activeButton]}>
            Documents
          </Text>
        </TouchableOpacity>
      </View>

      
      {selectedSection === 'PersonalData' ? (
        <View style={styles.contentContainer}>
          <ScrollView style={{padding: 5}}>
            <Text style={styles.sectionTitle}>Personal Information</Text>

            <Text>Name: {user.firstName} {user.lastName}</Text>
            <Text>Email: {user.email}</Text>
          </ScrollView>
        </View>
      ) : (
        <View style={styles.contentContainer}>
          <ScrollView style={{padding: 5}}> 
          <Text style={styles.sectionTitle}>Documents</Text>
         
          <Text>Driver License: {user.driverLicense}</Text>
          </ScrollView>
        </View>
      )}

      <SwipeableModal8
        isVisible={isModalVisible}
        onSwipeComplete={closeModal}
        onClose={closeModal}
      >
        <TouchableOpacity style={styles.button} onPress={handleLogout}>
          <Text style={styles.buttonText}>Logout </Text>
          <MaterialCommunityIcons name="logout" size={24} color="white" />
        </TouchableOpacity>
         
      </SwipeableModal8>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
  },
  verifCon:{
    width: '100%', 
    borderBottomWidth: 1,
    height: 60,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  verifCon2:{
    width: '100%', 
    borderBottomWidth: 1,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center'
  },
  name: {
    fontSize: 25,
    fontWeight: 'bold',
    marginTop: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0CC0DF',
  },
  button: {
    backgroundColor: '#0CC0DF',
    marginTop: 20,
    height: 40,
    width: 200, // Increased width to fit the text
    borderRadius: 10,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center'
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },

  selectSc:{ flexDirection: 'row', justifyContent: 'space-around', width: '100%', borderBottomColor: 'grey', borderBottomWidth: 1 ,
    height: 40,
    alignItems: 'center'
  },

  toggleButton: {
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    color: 'black', // Default color for buttons
  },
  activeButton: {
    fontSize: 16,
    color: '#0CC0DF', // Color when selected (hover effect)
    fontFamily: 'Poppins-SemiBold',
  },
  contentContainer: {
    marginTop: 10,
    width: '100%',
    height: 'auto',
    
    
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
});

export default DRProfile;
