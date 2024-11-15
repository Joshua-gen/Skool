import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image, Alert, ActivityIndicator } from 'react-native';
import { auth, firestore, storage } from '../Config'; // Import storage from Firebase config
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker'; // Import ImagePicker for selecting an image

const PSProfile = ({ navigation }) => {
  const [user, setUser] = useState('');
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false); // To handle image upload state

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
  }, []);

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
    Alert.alert('Image picker was canceled');
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


  return (
    <View style={styles.container}>
      <View style={{ width: '100%', height: 300, backgroundColor: '#0CC0DF' }}>
        <View
          style={{
            width: '100%',
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
            style={{
              width: 80,
              marginRight: 5,
              height: 25,
              backgroundColor: 'white',
              borderRadius: 5,
              justifyContent: 'center',
              alignItems: 'center',
            }}
            onPress={pickImage} // Handle selecting a new image
          >
            <Text style={{ fontSize: 12 }}>Edit Profile</Text>
          </TouchableOpacity>
        </View>
        <View style={{ alignItems: 'center', justifyContent: 'center', width: '100%' }}>
          {user.userProfile ? (
            <Image source={{ uri: user.userProfile }} style={{ width: 130, height: 130, borderRadius: 100 }} />
          ) : (
            <Image
              source={require('../assets/default-profile.jpg')}
              style={{ width: 130, height: 130, borderRadius: 100 }}
            />
          )}
          <Text style={{ fontSize: 25, marginTop: 10, color: 'white', fontFamily: 'Poppins-Regular' }}>
            {user.firstName} {user.lastName}
          </Text>
          <Text style={{ fontSize: 14, color: 'white', fontFamily: 'Poppins-Regular' }}>{user.email}</Text>
        </View>
      </View>

      <View style={{ flexDirection: 'row', top: 180 }}>
        <TouchableOpacity style={styles.button} onPress={handleLogout}>
          <Text style={styles.buttonText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fdf2f3',
    alignItems: 'center',
  },
  name: {
    fontSize: 25,
    fontWeight: 'bold',
    marginTop: 10,
  },
  button: {
    backgroundColor: '#630436',
    padding: 10,
    margin: 15,
    height: 40,
    width: 200, // Increased width to fit the text
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default PSProfile;
