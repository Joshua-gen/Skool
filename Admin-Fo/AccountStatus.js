import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableHighlight, TextInput, Alert, Image, TouchableOpacity, ScrollView, Modal } from 'react-native';
import { firestore, auth, storage } from '../Config';
import * as ImagePicker from 'expo-image-picker';
import { notifyAdminForDocumentUpdate } from '../service/Notifications'; // Update this path based on where your functions are located
import { createNotification } from '../service/createNotification';
import Header from '../src/Header';
import Loading from '../src/loading';


import { Ionicons } from '@expo/vector-icons';
import DashedLine from '../assets/DashedLine';

import AntDesign from '@expo/vector-icons/AntDesign';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import Entypo from '@expo/vector-icons/Entypo';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import Octicons from '@expo/vector-icons/Octicons';

const AccountStatus = ({navigation, route}) => {
    const [user, setUser] = useState('');
    const [loading, setLoading] = useState(true);
    const [accountStatus, setAccountStatus] = useState(null);
    const [rejectionReason, setRejectionReason] = useState('');
    const [isModalVisible, setModalVisible] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);

    const openImageModal = (imageUri) => {
      setSelectedImage(imageUri);
      setModalVisible(true);
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
    }, []);

    useEffect(() => {
        const fetchAccountStatus = async () => {
          try {
            const userDoc = await firestore.collection('users').doc(auth.currentUser.uid).get();
            const userData = userDoc.data();
    
            if (userData) {
              // Set the account status based on your logic
              if (userData.isRejected) {
                setAccountStatus('rejected');
                // Fetch the rejection reason from the rejectionReasons collection
                const rejectionSnapshot = await firestore.collection('rejectionReasons')
                  .where('userId', '==', auth.currentUser.uid)
                  .get();
    
                if (!rejectionSnapshot.empty) {
                  const rejectionData = rejectionSnapshot.docs[0].data();
                  setRejectionReason(rejectionData.reason);
                }
              } else if (userData.isVerified) {
                setAccountStatus('verified');
              } else {
                setAccountStatus('pending'); // Assuming accounts default to pending if neither rejected nor verified
              }
            } else {
              Alert.alert('Error', 'User data not found');
            }
          } catch (error) {
            Alert.alert('Error', 'Could not fetch account status');
            console.error(error);
          } finally {
            setLoading(false);
          }
        };
    
        fetchAccountStatus();
      }, []);

      // Function to handle image selection and upload
      const updateImage = async (field) => {
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permissionResult.granted) {
            Alert.alert("Permission to access media library is required!");
            return;
        }

        const pickerResult = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 1,
        });

        if (pickerResult.canceled) {
            Alert.alert('Image selection canceled');
            return;
        }

        try {
            const uri = pickerResult.assets[0].uri;
            const response = await fetch(uri);
            const blob = await response.blob();
            const ref = storage.ref().child(`images/${auth.currentUser.uid}/${field}`);
            const uploadTask = ref.put(blob);

            uploadTask.on(
                'state_changed',
                () => {},
                (error) => {
                    Alert.alert('Upload failed', error.message);
                    console.error("Upload error:", error);
                },
                async () => {
                    const downloadURL = await uploadTask.snapshot.ref.getDownloadURL();
                    await firestore.collection('users').doc(auth.currentUser.uid).update({
                        [field]: downloadURL,
                        
                    });

                    const userDoc = await firestore.collection('users').doc(auth.currentUser.uid).get();                
                    const userData = userDoc.data();
                    const driverFirstName = userData.firstName;
                    const driverLastName = userData.lastName;
                    Alert.alert('Success', 'Image updated successfully');
                    // Send notifications after successful image upload
                    await createNotification(
                      'osggekaYOfgaJUqRJ1GSfz45sRC2',
                      'Driver Applicant',
                      `Driver Document Updated - ${driverFirstName} ${driverLastName} .`
                    );

                    await notifyAdminForDocumentUpdate('osggekaYOfgaJUqRJ1GSfz45sRC2', userData );
                }
            );
        } catch (error) {
            console.error("Image update failed:", error);
            Alert.alert("Error", "Image update failed");
        }
      };
  

  if (loading) {
    return (
      <Loading/>
    );
  }

  return (
    <View style={styles.container}>
        <View style={{backgroundColor: '#0CC0DF', width: '100%', height: 50, alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between'}}>
            <TouchableOpacity
                onPress={() => navigation.goBack()}
                style={{marginLeft: 5}}
            >
            <Ionicons name="arrow-back" size={28} color="white" />
            </TouchableOpacity>
          <Text style={{fontFamily: 'Poppins-Medium', fontSize: 18, marginRight: 10, color: 'white'}}>Account Status</Text>
        </View>

        <View style={{width:'90%', marginTop: 20, alignItems: 'center' }}>
            <View style={{width: '100%', flexDirection: 'row', alignItems: 'center',justifyContent: 'center', }}>
                <Ionicons name="radio-button-on" size={24} color="#0CC0DF" />
                <DashedLine color="black" width="73%" height={5} dashArray={[2, 2]} />
                <Ionicons name="radio-button-off-outline" size={24} color="#0CC0DF" />
            </View>
            <View style={{alignItems: 'center', justifyContent: 'space-between', width: '90%' , flexDirection: 'row',}}>
                <Text style={{fontSize: 10 , color: '#0CC0DF' }}>Submit</Text>
                <Text style={{fontSize: 10}}>Verified</Text>
            </View>
        </View>

        <View style={styles.statusMessageContainer}>
          <ScrollView>
            {accountStatus === 'pending' && (
              <Text style={styles.pendingMessage}>Your account verification is pending. Please wait for approval.</Text>
            )}
            {accountStatus === 'rejected' && (
              <View>
                <Text style={styles.rejectedMessage}>Your account verification was rejected.</Text>
                <Text style={styles.reasonText}>Reason: {rejectionReason || "No reason provided"}</Text>
              </View>
            )}
            {accountStatus === 'verified' && (
              <Text style={styles.verifiedMessage}>Your account is verified. Thank you!</Text>
            )}
            {accountStatus === null && (
              <Text style={styles.pendingMessage}>Unable to fetch account status. Please try again later.</Text>
            )}
          </ScrollView>
        </View>

      <ScrollView style={{width: '100%', }}>
          <View style={{alignItems: 'center', width: '99%', alignSelf: 'center', paddingTop: 5, }}>
            
            <Text style={[styles.imgTitle, {fontSize: 20, marginBottom: 5, marginTop: 20}]}>Formal Photo</Text>
            <View style={styles.imageCon}>
              <View style={{width: 150, height: 150}}>
                <Text style={styles.imgTitle}>Formal Photo</Text>
                {user?.formalPhoto && (
                    <Image
                    source={{ uri: user?.formalPhoto, cache: 'force-cache' }}
                    style={styles.image}
                    onError={(e) => console.log('Error loading image: ', e.nativeEvent.error)}
                    />
                )}
                <TouchableOpacity style={{position:'absolute', marginTop: 140, marginLeft: 120}} onPress={() => openImageModal(user.formalPhoto)}>
                  <FontAwesome5 name="expand" size={24} color="white"/>
                </TouchableOpacity>
              </View>
              <View style={styles.reCon}>
                <TouchableOpacity
                  style={styles.button}
                  onPress={() => updateImage('formalPhoto')}
                >
                  <Text style={styles.btntxt}>Update </Text>
                  <Entypo name="upload" size={18} color="white" />
                </TouchableOpacity>
              </View>
            </View>
            
            <Text style={[styles.imgTitle, {fontSize: 20, marginBottom: 5, marginTop: 20}]}>University ID</Text>
            <View style={styles.imageCon}>
              <View style={{width: 150, height: 150}}>
                <Text style={styles.imgTitle}>University ID Front</Text>
                {user.universityIDfront && (
                    <Image
                    source={{ uri: user.universityIDfront }}
                    style={styles.image}
                    onError={(e) => console.log('Error loading image: ', e.nativeEvent.error)}
                    />
                )}
                <TouchableOpacity style={{position:'absolute', marginTop: 140, marginLeft: 120}} onPress={() => openImageModal(user.universityIDfront)}>
                  <FontAwesome5 name="expand" size={24} color="white"/>
                </TouchableOpacity>
              </View>
              <View style={styles.reCon}>
                <TouchableOpacity
                  style={styles.button}
                  onPress={() => updateImage('universityIDfront')}
                >
                  <Text style={styles.btntxt}>Update </Text>
                  <Entypo name="upload" size={18} color="white" />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.imageCon}>
              <View style={{width: 150, height: 150}}>
                <Text style={styles.imgTitle}>University ID Back</Text>
                {user.universityIDback && (
                    <Image
                    source={{ uri: user.universityIDback }}
                    style={styles.image}
                    onError={(e) => console.log('Error loading image: ', e.nativeEvent.error)}
                    />
                )}
                <TouchableOpacity style={{position:'absolute', marginTop: 140, marginLeft: 120}} onPress={() => openImageModal(user.universityIDback)}>
                  <FontAwesome5 name="expand" size={24} color="white"/>
                </TouchableOpacity>
              </View>
              <View style={styles.reCon}>
                <TouchableOpacity
                  style={styles.button}
                  onPress={() => updateImage('universityIDback')}
                >
                  <Text style={styles.btntxt}>Update </Text>
                  <Entypo name="upload" size={18} color="white" />
                </TouchableOpacity>
              </View>
            </View>

            <Text style={[styles.imgTitle, {fontSize: 20, marginBottom: 5, marginTop: 20}]}>Drivers License</Text>
            <View style={styles.imageCon}>
              <View style={{width: 150, height: 150}}>
                <Text style={styles.imgTitle}>Drivers License Front</Text>
                {user.driversLicenseFront && (
                    <Image
                    source={{ uri: user.driversLicenseFront }}
                    style={styles.image}
                    onError={(e) => console.log('Error loading image: ', e.nativeEvent.error)}
                    />
                )}
                <TouchableOpacity style={{position:'absolute', marginTop: 140, marginLeft: 120}} onPress={() => openImageModal(user.driversLicenseFront)}>
                  <FontAwesome5 name="expand" size={24} color="white"/>
                </TouchableOpacity>
              </View>
              <View style={styles.reCon}>
                <TouchableOpacity
                  style={styles.button}
                  onPress={() => updateImage('driversLicenseFront')}
                >
                  <Text style={styles.btntxt}>Update </Text>
                  <Entypo name="upload" size={18} color="white" />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.imageCon}>
              <View style={{width: 150, height: 150}}>
                <Text style={styles.imgTitle}>Drivers License Back</Text>
                {user.driversLicenseBack && (
                    <Image
                    source={{ uri: user.driversLicenseBack }}
                    style={styles.image}
                    onError={(e) => console.log('Error loading image: ', e.nativeEvent.error)}
                    />
                )}
                <TouchableOpacity style={{position:'absolute', marginTop: 140, marginLeft: 120}} onPress={() => openImageModal(user.driversLicenseBack)}>
                  <FontAwesome5 name="expand" size={24} color="white"/>
                </TouchableOpacity>
              </View>
              <View style={styles.reCon}>
                <TouchableOpacity
                  style={styles.button}
                  onPress={() => updateImage('driversLicenseBack')}
                >
                  <Text style={styles.btntxt}>Update </Text>
                  <Entypo name="upload" size={18} color="white" />
                </TouchableOpacity>
              </View>
            </View>

            <Text style={[styles.imgTitle, {fontSize: 20, marginBottom: 5, marginTop: 20}]}>OR & CR</Text>
            <View style={styles.imageCon}>
              <View style={{width: 150, height: 150}}>
                <Text style={styles.imgTitle}>OR</Text>
                {user.oR && (
                    <Image
                    source={{ uri: user.oR }}
                    style={styles.image}
                    onError={(e) => console.log('Error loading image: ', e.nativeEvent.error)}
                    />
                )}
                <TouchableOpacity style={{position:'absolute', marginTop: 140, marginLeft: 120}} onPress={() => openImageModal(user.oR)}>
                  <FontAwesome5 name="expand" size={24} color="white"/>
                </TouchableOpacity>
              </View>
              <View style={styles.reCon}>
                <TouchableOpacity
                  style={styles.button}
                  onPress={() => updateImage('oR')}
                >
                  <Text style={styles.btntxt}>Update </Text>
                  <Entypo name="upload" size={18} color="white" />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.imageCon}>
              <View style={{width: 150, height: 150}}>
                <Text style={styles.imgTitle}>CR</Text>
                {user.cR && (
                    <Image
                    source={{ uri: user.cR }}
                    style={styles.image}
                    onError={(e) => console.log('Error loading image: ', e.nativeEvent.error)}
                    />
                )}
                <TouchableOpacity style={{position:'absolute', marginTop: 140, marginLeft: 120}} onPress={() => openImageModal(user.cR)}>
                  <FontAwesome5 name="expand" size={24} color="white"/>
                </TouchableOpacity>
              </View>
              <View style={styles.reCon}>
                <TouchableOpacity
                  style={styles.button}
                  onPress={() => updateImage('cR')}
                >
                  <Text style={styles.btntxt}>Update </Text>
                  <Entypo name="upload" size={18} color="white" />
                </TouchableOpacity>
              </View>
            </View>

            <Text style={[styles.imgTitle, {fontSize: 20, marginBottom: 5, marginTop: 20}]}>5 Point Vehicle View</Text>
            <View style={styles.imageCon}>
              <View style={{width: 150, height: 150}}>
                <Text style={styles.imgTitle}>Front</Text>
                {user.vehicleFront && (
                    <Image
                    source={{ uri: user.vehicleFront}}
                    style={styles.image}
                    onError={(e) => console.log('Error loading image: ', e.nativeEvent.error)}
                    />
                )}
                <TouchableOpacity style={{position:'absolute', marginTop: 140, marginLeft: 120}} onPress={() => openImageModal(user.vehicleFront)}>
                  <FontAwesome5 name="expand" size={24} color="white"/>
                </TouchableOpacity>
              </View>
              <View style={styles.reCon}>
                <TouchableOpacity
                  style={styles.button}
                  onPress={() => updateImage('vehicleFront')}
                >
                  <Text style={styles.btntxt}>Update </Text>
                  <Entypo name="upload" size={18} color="white" />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.imageCon}>
              <View style={{width: 150, height: 150}}>
                <Text style={styles.imgTitle}>Back</Text>
                {user.vehicleBack && (
                    <Image
                    source={{ uri: user.vehicleBack }}
                    style={styles.image}
                    onError={(e) => console.log('Error loading image: ', e.nativeEvent.error)}
                    />
                )}
                <TouchableOpacity style={{position:'absolute', marginTop: 140, marginLeft: 120}} onPress={() => openImageModal(user.vehicleBack)}>
                  <FontAwesome5 name="expand" size={24} color="white"/>
                </TouchableOpacity>
              </View>
              <View style={styles.reCon}>
                <TouchableOpacity
                  style={styles.button}
                  onPress={() => updateImage('vehicleBack')}
                >
                  <Text style={styles.btntxt}>Update </Text>
                  <Entypo name="upload" size={18} color="white" />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.imageCon}>
              <View style={{width: 150, height: 150}}>
                <Text style={styles.imgTitle}>Left</Text>
                {user.vehicleLeft && (
                    <Image
                    source={{ uri: user.vehicleLeft }}
                    style={styles.image}
                    onError={(e) => console.log('Error loading image: ', e.nativeEvent.error)}
                    />
                )}
                <TouchableOpacity style={{position:'absolute', marginTop: 140, marginLeft: 120}} onPress={() => openImageModal(user.vehicleLeft)}>
                  <FontAwesome5 name="expand" size={24} color="white"/>
                </TouchableOpacity>
              </View>
              <View style={styles.reCon}>
                <TouchableOpacity
                  style={styles.button}
                  onPress={() => updateImage('vehicleLeft')}
                >
                  <Text style={styles.btntxt}>Update </Text>
                  <Entypo name="upload" size={18} color="white" />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.imageCon}>
              <View style={{width: 150, height: 150}}>
                <Text style={styles.imgTitle}>Right</Text>
                {user.vehicleRight && (
                    <Image
                    source={{ uri: user.vehicleRight }}
                    style={styles.image}
                    onError={(e) => console.log('Error loading image: ', e.nativeEvent.error)}
                    />
                )}
                <TouchableOpacity style={{position:'absolute', marginTop: 140, marginLeft: 120}} onPress={() => openImageModal(user.vehicleRight)}>
                  <FontAwesome5 name="expand" size={24} color="white"/>
                </TouchableOpacity>
              </View>
              <View style={styles.reCon}>
                <TouchableOpacity
                  style={styles.button}
                  onPress={() => updateImage('vehicleRight')}
                >
                  <Text style={styles.btntxt}>Update </Text>
                  <Entypo name="upload" size={18} color="white" />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.imageCon}>
              <View style={{width: 150, height: 150}}>
                <Text style={styles.imgTitle}>Upper</Text>
                {user.vehicleUpper&& (
                    <Image
                    source={{ uri: user.vehicleUpper }}
                    style={styles.image}
                    onError={(e) => console.log('Error loading image: ', e.nativeEvent.error)}
                    />
                )}
                <TouchableOpacity style={{position:'absolute', marginTop: 140, marginLeft: 120}} onPress={() => openImageModal(user.vehicleUpper)}>
                  <FontAwesome5 name="expand" size={24} color="white"/>
                </TouchableOpacity>
              </View>
              <View style={styles.reCon}>
                <TouchableOpacity
                  style={styles.button}
                  onPress={() => updateImage('vehicleUpper')}
                >
                  <Text style={styles.btntxt}>Update </Text>
                  <Entypo name="upload" size={18} color="white" />
                </TouchableOpacity>
              </View>
            </View>

            
          </View>
      </ScrollView>

      <Modal visible={isModalVisible} transparent={true} onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalContainer}>
          <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeButton}>
            <AntDesign name="close" size={24} color="white" />  
          </TouchableOpacity>
          {selectedImage && <Image source={{ uri: selectedImage }} style={styles.fullscreenImage} />}
        </View>
      </Modal>

    
    </View>
  )
}

