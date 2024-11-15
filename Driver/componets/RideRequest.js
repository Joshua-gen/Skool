import React, { useState, useEffect } from 'react';
import { View, FlatList, Text, Image, TouchableOpacity, Alert } from 'react-native';
import { firestore, auth } from '../../Config';
import { styles } from '../src/homestyle';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { notifyPassengerOfRequestAcceptance, notifyPassengerOfRequestRejected } from '../../service/Notifications'; // Adjust the import path
import {createNotification} from '../../service/createNotification';

const RideRequestList = ({ rideRequests, setRideRequests }) => {
   // New state to track if a request is currently being processed
   const [isProcessingRequest, setIsProcessingRequest] = useState(false);
    
  const acceptRequest = async (requestId) => {
    if (isProcessingRequest) {
      // Prevent accepting another request if one is already being processed
      Alert.alert('Error', 'A request is already being processed. Please wait.');
      return;
    }

    try {
      const rideRequest = rideRequests.find(request => request.id === requestId);
      if (!rideRequest) {
        Alert.alert('Error', 'Ride request not found.');
        return;
      }

      await firestore.collection('RideRequests').doc(requestId).update({
        isAccepted: true,
      });

      const rideDoc = await firestore.collection('Ride').doc(rideRequest.rideId).get();
      const rideData = rideDoc.data();
      if (!rideData || !rideData.seats) {
        Alert.alert('Error', 'Ride information or seats not available.');
        return;
      }

      let seatToAssign = rideRequest.seatNumber;
      if (!seatToAssign) {
        const availableSeat = Object.keys(rideData.seats).find(seatKey => !rideData.seats[seatKey]);
        if (!availableSeat) {
          Alert.alert('No available seats!', 'All seats are occupied.');
          return;
        }
        seatToAssign = availableSeat;
      }

      await firestore.collection('Ride').doc(rideRequest.rideId).update({
        [`seats.${seatToAssign}`]: {
          passengerId: rideRequest.passengerId,
          firstName: rideRequest.firstName,
          lastName: rideRequest.lastName,
          initialArrived: false,
          confirmArrived: false,
          isDrop: false,
        },
      });

      const driverDoc = await firestore.collection('users').doc(rideData.driverId).get();
      const driverData = driverDoc.data();
      if (!driverData) {
        Alert.alert('Error', 'Driver not found.');
        return;
      }

      await createNotification(
        rideRequest.passengerId, // Driver ID (recipient)
        'RideRequest Accepted', // Notification title
        `Your ride request has been accepted by ${driverData.firstName} ${driverData.lastName}.` // Notification message
      );

      await notifyPassengerOfRequestAcceptance(rideRequest.passengerId, {
        driverName: `${driverData.firstName} ${driverData.lastName}`,
        rideId: rideRequest.rideId,
      });
      

      setRideRequests(prevRequests => prevRequests.filter(request => request.id !== requestId));

      Alert.alert('Success', `Passenger assigned to seat ${seatToAssign}!`);

    } catch (error) {
      console.error('Error accepting ride request:', error);
      Alert.alert('Error', 'There was a problem accepting the ride request.');
    }finally {
      // Unlock after the request is processed
      setIsProcessingRequest(false);
    }
  };

  const rejectRequest = async (requestId) => {
    try {
      const rideRequestDoc = await firestore.collection('RideRequests').doc(requestId).get();
      const rideRequest = rideRequestDoc.data();

      if (!rideRequest) {
        Alert.alert('Error', 'Ride request not found.');
        return;
      }

      await firestore.collection('RideRequests').doc(requestId).update({
        isRejected: true,
      });

      const rideDoc = await firestore.collection('Ride').doc(rideRequest.rideId).get();
      const rideData = rideDoc.data();
      if (!rideData) {
        Alert.alert('Error', 'Ride information not found.');
        return;
      }

      const driverDoc = await firestore.collection('users').doc(rideData.driverId).get();
      const driverData = driverDoc.data();
      if (!driverData) {
        Alert.alert('Error', 'Driver not found.');
        return;
      }

      await notifyPassengerOfRequestRejected(rideRequest.passengerId, {
        driverName: `${driverData.firstName} ${driverData.lastName}`,
        rideId: rideRequest.rideId,
      });

      await createNotification(
        rideRequest.passengerId, // Driver ID (recipient)
        'Ride Request Rejected', // Notification title
        `Your ride request has been rejected by ${driverData.firstName} ${driverData.lastName}.` // Notification message
      );


      console.log(`Request ${requestId} has been rejected.`);

    } catch (error) {
      console.error('Error rejecting ride request:', error);
      Alert.alert('Error', 'There was a problem rejecting the ride request.');
    }
  };

  const handleHideRequest = async (requestId) => {
    try {
      await firestore.collection('RideRequests').doc(requestId).update({
        hidden: true,
      });
    } catch (error) {
      console.error('Error hide ride request:', error);
    }
  };

  const autoRejectOldRequests = async (requestsData) => {
    const now = new Date();
    const filteredRequests = [];
  
    for (const request of requestsData) {
      const requestTime = request.createdAt.toDate(); // Assuming 'createdAt' is a Firestore timestamp
      const elapsedMinutes = (now - requestTime) / (1000 * 60); // Convert milliseconds to minutes
  
      if (elapsedMinutes > 5) {
        await rejectRequest(request.id); // Automatically reject old requests
      } else {
        filteredRequests.push(request); // Keep valid requests
      }
    }
  
    // Return the filtered list of ride requests that are not rejected
    return filteredRequests;
  };
  

  const fetchRideRequests = async () => {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      console.error('User not logged in!');
      return;
    }
  
    try {
      const requestsSnapshot = await firestore
        .collection('RideRequests')
        .where('driverId', '==', currentUser.uid)
        .where('isAccepted', '==', false)
        .where('isRejected', '==', false)
        .where('hidden', '==', false)
        .orderBy('createdAt', 'asc') // Order by timestamp in descending order (newest first)
        .get();
  
      const requestsData = requestsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
  
      return requestsData; // Return fetched requests
    } catch (error) {
      console.error('Error fetching ride requests:', error);
    }
  };

  const formatTimestamp = (createdAt) => {
    const now = new Date();
    const timeDiff = now - createdAt.toDate(); // Difference in milliseconds
    const seconds = Math.floor(timeDiff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
  
    if (seconds < 60) {
      return 'now';
    } else if (minutes < 60) {
      return `${minutes} minute${minutes === 1 ? '' : 's'} ago`;
    } else if (hours < 24) {
      return `${hours} hour${hours === 1 ? '' : 's'} ago`;
    } else {
      // If more than 24 hours, return the exact date
      return createdAt.toDate().toLocaleDateString();
    }
  };
  

  useEffect(() => {
    const refreshRequests = async () => {
      const requestsData = await fetchRideRequests(); // Fetch new ride requests
      if (requestsData && requestsData.length > 0) {
        const filteredRequests = await autoRejectOldRequests(requestsData); // Auto-reject old requests
        setRideRequests(filteredRequests); // Set remaining valid requests
      }
    };
  
    // Fetch and auto-reject initially
    refreshRequests();
  
    // Set up auto-refresh interval (e.g., every 3 seconds)
    const intervalId = setInterval(() => {
      refreshRequests(); // Refresh every interval
    }, 3000); // Adjust interval as needed
  
    // Cleanup interval when the component unmounts
    return () => clearInterval(intervalId);
  }, []);
  

   // If there are no ride requests, return null
   if (!rideRequests || rideRequests.length === 0) {
    return null; // Don't render anything if the list is empty
  }
  

  return (
        <FlatList
           data={rideRequests}
           keyExtractor={(item) => item.id}
           renderItem={({ item }) => (
             <View style={styles.rideItem}>
               <View style={{width: '100%', flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5}}>
                 <Text style={styles.label}>Ride Request</Text>
                 <TouchableOpacity
                   style={{alignSelf: 'flex-end'}}
                   onPress={() => handleHideRequest(item.id)} // Press 'X' to hide the ride request
                 >
                   <Ionicons name="close" size={20} color="#0CC0DF" />
                 </TouchableOpacity>
               </View>
               <View style={{flexDirection: 'row', alignItems: 'center'}}>
                 {item.passengerProfile ? (
                   <Image source={{ uri: item.passengerProfile }} style={{ width: 50, height: 50, borderRadius: 100 }} />
                 ) : (
                   <Image
                     source={require('../../assets/default-profile.jpg')}
                     style={{ width: 50, height: 50, borderRadius: 100 }}
                   />
                 )} 
                 <View style={{width: '90%',}}> 
                 <Text style={[styles.value,{marginLeft: 1}]}>   {item.firstName} {item.lastName}</Text> 
                 <Text style={[styles.value,{marginLeft: 1, fontSize: 10}]} numberOfLines={1} 
    ellipsizeMode="tail">{item.passengerId}</Text>
                 </View>
                </View>
               <View style={{  }}>
                 <Text style={styles.value}> {formatTimestamp(item.createdAt)}</Text>
               </View>

               <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                 <TouchableOpacity
                   style={styles.button3}
                   onPress={() => rejectRequest(item.id)}
                 >
                   <Text style={styles.buttonText3}>Reject</Text>
                 </TouchableOpacity>
                 <TouchableOpacity
                   style={styles.button2}
                   onPress={() => acceptRequest(item.id)}  
                 >
                   <Text style={styles.buttonText2}>Accept</Text>
                 </TouchableOpacity>
               </View>
             </View>
           )}
         />
  );
};

export default RideRequestList;
