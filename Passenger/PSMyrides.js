import React, { useState, useEffect, useRef } from 'react'; 
import {
  StyleSheet, View, Text, TextInput, TouchableHighlight, ScrollView, Button, Image, Switch, RefreshControl, FlatList, ActivityIndicator,
  TouchableOpacity, Alert
} from 'react-native';
import { firestore, auth } from '../Config'; 
import { notifyDriverForArrival, notifyDriverForCancelation} from '../service/Notifications'; // Update this path based on where your functions are located
import { createNotification } from '../service/createNotification';
import SwipeableModal2 from '../src/SwipeableModal2';
import SwipeableModal5 from '../src/SwipeableModal5';
import Rating from '../RatingComponents/Rating';
import { updateRating } from '../RatingComponents/ratingService';
import Loading from '../src/loading';
import Header from '../src/Header';

import {AntDesign, Entypo, FontAwesome6, MaterialIcons, MaterialCommunityIcons} from '@expo/vector-icons';

const PSMyrides = ({navigation}) => {
  const [userRides, setUserRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false); // State for refreshing
  const [currentRating, setCurrentRating] = useState(0);
  const [isModalVisible, setModalVisible] = useState(false);
  const [isModalVisible2, setModalVisible2] = useState(false);
  const [clickCount, setClickCount] = useState(0); 
  const [selectedOption, setSelectedOption] = useState(null); // To track selected option (Cancel/Report)
  const [reportText, setReportText] = useState('');

  const openModal = () => {
    setModalVisible(true); // Open the modal
  };

  const openCancel = () => {
    setModalVisible2(true); // Open the modal
  };

  const closeModal = () => {
    setModalVisible(false);
    setModalVisible2(false);
  };
  
  const fetchPassengerRide = async () => {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      console.error('User not logged in!');
      return;
    }
  
    try {
      // Step 1: Fetch accepted ride request for the current passenger
      const rideRequestSnapshot = await firestore
        .collection('RideRequests')
        .where('passengerId', '==', currentUser.uid)
        .where('isAccepted', '==', true)  // Only accepted ride requests
        .where('isAcceptedRequestFinished', '==', false)  // Only active rides
        .limit(1)  // Assuming only one ride can be active at a time
        .get();
  
      if (rideRequestSnapshot.empty) {
        console.log('No active ride request found');
        return;
      }
  
      // Step 2: Extract the rideId from the ride request
      const rideRequestData = rideRequestSnapshot.docs[0].data();
      const rideId = rideRequestData.rideId;
  
      // Step 3: Fetch the corresponding ride using rideId
      const rideDoc = await firestore.collection('Ride').doc(rideId).get();
  
      if (!rideDoc.exists) {
        console.error('Ride not found');
        return;
      }
  
      // Step 4: Find the seat occupied by the current passenger
      const rideData = rideDoc.data();
      const passengerSeat = Object.entries(rideData.seats).find(
        ([seatId, seat]) => seat.passengerId === currentUser.uid
      );
  
      if (!passengerSeat) {
        console.error('No seat found for this passenger');
        return;
      }
  
      const [seatId, seatData] = passengerSeat;
  
      // Step 5: Set the ride and seat data in state
      setUserRides([{ id: rideDoc.id, ...rideData, seatId, seatData }]);
  
    } catch (error) {
      console.error('Error fetching passenger ride:', error);
    } finally {
      setLoading(false);
      setRefreshing(false); // Stop the refreshing animation
    }
  };
  
  const updateRideArrival = async (rideId, seatId, rideRequest) => {
    try {
      // Reference to the ride document
      const rideRef = firestore.collection('Ride').doc(rideId);
  
      // Perform the update to set initialArrived to true for the specific seat
      await rideRef.update({
        [`seats.${seatId}.initialArrived`]: true  // Update the nested field
      });
  
      const currentUser = auth.currentUser;
  
      // Fetch current user's data
      const userDoc = await firestore.collection('users').doc(currentUser.uid).get();
      const { firstName, lastName } = userDoc.data(); // Destructure the user data
      const passengerName = `${firstName} ${lastName}`;

      // Notify the driver and include the passenger's name
      await notifyDriverForArrival(rideRequest.driverId, {
        passengerName,  // Shortened form of passing name
      });
       // Trigger a notification to the driver
       await createNotification(
        rideRequest.driverId, // Driver ID (recipient)
        'Passenger Arrived', // Notification title
        `Your passenger has arrived on the pickup location - ${passengerName}.` // Notification message
      );
    } catch (error) {
      console.error('Error updating initialArrived:', error);
    }
  };
  
  const updateInitialArrived = () => {
    const ride = userRides[0]; // Assuming this is the current ride
    if (!ride) {
      console.error('No current ride found');
      return;
    }
  
    const rideId = ride.id; // The ride's document ID
  
    // Ensure `seats` is defined and is an object
    if (!ride.seats || typeof ride.seats !== 'object') {
      console.error('Seats data is invalid or undefined');
      return;
    }
  
    // Find the seatId by passengerId using debugging
    const seatEntry = Object.entries(ride.seats).find(([seatId, seat]) => seat.passengerId === auth.currentUser.uid);
  
    if (!seatEntry) {
      console.error('No seat found for this passenger');
      return;
    }

    const [seatId, seatData] = seatEntry; // Destructure seatId and seatData
  
    // Debugging to verify correct seat is being selected
    //console.log('Selected seatId:', seatId, 'Seat Data:', seatData);
  
    // Debugging ride object to verify driverId exists
   // console.log('Ride Object:', ride);
  
    // Now call the update function only if both IDs are defined
    if (rideId && seatId) {
      const rideRequest = { driverId: ride.driverId }; // Ensure ride has a driverId
      if (!rideRequest.driverId) {
        console.error('No driverId found in ride object');
        return;
      }
  
      updateRideArrival(rideId, seatId, rideRequest); // Pass rideRequest (or at least driverId)
    } else {
      console.error('Error: seatId or rideId is missing');
    }
  };
  

  const handleButtonPress = () => {
    if (clickCount < 5) {
      setClickCount(clickCount + 1);
      updateInitialArrived();
    } else {
      console.log('Button clicked 5 times, further clicks disabled');
    }
  };

  // cancel ride sending notification....
  const handleCancel = async () => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      console.error('User not logged in!');
      return;
    }

    // Step 1: Fetch the user's first name and last name
    const userDoc = await firestore.collection('users').doc(currentUser.uid).get();
    const { firstName, lastName } = userDoc.data();
    const passengerName = `${firstName} ${lastName}`;

    // Step 2: Fetch the current active ride request
    const rideRequestSnapshot = await firestore
      .collection('RideRequests')
      .where('passengerId', '==', currentUser.uid)
      .where('isAccepted', '==', true) // Only accepted ride requests
      .where('isAcceptedRequestFinished', '==', false) // Only active rides
      .limit(1)
      .get();

    if (rideRequestSnapshot.empty) {
      console.log('No active ride request found');
      return;
    }

    const rideRequestData = rideRequestSnapshot.docs[0].data();
    const driverId = rideRequestData.driverId; // Get the driver ID

    if (!driverId) {
      console.error('No driver found for this ride');
      return;
    }

    // Notify the driver and include the passenger's name
    await notifyDriverForCancelation(driverId, {
      passengerName,  // Shortened form of passing name
    });

    // Step 3: Trigger a notification to the driver about the ride cancellation
    await createNotification(
      driverId, // Driver ID (recipient)
      'Ride Cancelation', // Notification title
      `Your passenger ${passengerName} has canceled the ride.` // Notification message
    );

    console.log('Notification sent to the driver');
    
    // Close the modal after cancellation
    closeModal();
  } catch (error) {
    console.error('Error canceling the ride:', error);
  }
};