export default AccountStatus

const styles = StyleSheet.create({
  container: {
    flex: 1, 
    alignItems: 'center',
    
  },

  statusMessageContainer: {
    marginTop: 20,
    alignItems: 'center',
    paddingHorizontal: 20,
    height: '15%',
    borderBottomWidth: 2, borderBottomColor: '#0CC0DF'
    
  },
  pendingMessage: {
    fontSize: 16,
    color: '#FF8C00',
    textAlign: 'center',
  },
  rejectedMessage: {
    fontSize: 16,
    color: '#FF0000',
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#0CC0DF',
    padding: 10,
    borderRadius: 5,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,   
    flexDirection: 'row',     
  },
  btntxt:{
    fontFamily: 'Poppins-Regular',
    color: 'white'
  },
  reasonText: {
    fontSize: 14,
    color: '#333',
    textAlign: 'center',
    marginTop: 10,
  },
  verifiedMessage: {
    fontSize: 16,
    color: '#32CD32',
    textAlign: 'center',
  },
  image: {
    width: 150,
    height: 150,
    marginBottom: 10,
  },
  imgTitle:{
    fontFamily: 'Poppins-Regular',
  },

  reCon: {alignItems: 'center', marginLeft: 20, justifyContent: 'center', width: '45%', height: 100, alignSelf: 'center' },

  imageCon: {width: '95%', height:200, flexDirection: 'row', marginBottom: 10, borderLeftColor: '#0CC0DF', borderLeftWidth: 2, 
    padding: 10,
    shadowColor: '#000', // Shadow color
    shadowOffset: { width: 0, height: 2 }, // Offset for the shadow (x, y)
    shadowOpacity: 0.25, // Opacity of the shadow
    shadowRadius: 3.84, // Shadow blur radius
       // Android shadow
    elevation: 1, // Elevation for Android
   },
   modalContainer: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.8)', justifyContent: 'center', alignItems: 'center' },
  fullscreenImage: { width: '90%', height: '80%', resizeMode: 'contain' },
  closeButton: { position: 'absolute', top: 40, right: 20,},
})