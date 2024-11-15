import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, TouchableHighlight, FlatList, Alert, Image, TouchableOpacity, RefreshControl, TextInput } from 'react-native';
import { firestore, auth} from '../../Config'; // Update with your Firebase config path 
import { createNotification } from '../../service/createNotification';
import { notifyDriverOfAccountRejection, notifyDriverOfAccountVerification, } from '../../service/Notifications'; // Update this path based on where your functions are located
import Ionicons from '@expo/vector-icons/Ionicons';
import SwipeableModal7 from '../../src/SwipeableModal7';
import Entypo from '@expo/vector-icons/Entypo';
import AntDesign from '@expo/vector-icons/AntDesign';

const UserInfo = ({route, navigation}) => {
    const { user } = route.params;
    const { selectedImage } = route.params;
    const [users, setUsers] = useState([]);
    const [isModalVisible, setModalVisible] = useState(false); 
    const [selectedId, setSelectedId] = useState(false);  
    const [rejectionReason, setRejectionReason] = useState(''); // State for rejection reason


    const closeModal = () => {
        setModalVisible(false);
      };

     // Function to handle driver rejection
    const handleRejectDriver = async (userId) => {
        if (!rejectionReason) {
            Alert.alert('Error', 'Please provide a reason for rejection.');
            return;
        }

        try {
            // Save rejection reason to Firestore in the 'rejectionReasons' collection
            await firestore.collection('rejectionReasons').add({
                userId,
                reason: rejectionReason,
                rejectedAt: new Date(),
            });

            // Update the driver's 'isRejected' status in the 'users' collection
            await firestore.collection('users').doc(userId).update({
                isRejected: true,
            });

            // Send a notification to the driver
            await createNotification(
                userId,
                'Admin',
                'Your acccount verification has been rejected by the admin, Please proceed to the Account status screen located in your Profile screen.'
            );

            await notifyDriverOfAccountRejection(userId);

            Alert.alert('Driver Rejected', 'The driver has been rejected with the provided reason.');
            closeModal();
        } catch (error) {
            Alert.alert('Rejection Error', error.message);
        }
    };


    const handleVerifyDriver = async (userId) => {
        try {
            // Update the Firestore entry for verification status
            await firestore.collection('users').doc(userId).update({ isVerified: true, isRejected: true });
            Alert.alert('Driver Verified', 'The driver has been successfully verified.');
            
            // Send a notification to the driver
            await createNotification(
                userId,
                'Good day',
                'Your account has been verified by admin. Thank you for your patience.'
            );

            await notifyDriverOfAccountVerification(userId);
    
            // Send email verification if using Firebase Authentication
            const user = auth.currentUser;
            if (user) {
                await user.sendEmailVerification();
                Alert.alert('Email Sent', 'A verification email has been sent to the driver.');
            } else {
                Alert.alert('Email Verification', 'User must be logged in to send a verification email.');
            }
    
            setUsers(users.map(user => user.id === userId ? { ...user, isVerified: true } : user));
        } catch (error) {
            Alert.alert('Verification Error', error.message);
        }
    };
        
  return (
    <View style={{flex: 1, alignItems: 'center',}}>
        <View style={{backgroundColor: '#0CC0DF', width: '100%', height: 50, alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between'}}>
            <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={{marginLeft: 5}}
            >
            <Ionicons name="arrow-back" size={28} color="white" />
            </TouchableOpacity>
            <Text style={{fontFamily: 'Poppins-Medium', fontSize: 18, marginRight: 10, color: 'white'}}>Applicant Info</Text>
        </View>

        <View style={styles.info}>
        <View style={{flexDirection: 'row', width: '96.5%',marginLeft: 5, marginTop: 5}}>
            {user.formalPhoto && (
                <Image 
                source={{ uri: user.formalPhoto }} 
                style={{ width: 100, height: 100, borderRadius: 50, }}
                onError={(e) => console.log('Error loading image: ', e.nativeEvent.error)}
                />
            )}
            <View style={{marginLeft: 10, width: '66%',}}>
            <View style={{width: '100%', justifyContent: 'space-between', flexDirection: 'row', marginTop: 10}}>
            <Text style={styles.userIn}>First Name:</Text>
            <Text style={styles.userInfo}>{user.firstName}</Text>
            </View>
            <View style={{width: '100%', justifyContent: 'space-between', flexDirection: 'row', marginTop: 5}}>
            <Text style={styles.userIn}>Last Name:</Text>
            <Text style={styles.userInfo}>{user.lastName}</Text>
            </View>
            <View style={{width: '100%', justifyContent: 'space-between', flexDirection: 'row', marginTop: 5}}>
            <Text style={styles.userIn}>Gender:</Text>
            <Text style={styles.userInfo}>{user.gender}</Text>
            </View>
            </View>
        </View>
        <View style={{width: '96.5%', marginLeft: 5,}}>
            <View style={{width: '100%', justifyContent: 'space-between', flexDirection: 'row', marginTop: 10}}>
            <Text style={styles.userIn}>Mobile No.:</Text>
            <Text style={styles.userInfo}>{user.mobileNo}</Text>
            </View>
            <View style={{width: '100%', justifyContent: 'space-between', flexDirection: 'row', marginTop: 5}}>
            <Text style={styles.userIn}>Institution:</Text>
            <Text style={styles.userInfo}>SIT West Nagros University</Text>
            </View>
            <View style={{width: '100%', justifyContent: 'space-between', flexDirection: 'row', marginTop: 5}}>
            <Text style={styles.userIn}>Cousrse:</Text>
            <Text style={styles.userInfo}>{user.course}</Text>
            </View>
            <View style={{width: '100%', justifyContent: 'space-between', flexDirection: 'row', marginTop: 5}}>
            <Text style={styles.userIn}>Year:</Text>
            <Text style={styles.userInfo}>{user.year}</Text>
            </View>
            <View style={{width: '100%', justifyContent: 'space-between', flexDirection: 'row', marginTop: 5}}>
            <Text style={styles.userIn}>Student No:</Text>
            <Text style={styles.userInfo}>{user.idNumber}</Text>
            </View>
            <View style={{width: '100%', justifyContent: 'space-between', flexDirection: 'row', marginTop: 5}}>
            <Text style={styles.userIn}>Email:</Text>
            <Text style={styles.userInfo}>{user.email}</Text>
            </View>
            <View style={{width: '100%', justifyContent: 'space-between', flexDirection: 'row', marginTop: 5}}>
            <Text style={styles.userIn}>Password:</Text>
            <Text style={styles.userInfo}>xxxxxxxx</Text>
            </View>
        </View>

        <View style={{width: '96.5%', marginLeft: 5, borderTopWidth: 1, borderTopColor: 'grey'}}>
            <View style={{width: '100%', justifyContent: 'space-between', flexDirection: 'row', marginTop: 10}}>
            <Text style={styles.userIn}>Vehicle Type:</Text>
            <Text style={styles.userInfo}>{user.mobileNo}</Text>
            </View>
            <View style={{width: '100%', justifyContent: 'space-between', flexDirection: 'row', marginTop: 5}}>
            <Text style={styles.userIn}>Brand:</Text>
            <Text style={styles.userInfo}>{user.brand}</Text>
            </View>
            <View style={{width: '100%', justifyContent: 'space-between', flexDirection: 'row', marginTop: 5}}>
            <Text style={styles.userIn}>Model:</Text>
            <Text style={styles.userInfo}>{user.course}</Text>
            </View>
            <View style={{width: '100%', justifyContent: 'space-between', flexDirection: 'row', marginTop: 5}}>
            <Text style={styles.userIn}>Year Model:</Text>
            <Text style={styles.userInfo}>{user.year}</Text>
            </View>
            <View style={{width: '100%', justifyContent: 'space-between', flexDirection: 'row', marginTop: 5}}>
            <Text style={styles.userIn}>Plate No.:</Text>
            <Text style={styles.userInfo}>{user.idNumber}</Text>
            </View>
            <View style={{width: '100%', justifyContent: 'space-between', flexDirection: 'row', marginTop: 5}}>
            <Text style={styles.userIn}>Vehicle Color:</Text>
            <Text style={styles.userInfo}>{user.vehicleColor}</Text>
            </View>
        </View>

        <View style={{flexDirection: 'row', height: 25, marginTop: 15, marginBottom: 30, marginLeft: 5}}>
            <Text style={{marginTop: 5}}>Documents & vehicle Images: </Text>
            <TouchableOpacity
              style={styles.rvButton}
              onPress={() => navigation.navigate('DocsScreen', { user })}
            >
                <Text > Review Docs</Text>
            </TouchableOpacity>
        </View>

        <View style={{flexDirection: 'row', width: '100%', marginTop: 5, justifyContent: 'center', marginBottom: 10 }}>
            <TouchableOpacity
                style={styles.rButton}
                onPress={() => {
                    setSelectedId(user.id);
                    setModalVisible(true);     // Open the modal
                  }}
            >
                <Text style={[styles.btnText, {color: 'red'}]}>Reject</Text>
            </TouchableOpacity>

            {user.userType === 'Driver' && !user.isVerified && (
            <TouchableOpacity
                onPress={() => handleVerifyDriver(user.id)}
                style={styles.vButton}
            >
                <Text style={styles.btnText}>Verify Driver</Text>
            </TouchableOpacity>
            )}
        </View>
      
    </View>
    <SwipeableModal7
        isVisible={isModalVisible}
        onSwipeComplete={closeModal}
        onClose={closeModal}
      >
        
        <TextInput
            placeholder="State reason for rejection of driver applicant..."
            value={rejectionReason}
            onChangeText={setRejectionReason}
            multiline
            numberOfLines={4} // Adjusts the height
            style={{
                borderColor: '#0CC0DF',
                borderWidth: 1,
                padding: 10,
                borderRadius: 5,
                textAlignVertical: 'top',
                marginTop: 10
            }}
        />
            <TouchableOpacity
                onPress={() => handleRejectDriver(selectedId)} // Call rejection function
                style={[styles.button, {marginTop: 20}]}  // Style for proceed button
            >
                <Text style={styles.proceedText}>Proceed</Text>
            </TouchableOpacity>
         
      </SwipeableModal7>
  </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', paddingTop: 20 },
  
  rButton: {
    backgroundColor: 'lightgrey',
    width: 150,
    borderRadius: 5,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000', // Shadow color
    shadowOffset: { width: 0, height: 2 }, // Offset for the shadow (x, y)
    shadowOpacity: 0.25, // Opacity of the shadow
    shadowRadius: 3.84, // Shadow blur radius
       // Android shadow
    elevation: 2, // Elevation for Android
  },

  button: {
    backgroundColor: '#0CC0DF',
    padding: 10,
    borderRadius: 5,
    width: '45%',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,        
  },
  
  rvButton: {
    backgroundColor: '#0CC0DF',
    width: 130,
    borderRadius: 5,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000', // Shadow color
    shadowOffset: { width: 0, height: 2 }, // Offset for the shadow (x, y)
    shadowOpacity: 0.25, // Opacity of the shadow
    shadowRadius: 3.84, // Shadow blur radius
       // Android shadow
    elevation: 2, // Elevation for Android
  },

  info:{
    width: '98%', height: 'auto', borderLeftColor: '#0CC0DF', borderLeftWidth: 3, padding: 2, marginTop: 10, 
    borderLeftWidth: 3,
    shadowColor: '#000', // Shadow color
    shadowOffset: { width: 0, height: 2 }, // Offset for the shadow (x, y)
    shadowOpacity: 0.25, // Opacity of the shadow
    shadowRadius: 3.84, // Shadow blur radius
       // Android shadow
    elevation: 2, // Elevation for Android
    
  },
  vButton: {
    backgroundColor: 'green',
    width: 155,
    borderRadius: 5,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 13,
    shadowColor: '#000', // Shadow color
    shadowOffset: { width: 0, height: 2 }, // Offset for the shadow (x, y)
    shadowOpacity: 0.25, // Opacity of the shadow
    shadowRadius: 3.84, // Shadow blur radius
       // Android shadow
    elevation: 2, // Elevation for Android
  },   
  btnTxt2:{
    fontFamily: 'Poppins-Bold',
    color: '#0CC0DF',
    fontSize:  18,
    textDecorationLine: 'underline',
    
  }, 
  image: { width: 100, height: 100, borderRadius: 50, marginBottom: 10 },
  btnText:{
    fontFamily: 'Poppins-Regular',
    color: 'white',
  },

  input: { // Style for the TextInput
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 5,
},

proceedText: { // Style for text on Proceed button
    color: 'white',
    fontWeight: 'bold',
},
});

export default UserInfo;