const handleReportSubmit = async () => {
  if (!reportText.trim()) {
    alert('Please describe the issue.');
    return;
  }

  try {
    // Submit the report with passenger, driver IDs, and ride ID
    const currentUser = auth.currentUser;
    const passengerId = currentUser.uid;
    const ride = userRides[0]; // Assuming userRides has the current ride

    if (ride && ride.driverId) {
      const driverId = ride.driverId;
      const rideId = ride.id; // Get the ride ID from the current ride

      await submitReport(passengerId, driverId, rideId, reportText);
      alert('Your report has been submitted.');
      setSelectedOption(null); // Close the report modal
    } else {
      console.error('No driver or ride found to report');
    }
  } catch (error) {
    console.error('Error submitting the report:', error);
  }
};

const submitReport = async (passengerId, driverId, rideId, reportText) => {
  try {
    await firestore.collection('Reports').add({
      passengerId,
      driverId,
      rideId, // Save the ride ID in the report
      reportText,
      timestamp: new Date(),
    });
    console.log('Report submitted successfully');
  } catch (error) {
    console.error('Error submitting the report:', error);
  }
};

  useEffect(() => {  
    fetchPassengerRide();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchPassengerRide(); // Fetch new data on refresh
  };
  
  const renderRideItem = ({ item }) => {
    const seatData = item.seatData;  // Use the seatData for this passenger
    const seatDropOff = seatData?.dropOff;  // Get the dropOff data for this seat

    return (
      <View style={styles.rideItem}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Text style={{ fontFamily: 'Poppins-Medium', fontSize: 18 }}>Your Current Ride</Text>
          <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '30%'}}>
            <Text style={styles.rideText}>
              {item?.isFinish ? 'Completed' : 'Ongoing'}
            </Text>
            <TouchableOpacity 
              onPress={openCancel}
            >
              <Entypo name="dots-three-horizontal" size={24} color="black" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ marginBottom: 10 }}>
        <View style={{flexDirection: 'row', alignItems: 'center'}}>
          <Entypo name="location-pin" size={25} color="black" />
          <Text style={styles.label}>Origin:</Text>
        </View>
        <View style={{ marginLeft: 15 }}>
          <Text style={styles.value}> {item?.rideOriginPlace}</Text>
          <Text style={{ fontFamily: 'Poppins-Regular', color: 'grey' }}>
            {item?.rideOrigin?.latitude?.toFixed(6) || 'N/A'}, {item?.rideOrigin?.longitude?.toFixed(6) || 'N/A'}
          </Text>
        </View>
      </View>

        <View style={{ marginBottom: 10 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Entypo name="location-pin" size={25} color="red" />
            <Text style={styles.label}>Seat Drop-off:</Text>
          </View>
          <View style={{ marginLeft: 15 }}>
            <Text style={styles.value}>
              {seatDropOff?.place ?? 'Not Set'}
            </Text>
            <Text style={{ fontFamily: 'Poppins-Regular', color: 'grey' }}>
              {seatDropOff?.latitude?.toFixed(6) ?? 'N/A'}, {seatDropOff?.longitude?.toFixed(6) ?? 'N/A'}
            </Text>
          </View>
        </View>

        {/* Distance and Fare for the seat */}
        <View style={{ marginBottom: 10, flexDirection: 'row', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: 'grey' }}> 
          <View>
            <Text style={styles.label}>Seat Distance:</Text>
            <View style={{ marginLeft: 15 }}>
              <Text style={styles.value}>
              {seatDropOff?.distance?.toFixed(2) ?? 'N/A'} km
              </Text>
            </View>
          </View>
          <View>
            <Text style={styles.label}>Seat Fare:</Text>
            <View style={{ marginLeft: 15, flexDirection: 'row', alignItems: 'center', }}>
              <FontAwesome6 name="peso-sign" size={20} color="black" />
              <Text style={[styles.value, { fontSize: 20 }]}>
              {seatDropOff?.fare?.toFixed(2) ?? 'N/A'}
              </Text>
            </View>
          </View>
        </View>
    
        <View style={{ width: '100%', height: 'auto', flexDirection: 'row', alignItems: 'center', marginBottom: 10,}}>
          <View style={{alignItems: 'center', justifyContent: 'center', width: '50%', height: 150}}>
            <Image
              source={{ uri: item?.driversProfile }}
              style={{ width: 80, height: 80, borderRadius: 100, marginTop: 5 }}
            />
            <Text style={[styles.value, {fontSize: 16}]}>{item?.driversFirstName} {item?.driversLastName}</Text>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <AntDesign name="star" size={30} color="#FFE234" />    
              <Text style={[styles.value, {fontSize: 16}]}>{item?.rating?.toFixed(1)}</Text>
            </View>
            <Text style={[styles.value, {fontSize: 16}]}>{item?.vehicleClass} - {item?.vehicleColor}</Text>
          </View>
          <View style={{alignItems: 'center', justifyContent: 'center', width: '50%', height: 150,}}>
            {clickCount < 5 ? (
              <TouchableOpacity 
                style={styles.button}
                onPress={handleButtonPress} // Call the handleButtonPress function
              >
                <Text style={styles.buttonText}>I'm here</Text>
              </TouchableOpacity>
            ) : null}
            <TouchableOpacity style={styles.button}>
              <Text 
                style={styles.buttonText}
                onPress={openModal}
              > 
                Rate Driver
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <Loading/>
    );
  }
  
  return (

    <View style={styles.mobilecontainer}>
      <Header/>
      <View style={{width: '100%', height: '100%', padding: 2}}>
        <FlatList
          data={userRides}
          keyExtractor={(item) => item.id}
          renderItem={renderRideItem}
            
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      </View>
      <SwipeableModal2
            isVisible={isModalVisible}
            onSwipeComplete={closeModal}
            onClose={closeModal}
          >
            <Rating currentRating={currentRating} onRatingChange={(rating) => setCurrentRating(rating)} />

            <TouchableOpacity style={styles.button} onPress={() => handleRatingSubmit(currentRating)}>
              <Text style={styles.buttonText}>Submit Rating</Text>
            </TouchableOpacity>
      </SwipeableModal2>

      <SwipeableModal5
        isVisible={isModalVisible2}
        onSwipeComplete={closeModal}
        onClose={closeModal}
      >
        {!selectedOption && ( // Show options only if no option is selected
        <>
          <View style={{ width: '95%', marginTop: 20, alignItems: 'center' }}>
            <TouchableOpacity style={styles.button} onPress={() => setSelectedOption('cancel')}>
              <Text style={{color: 'red', fontFamily: 'Poppins-Regular'}}>Cancel Ride</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.button, {marginTop: 10}]} onPress={() => setSelectedOption('report')}>
              <Text style={{fontFamily: 'Poppins-Regular'}}>Report Issue</Text>
            </TouchableOpacity>
          </View>
        </>
      )}

      {selectedOption === 'cancel' && ( // Show cancel content if 'Cancel Ride' is selected
        <>
          <Text style={[styles.value,{color: 'red', fontSize: 18}]}>Ride Cancelation</Text>
          <Text style={styles.value}>You want to cancel your ride?</Text>
          <View style={{ width: '95%', flexDirection: 'row', justifyContent: 'space-between', marginTop: 20, alignItems: 'center' }}>
            <TouchableOpacity style={styles.buttonP} onPress={() => setSelectedOption(null)}>
              <Text>Back</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.button, { width: '45%' }]} onPress={handleCancel}>
              <Text>Proceed</Text>
            </TouchableOpacity>
          </View>
        </>
      )}

      {selectedOption === 'report' && ( // Show report content if 'Report Issue' is selected
        <>
          <Text style={styles.value}>Report an issue with the ride:</Text>
          <TextInput
            style={styles.input}
            placeholder='Describe the issue..'
            value={reportText} // Bind state
            onChangeText={setReportText} // Set report text
          />
          <View style={{ width: '95%', flexDirection: 'row', justifyContent: 'space-between', marginTop: 20, alignItems: 'center' }}>
            <TouchableOpacity style={styles.buttonP} onPress={() => setSelectedOption(null)}>
              <Text>Back</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.button, { width: '45%' }]} 
              onPress={handleReportSubmit} // Call handleReportSubmit function
            >
              <Text>Submit</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
      </SwipeableModal5>
    </View> 
  );
};

