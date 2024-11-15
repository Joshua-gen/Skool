import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert } from 'react-native';
import { firestore } from '../Config'; // Update with your Firebase config path 
import { createNotification } from '../service/createNotification';
import SwipeableModal6 from '../src/SwipeableModal6';
import Ionicons from '@expo/vector-icons/Ionicons';
import Entypo from '@expo/vector-icons/Entypo';
import AntDesign from '@expo/vector-icons/AntDesign';

const DRAccountInfo = ({ route, navigation }) => {
  const { user } = route.params;
  const [isModalVisible, setModalVisible] = useState(false);  
  const [selectedId, setSelectedId] = useState(false);  
  const [isRestricted, setIsRestricted] = useState(false);  
  const [isBlocked, setIsBlocked] = useState(false);  

  const closeModal = () => {
    setModalVisible(false);
  };

  const handleToggleRestriction = async () => {
    try {
      await firestore.collection('users').doc(user.id).update({ isRestricted: !isRestricted });
      setIsRestricted(!isRestricted);
      Alert.alert(
        `User ${!isRestricted ? "Restricted" : "Unrestricted"}`,
        `The user has been ${!isRestricted ? "restricted" : "unrestricted"} successfully.`
      );
      // Send a notification to the driver
      // Send a notification only if the user is restricted
      if (!isRestricted) {
        await createNotification(
          user.id,
          'Warning',
          'Your account has been restricted by the admin, contact support.'
        );
      }

      closeModal();
    } catch (error) {
      console.error("Error updating restriction status:", error);
    }
  };

  const handleToggleBlock = async () => {
    try {
      await firestore.collection('users').doc(user.id).update({ isBlocked: !isBlocked });
      setIsBlocked(!isBlocked);
      Alert.alert(
        `User ${!isBlocked ? "Blocked" : "Unblock"}`,
        `The user has been ${!isBlocked ? "blocked" : "unblocked"} successfully.`
      );
      closeModal();
    } catch (error) {
      console.error("Error updating restriction status:", error);
    }
  };

  // Function to delete the user with confirmation
const handleDeleteUser = () => {
  // Show a confirmation alert before proceeding with deletion
  Alert.alert(
    "Confirm Deletion",
    "Are you sure you want to delete this user? This action cannot be undone.",
    [
      {
        text: "Cancel",
        style: "cancel"
      },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await firestore.collection('users').doc(user.id).delete();
            Alert.alert("User Deleted", "The user has been deleted successfully.");
            navigation.goBack();
          } catch (error) {
            console.error("Error deleting user:", error);
            Alert.alert("Error", "There was an error deleting the user. Please try again.");
          }
        }
      }
    ],
    { cancelable: true }
  );
};

  // Function to navigate to the update screen
  const handleUpdateUser = () => {
    navigation.navigate('UpdateDriver', { user });
  };

   // Fetch the restriction and block status from Firestore
   useEffect(() => {
    const fetchUserStatus = async () => {
      try {
        const userDoc = await firestore.collection('users').doc(user.id).get();
        if (userDoc.exists) {
          setIsRestricted(userDoc.data().isRestricted || false);
          setIsBlocked(userDoc.data().isBlocked || false);
        }
      } catch (error) {
        console.error("Error fetching user status:", error);
      }
    };

    fetchUserStatus();
  }, [user.id]);


  return (
    <View style={styles.container}>
      <View style={{backgroundColor: '#0CC0DF', width: '100%', height: 50, alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between'}}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{marginLeft: 5}}
        >
          <Ionicons name="arrow-back" size={28} color="white" />
        </TouchableOpacity>
          <Text style={{fontFamily: 'Poppins-Medium', fontSize: 18, marginRight: 10, color: 'white'}}>Driver Account</Text>
        </View>
      
      <View style={styles.info}>
        <View style={{alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between'}}>
          {user.formalPhoto && (
              <Image 
                source={{ uri: user.formalPhoto }} 
                style={{ width: 100, height: 100, borderRadius: 100, marginTop: 10 }}
                onError={(e) => console.log('Error loading image: ', e.nativeEvent.error)}
              />
          )}
          <View style={{width: '50%', paddingLeft: 5, height: 70,}}>
            <Text style={{fontSize: 24, fontWeight: 'bold'}}>{user.firstName} {user.lastName}</Text>
            <View style={{alignItems: 'center', flexDirection: 'row'}}>
              <AntDesign name="star" size={20} color="#FFE234" />
              <Text style={{fontSize: 18, fontWeight: 'bold',}}>{user.rating?.toFixed(1)}</Text>
            </View>
            <Text style={[styles.userName, {fontSize: 10, color: 'grey'}]}>{user.id}</Text>
          </View>

          <TouchableOpacity 
            style={{marginRight: 10, marginBottom: 70}}
            onPress={() => {
              setSelectedId(user.id);
              setModalVisible(true);     // Open the modal
            }}> 
              <Entypo name="dots-three-horizontal" size={24} color="black" />
          </TouchableOpacity>
        </View>
        <View style={styles.statusContainer}>
          {isBlocked && <Text style={[styles.userInfo, {color: 'red', marginLeft: 5}]}>This user is blocked.</Text>}
          {isRestricted && <Text style={[styles.userInfo, {color: 'red', marginLeft: 5}]}>This user is restricted.</Text>}
        </View>
        <View style={{width: '96.5%', marginLeft: 5}}>
          <View style={{width: '100%', justifyContent: 'space-between', flexDirection: 'row', marginTop: 10}}>
            <Text style={styles.userIn}>Gender:</Text>
            <Text style={styles.userInfo}>{user.gender}</Text>
          </View>
          <View style={{width: '100%', justifyContent: 'space-between', flexDirection: 'row', marginTop: 10}}>
            <Text style={styles.userIn}>Mobile No.:</Text>
            <Text style={styles.userInfo}>{user.mobileNo}</Text>
          </View>
          <View style={{width: '100%', justifyContent: 'space-between', flexDirection: 'row', marginTop: 5}}>
            <Text style={styles.userIn}>Email:</Text>
            <Text style={styles.userInfo}>{user.email}</Text>
          </View>
          <View style={{width: '100%', justifyContent: 'space-between', flexDirection: 'row', marginTop: 5, marginBottom: 10}}>
            <Text style={styles.userIn}>Password:</Text>
            <Text style={styles.userInfo}>xxxxxxxx</Text>
          </View>
        </View>

        <View style={{width: '96.5%', marginLeft: 5, borderTopWidth: 1, borderTopColor: 'grey'}}>
          <View style={{width: '100%', justifyContent: 'space-between', flexDirection: 'row', marginTop: 5}}>
            <Text style={styles.userIn}>Institution:</Text>
            <Text style={styles.userInfo}>SIT West Nagros University</Text>
          </View>
          <View style={{width: '100%', justifyContent: 'space-between', flexDirection: 'row', marginTop: 5}}>
            <Text style={styles.userIn}>Course:</Text>
            <Text style={styles.userInfo}>{user.course}</Text>
          </View>
          <View style={{width: '100%', justifyContent: 'space-between', flexDirection: 'row', marginTop: 5}}>
            <Text style={styles.userIn}>Year:</Text>
            <Text style={styles.userInfo}>{user.year}</Text>
          </View>
          <View style={{width: '100%', justifyContent: 'space-between', flexDirection: 'row', marginTop: 5, marginBottom: 10}}>
            <Text style={styles.userIn}>Student No:</Text>
            <Text style={styles.userInfo}>{user.idNumber}</Text>
          </View>
        </View>
        <View style={{width: '96.5%', marginLeft: 5, borderTopWidth: 1, borderTopColor: 'grey',}}>
          <View style={{width: '100%', justifyContent: 'space-between', flexDirection: 'row', marginTop: 10}}>
            <Text style={styles.userIn}>Vehicle Type:</Text>
            <Text style={styles.userInfo}>{user.vehicleClass}</Text>
          </View>
          <View style={{width: '100%', justifyContent: 'space-between', flexDirection: 'row', marginTop: 5}}>
            <Text style={styles.userIn}>Brand:</Text>
            <Text style={styles.userInfo}>{user.brand}</Text>
          </View>
          <View style={{width: '100%', justifyContent: 'space-between', flexDirection: 'row', marginTop: 5}}>
            <Text style={styles.userIn}>Model:</Text>
            <Text style={styles.userInfo}>{user.model}</Text>
          </View>
          <View style={{width: '100%', justifyContent: 'space-between', flexDirection: 'row', marginTop: 5}}>
            <Text style={styles.userIn}>Year Model:</Text>
            <Text style={styles.userInfo}>{user.yearModel}</Text>
          </View>
          <View style={{width: '100%', justifyContent: 'space-between', flexDirection: 'row', marginTop: 5}}>
            <Text style={styles.userIn}>Plate No.:</Text>
            <Text style={styles.userInfo}>{user.plateNo}</Text>
          </View>
          <View style={{width: '100%', justifyContent: 'space-between', flexDirection: 'row', marginTop: 5}}>
            <Text style={styles.userIn}>Vehicle Color:</Text>
            <Text style={styles.userInfo}>{user.vehicleColor}</Text>
          </View>
          <View style={{width: '100%', justifyContent: 'space-between', flexDirection: 'row', marginTop: 5, alignItems: 'center', marginBottom: 10}}>
            <Text style={styles.userIn}>Document and Vehicle Images: </Text>
            <TouchableOpacity
                style={styles.rButton}
                onPress={() => navigation.navigate('DRDocument', { user })}
            >
                <Text style={{fontSize: 12, fontWeight: 'bold', color: 'white'}}>View Docs</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={{flexDirection: 'row', width: '100%', marginTop: 5, justifyContent: 'space-between',   }}>
          <TouchableOpacity
            style={styles.rhBtn}
          >
            <Text style={styles.btnText}>Ride History</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.reportBtn}
          >
            <Text style={{color: '#0CC0DF', fontSize: 18}}>Reports</Text>
          </TouchableOpacity>
        </View>
      </View>
      <SwipeableModal6
        isVisible={isModalVisible}
        onSwipeComplete={closeModal}
        onClose={closeModal}
      >
        
        <View style={{ width: '95%', marginTop: 20, alignItems: 'center' }}>
            <TouchableOpacity style={[styles.button, {width: '65%'}]} onPress={handleUpdateUser} >
              <Text style={{fontFamily: 'Poppins-Medium', color: 'white'}}>Update User</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.button, {marginTop: 5, width: '65%'}]}  onPress={handleToggleRestriction}>
              <Text style={{color: 'white', fontFamily: 'Poppins-Medium'}}>{isRestricted ? "Unrestrict User" : "Restrict User"}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.button, {marginTop: 5, width: '65%'}]} >
              <Text style={{color: 'white', fontFamily: 'Poppins-Medium'}} onPress={handleToggleBlock }>{isBlocked ? "Unblock User" : "Block User"}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.button, { marginTop: 5, width: '65%' }]} onPress={handleDeleteUser}>
              <Text style={{ color: 'red', fontFamily: 'Poppins-Medium' }}>Delete User</Text>
            </TouchableOpacity>
          </View>
         
      </SwipeableModal6>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center'
  },
  userIn: {
    fontSize: 16,
  },
  userInfo: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  rButton: {
    backgroundColor: '#0CC0DF',
    width: 100,
    borderRadius: 5,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },

  reportBtn: {
    borderColor: '#0CC0DF',
    borderWidth: 2,
    width: 165,
    borderRadius: 5,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
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

  rhBtn: {
    backgroundColor: '#0CC0DF',
    width: 165,
    borderRadius: 5,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnText: {
    color: 'white',
    fontSize: 18,
  },
  info:{
    width: '98%', height: 'auto', borderLeftColor: '#0CC0DF', borderLeftWidth: 3, padding: 2, marginTop: 10, 
    
  },
});

export default DRAccountInfo;