export default PSMyrides;


const styles = StyleSheet.create({
  mobilecontainer:{
    flex:1,
    
  }, 
  
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0CC0DF',
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 18,
    color: '#666',
  },
  button: {
    backgroundColor: '#0CC0DF',
    padding: 10,
    borderRadius: 5,
    width: '80%',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,        
  },

  rideItem: {
    padding: 10,
    height: '100%',
    width: '100%',
    alignSelf: 'center',
    backgroundColor: '#fff',
    borderColor: '#0CC0DF',
    borderWidth: 1  ,
    borderRadius: 8,
    shadowColor: '#000', // Shadow color
    shadowOffset: { width: 0, height: 2 }, // Offset for the shadow (x, y)
    shadowOpacity: 0.25, // Opacity of the shadow
    shadowRadius: 3.84, // Shadow blur radius
    // Android shadow
    elevation: 5, // Elevation for Android
  },
  rideText: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular'
  },

  buttonP: {
    backgroundColor: 'white',
    borderWidth: 2,
    borderColor:  '#0CC0DF',
    padding: 10,
    borderRadius: 5,
    width: '45%',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,      
  },

  value:{
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
  },
  label:{
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
  },
  seats: {
    width: '50%', 
    borderColor: 'black', 
    borderWidth: 1, 
    height: 150,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  seatContainer: {
    width: '100%',
    marginTop: 10,
    borderLeftColor: '#0CC0DF',
    backgroundColor: 'white',
    borderLeftWidth: 3,
    alignItems: 'center',
    shadowColor: '#000', // Shadow color
    shadowOffset: { width: 0, height: 2 }, // Offset for the shadow (x, y)
    shadowOpacity: 0.25, // Opacity of the shadow
    shadowRadius: 3.84, // Shadow blur radius
    // Android shadow
    elevation: 5, // Elevation for Android
  },
  seatText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 14, 
  },

  occupiedText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
    color: 'red',
  },

  availableText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
    color: 'green',
  },

  seatVal: { 
    flexDirection: 'row', 
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '95%'
  },
  seatVal2: { 
    width: '95%',
  },
  searchContainer: {
    width: '92%',
    borderColor: '#0CC0DF',
    height: 50,
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 5,
    height: 'auto',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'Poppins-Regular',
  },
  input: {
    width: '100%',
    padding: 10,
    borderColor: '#0CC0DF',
    borderWidth: 1,
    borderRadius: 5,
    height: 40
  },

  dropoff: {
    alignSelf: 'flex-end', marginRight: 10, marginBottom: 10
  },

  pssLabel: {fontFamily: 'Poppins-Regular', fontSize: 10},
  pssValue: {fontFamily: 'Poppins-Medium', fontSize: 13}
 

})
