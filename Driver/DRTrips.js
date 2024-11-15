import React, { useState, useEffect } from 'react';
import { GOOGLE_MAPS_KEY } from '@env';
import { StyleSheet, View, Text, FlatList, ActivityIndicator, TouchableOpacity, Image, RefreshControl, TextInput, Alert} from 'react-native';
import { styles } from './src/style'
import { firestore, auth } from '../Config'; 
import { notifyPassengerForCancelation, notifyPassengerForSeatCancelation} from '../service/Notifications'; // Update this path based on where your functions are located
import { createNotification } from '../service/createNotification';
import SwipeableModal3 from '../src/SwipeableModal3';
import SwipeableModal4 from '../src/SwipeableModal4';
import Rating from '../RatingComponents/Rating';
import { updateRating } from '../RatingComponents/ratingService';
import Loading from '../src/loading';
import Header from '../src/Header';

import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import Entypo from '@expo/vector-icons/Entypo';

const DRTrips = ({ navigation }) => {
  const [userRides, setUserRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false); // State for refreshing
  const [vehicleClass, setVehicleClass] = useState(null); // State to store vehicle type
  const [currentRating, setCurrentRating] = useState(0);
  const [isModalVisible, setModalVisible] = useState(false);  
  const [isModalVisible2, setModalVisible2] = useState(false);  
  const [selectedPassengerId, setSelectedPassengerId] = useState(null);
  const [selectedSeat, setSelectedSeat] = useState(null); // To track which seat is being canceled
  const [selectedRideId, setSelectedRideId] = useState(null);
  const [selectedOption, setSelectedOption] = useState(null); // To track selected option (Cancel/Report)
  const [cancelReason, setCancelReason] = useState('');
  const [reportReason, setReportReason] = useState('');

  const closeModal = () => {
    setModalVisible(false);
    setModalVisible2(false);
  };

  const handleRatingSubmit = async (passengerId, rating) => {
    if (passengerId) {
      await updateRating(passengerId, rating, 0, false); // false for passenger rating
      Alert.alert('Success', 'You have successfully rated the passenger.');
    }
    setModalVisible2(false);
  };

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
        .where('isFinish', '==', false)
        .where('cancel', '==', false)
        .get();

      const ridesData = ridesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));

      setUserRides(ridesData);
    } catch (error) {
      console.error('Error fetching rides:', error);
    } finally {
      setLoading(false);
      setRefreshing(false); // Stop the refreshing animation after data is loaded
    }
  };
  
  // start ride will add the time of starting the ride 
 // Start ride will add the time of starting the ride 
  // start ride will add the time of starting the ride 
 // Start ride will add the time of starting the ride 
 const startRide = async (rideId) => {
  try {
    const rideDoc = await firestore.collection('Ride').doc(rideId).get();
    const rideData = rideDoc.data();
    const rideOriginCoords = rideData.rideOrigin;  // Ride origin coordinates
    let updatedSeats = { ...rideData.seats };  // Get all seats
    let totalFare = 0;  // Initialize total fare

    const defaultDistance = await getDistanceFromGoogle(rideOriginCoords, rideData.rideDestination);
    const defaultFare = await calculateFare(rideOriginCoords, rideData.rideDestination);

    // Calculate fare for each occupied seat
    let totalDistanceSum = 0;
    let distancePerPassenger = {};  // Store distance traveled for each passenger

    // Calculate total distance sum for all passengers
    Object.keys(updatedSeats).forEach((seatKey) => {
      const seat = updatedSeats[seatKey];
      if (seat && seat.passengerId) {  // Only calculate fare for occupied seats
        if (!seat.dropOff) {
          // Assign default drop-off if none is set
          updatedSeats[seatKey].dropOff = {
            place: rideData.rideDestinationPlace,
            latitude: rideData.rideDestination.latitude,
            longitude: rideData.rideDestination.longitude,
            distance: defaultDistance
          };
        }
        
        const passengerDistance = seat.dropOff?.distance || defaultDistance;  // Use drop-off distance or default
        distancePerPassenger[seatKey] = passengerDistance;  // Store distance
        totalDistanceSum += passengerDistance;
      }
    });

    // Calculate the fare for each passenger based on the distance they travel
    Object.keys(updatedSeats).forEach((seatKey) => {
      const seat = updatedSeats[seatKey];
      if (seat && seat.passengerId) {
         // Set drop-off to default destination if not provided
         if (!seat.dropOff) {
          updatedSeats[seatKey].dropOff = {
            place: rideData.rideDestinationPlace,
            latitude: rideData.rideDestination.latitude,
            longitude: rideData.rideDestination.longitude,
            distance: defaultDistance,
            fare: defaultFare
          };
        }
        
        const passengerDistance = distancePerPassenger[seatKey];
        const passengerShare = (passengerDistance / totalDistanceSum) * defaultFare;  // Proportional fare
        
        // Ensure dropOff exists before setting the fare
        updatedSeats[seatKey].dropOff = updatedSeats[seatKey].dropOff || {};
        updatedSeats[seatKey].dropOff.fare = passengerShare;  // Update fare for the seat
        totalFare += passengerShare;  // Add to total fare
      }
    });

    // Save updated seat info and total fare
    await firestore.collection('Ride').doc(rideId).update({
      startTime: new Date(),
      seats: updatedSeats,
      totalFare: totalFare,  // Store the total fare
      isStarted: true,
    });
    
     // Step 2: Update the RideRequest document(s) for accepted passengers in the ride
     const rideRequestSnapshot = await firestore.collection('RideRequests')
     .where('rideId', '==', rideId)
     .where('isAccepted', '==', true)
     .get();

     if (!rideRequestSnapshot.empty) {
       const batch = firestore.batch(); // Use a batch to update multiple documents

       rideRequestSnapshot.docs.forEach(doc => {
         batch.update(doc.ref, {
           isAcceptedRequestStarted: true, // Mark request as finished
         });
       });

       // Commit the batch update
       await batch.commit();
     }

    Alert.alert('Success', 'Ride started with fare split based on distance!');
    fetchUserRides();  // Update UI
  } catch (error) {
    console.error('Error starting ride:', error);
    Alert.alert('Error', 'Failed to start the ride.');
  }
};

  //finish ride it will chnage the value of ride isFinish into true
  const finishRide = async (rideId) => {
    try {
      // Fetch the ride document from Firestore
      const rideDoc = await firestore.collection('Ride').doc(rideId).get();
      
      if (rideDoc.exists) {
        const rideData = rideDoc.data();

        // Check if the ride has been started
        if (!rideData.isStarted) {
          Alert.alert('Error', 'You cannot finish a ride that has not been started.');
          return; // Exit the function if the ride hasn't started
        }
      
        await firestore.collection('Ride').doc(rideId).update({
          isFinish: true,  // Mark the ride as finished
          finishTime: new Date(),  // Record finish time
        });
        // Step 2: Update the RideRequest document(s) for accepted passengers in the ride
        const rideRequestSnapshot = await firestore.collection('RideRequests')
        .where('rideId', '==', rideId)
        .where('isAccepted', '==', true)
        .get();

        if (!rideRequestSnapshot.empty) {
          const batch = firestore.batch(); // Use a batch to update multiple documents

          rideRequestSnapshot.docs.forEach(doc => {
            batch.update(doc.ref, {
              isAcceptedRequestFinished: true, // Mark request as finished
            });
          });

          // Commit the batch update
          await batch.commit();
        }
        
        Alert.alert('Congrats', 'Your trip has been finished!');
        
        fetchUserRides();  // Re-fetch the data to update the UI
      } else {
        Alert.alert('Error', 'Ride not found.');
      }
    } catch (error) {
      console.error('Error finishing ride:', error);
      Alert.alert('Error', 'Failed to finish the ride.');
    }
  };
  
// setting Dropoff 
const handleDropoffSelect = (rideId, seatKey, location) => {
  // Check if location and rideId are provided
  if (location && rideId) {
    // Fetch the ride document from Firestore
    firestore.collection('Ride').doc(rideId).get()
      .then(async (doc) => {
        if (doc.exists) {
          const rideData = doc.data(); // Get ride data
          const rideOriginCoords = rideData.rideOrigin; // Ride origin coordinates
          const dropOffCoords = location.coordinates; // Coordinates of selected drop-off location

          // Default drop-off coordinates if no drop-off is set for a seat
          const defaultDropOff = {
            latitude: rideData.rideDestination.latitude,
            longitude: rideData.rideDestination.longitude
          };

          // Ensure ride origin and drop-off coordinates are available
          if (rideOriginCoords && dropOffCoords) {
            // Calculate distance between ride origin and selected drop-off using Google Maps API
            const distance = await getDistanceFromGoogle(rideOriginCoords, dropOffCoords);

            // Set fare to 0.00 instead of calculating it now
            const fare = 0.00;

            // Update the Firestore document with drop-off details for the seat
            return firestore.collection('Ride').doc(rideId).update({
              [`seats.${seatKey}.dropOff`]: {
                place: location.place,
                latitude: dropOffCoords.latitude,
                longitude: dropOffCoords.longitude,
                distance: distance,
                fare: fare, // Set fare as 0.00
              }
            }).then(() => {
              // Fetch the ride data again after updating drop-off
              return firestore.collection('Ride').doc(rideId).get();
            }).then((doc) => {
              if (doc.exists) {
                const rideData = doc.data();
                const seats = rideData.seats; // Get the seats object
                let totalFare = 0.00; // Initialize total fare

                // Iterate over all seats to calculate total fare
                Object.keys(seats).forEach(async (key) => {
                  const seat = seats[key];
                  const seatDropOff = seat.dropOff;

                  if (seat && seatDropOff) {
                    // Add fare of seat with drop-off set (which is currently 0.00)
                    totalFare += seatDropOff.fare; // This will be 0.00 if not set
                  } else if (seat && !seatDropOff) {
                    // If no drop-off, use the default ride destination
                    const defaultDistance = await getDistanceFromGoogle(rideOriginCoords, defaultDropOff);
                    const defaultFare = 0.00; // Set default fare to 0.00
                    totalFare += defaultFare; // Ensure totalFare adds correctly
                  }
                });

                // Update total fare in Firestore document
                return firestore.collection('Ride').doc(rideId).update({
                  totalFare: totalFare
                });
              }
            });
          } else {
            throw new Error('Missing coordinates'); // Error if coordinates are missing
          }
        } else {
          throw new Error('Ride not found'); // Error if ride document doesn't exist
        }
      })
      .then(() => {
        // Success message after updating drop-off and total fare
        Alert.alert('Success', 'Drop-off updated and total fare recalculated!');
        fetchUserRides(); // Refresh the ride data on UI
      })
      .catch((error) => {
        // Handle errors during Firestore operations
        console.error('Error updating drop-off:', error);
        Alert.alert('Error', 'Failed to update drop-off.');
      });
  } else {
    // Alert if rideId or location data is invalid
    Alert.alert('Error', 'Invalid ride ID or location data.');
  }
};

  // fare matrix function
  // Function to get driving distance from Google Directions API
const getDistanceFromGoogle = async (origin, destination) => {
  try {
    // Make the API call to Google Directions API
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/directions/json?origin=${origin.latitude},${origin.longitude}&destination=${destination.latitude},${destination.longitude}&key=${GOOGLE_MAPS_KEY}`
    );
    
    const data = await response.json();

    // Check if any routes were found
    if (data.routes.length > 0) {
      const distanceInMeters = data.routes[0].legs[0].distance.value; // Get distance in meters
      const distanceInKm = distanceInMeters / 1000; // Convert meters to kilometers
      return distanceInKm; // Return the distance in kilometers
    } else {
      throw new Error('No routes found'); // Handle case where no routes are found
    }
  } catch (error) {
    return 0; // Return 0 if there's an error
  }
};

  // fare matrix function
  const calculateFare = async (rideOrigin, dropOff) => {
    const currentUser = auth.currentUser;
  
    if (!currentUser) {
      console.error('No user is currently authenticated');
      return 0; // Handle unauthenticated state
    }
  
    try {
      // Fetch the current user's document from Firestore using currentUser.uid
      const userDoc = await firestore.collection('users').doc(currentUser.uid).get();
  
      if (!userDoc.exists) {
        console.error('User document does not exist');
        return 0;
      }
  
      const userData = userDoc.data();
      const vehicleClass = userData.vehicleClass; // Get vehicle classification (SUV, Sedan, Motorcycle)

     // console.log('Vehicle Class:', vehicleClass);
  
      // Calculate the distance between ride origin and drop-off
      const distance = await getDistanceFromGoogle(rideOrigin, dropOff);
  
      // Set default fare values (for Sedan)
      let baseFare = 40;
      let farePerKm = 7.5;
  
      // Adjust fare for different vehicle classes
      if (vehicleClass === 'Suv') {
        baseFare = 50;
        farePerKm = 9;
      } else if (vehicleClass === 'Motorcycle') {
        baseFare = 25;
        farePerKm = 5;
      }
  
      // Calculate and return the total fare
      return baseFare + (farePerKm * distance);
    } catch (error) {
      console.error('Error calculating fare:', error);
      return 0;
    }
  };


const setDropOff = (rideId, seatKey) => {
  navigation.navigate('Dropoff', {
    rideId,
    seatKey,
    onPlaceSelect: (location) => handleDropoffSelect(rideId, seatKey, location),
  });
};

const confirmArrival = async (rideId, seatKey) => {
  try {
    // Update the seat's `isArrivedConfirmed` field to true
    await firestore.collection('Ride').doc(rideId).update({
      [`seats.${seatKey}.confirmArrived`]: true
    });
    
    Alert.alert('Success', 'Passenger arrival confirmed!');
    fetchUserRides();  // Refresh the ride data to update UI
  } catch (error) {
    console.error('Error confirming arrival:', error);
    Alert.alert('Error', 'Failed to confirm arrival.');
  }
};

const dropPassenger = async (rideId, seatKey) => {
  try {
    // Get the current date and time
    const dropOffTime = new Date(); // This gets the current date and time
    // Update the seat's `isArrivedConfirmed` field to true
    await firestore.collection('Ride').doc(rideId).update({
      [`seats.${seatKey}.isDrop`]: true,
      [`seats.${seatKey}.dropOffTime`]: dropOffTime // Adding drop-off time
    });
    
    Alert.alert('Success', 'Drop passenger!');
    fetchUserRides();  // Refresh the ride data to update UI
  } catch (error) {
    console.error('Error droping passenger:', error);
    Alert.alert('Error', 'Failed to confirm arrival.');
  }
};

const cancelSeat = async (rideId, seatKey, passengerId) => {
  try {
    // Fetch the ride document from Firestore
    const rideDoc = await firestore.collection('Ride').doc(rideId).get();

    if (rideDoc.exists) {
      const rideData = rideDoc.data(); // Extract ride data

      // Extract the driver's name from the ride document
      const driverName = `${rideData.driversFirstName} ${rideData.driversLastName}`;

      // Step 1: Update the seat's data in Firestore, setting it to false
      await firestore.collection('Ride').doc(rideId).update({
        [`seats.${seatKey}`]: false, // Update the specific seat
      });

      // Step 2: Check for the RideRequest document for the passenger
      const rideRequestSnapshot = await firestore.collection('RideRequests')
        .where('rideId', '==', rideId)
        .where('passengerId', '==', passengerId)
        .where('isAccepted', '==', true)
        .get();

      // Check if the accepted request exists
      if (!rideRequestSnapshot.empty) {
        // If an accepted request is found, update it
        const batch = firestore.batch();
        rideRequestSnapshot.docs.forEach(doc => {
          batch.update(doc.ref, {
            isAcceptedRequestFinished: true, // Mark request as finished
            isAcceptedRequestStarted: true, // Mark request as started
          });
        });
        await batch.commit(); // Commit the batch update

        // Notify the passenger about the seat cancellation
        await notifyPassengerForSeatCancelation(passengerId, {
          driverName, // Pass the driver's name
        });
       // Trigger a notification to the driver
       await createNotification(
          passengerId, // Driver ID (recipient)
          'Seat Cancelation', // Notification title
          `Your occupied seat has been canceled by ${driverName} - Driver.` // Notification message
        );

        Alert.alert('Success', 'Seat has been canceled successfully!'); // Alert only after successful update
      } else {
        // If no accepted request found, alert the user
        Alert.alert('Error', 'No accepted request found for this passenger.');
      }

      fetchUserRides(); // Refresh the ride data to update the UI
      setModalVisible2(false); // Close the modal after success
    } else {
      Alert.alert('Error', 'Ride not found.');
    }
  } catch (error) {
    console.error('Error canceling seat:', error);
    Alert.alert('Error', 'Failed to cancel the seat.');
  }
};


// cancel ride..
const cancelRide = async (rideId, cancelReason) => {
  try {
    // Step 1: Fetch the ride document from Firestore
    const rideDoc = await firestore.collection('Ride').doc(rideId).get();

    if (rideDoc.exists) {
      const rideData = rideDoc.data();

      // Check if the ride has been started or finished
      if (rideData.isStarted || rideData.isFinish) {
        Alert.alert('Error', 'You cannot cancel a ride that has already started or finished.');
        return; // Exit the function if the ride is already started or finished
      }

      // Step 2: Update the ride status to canceled
      await firestore.collection('Ride').doc(rideId).update({
        cancel: true, // Mark the ride as canceled
        cancelReason: cancelReason, // Reason for cancellation
        canceledAt: new Date(), // Record the cancellation time
        isFinish: true,
      });

      // Step 3: Update any related RideRequests for this ride
      const rideRequestSnapshot = await firestore.collection('RideRequests')
        .where('rideId', '==', rideId)
        .where('isAccepted', '==', true)
        .get();

      if (!rideRequestSnapshot.empty) {
        const batch = firestore.batch(); // Use a batch to update multiple documents

        rideRequestSnapshot.docs.forEach(doc => {
          batch.update(doc.ref, {
            isAcceptedRequestFinished: true, // Mark request as finished
          });
        });

        // Commit the batch update
        await batch.commit();

        // Notify each passenger about the ride cancellation
        rideRequestSnapshot.docs.forEach(doc => {
          const passengerData = doc.data(); // Get passenger data
          notifyPassengerForCancelation(passengerData.passengerId, {
            driverName: `${rideData.driversFirstName} ${rideData.driversLastName}`,
          });
          createNotification(
            passengerData.passengerId, // Driver ID (recipient)
            'Ride Cancelation', // Notification title
            `Your driver ${rideData.driversFirstName} ${rideData.driversLastName} has canceled the ride.` // Notification message
          );
        });
      }
      // Success message after cancellation
      Alert.alert('Canceled', 'The ride has been successfully canceled.');

      fetchUserRides(); // Re-fetch the data to update the UI
      setModalVisible(false); // Close the modal after success
    } else {
      Alert.alert('Error', 'Ride not found.');
    }
  } catch (error) {
    console.error('Error canceling ride:', error);
    Alert.alert('Error', 'Failed to cancel the ride.');
  }
};


const submitDriverReport = async (driverId, passengerId, rideId, reportReason) => {
  try {
    // Additional check for IDs and report reason
    if (!driverId || !passengerId || !rideId || !reportReason.trim()) {
      console.error('Missing required data for driver report submission:', { driverId, passengerId, rideId, reportReason });
      return;
    }

    await firestore.collection('Reports').add({
      driverId,
      passengerId,
      rideId, // Include rideId in the report submission
      reportReason,
      timestamp: new Date(), // Use Firestore server timestamp for consistency
    });

    console.log('Driver report submitted successfully');
  } catch (error) {
    console.error('Error submitting the driver report:', error);
  }
};

const handleReportSubmit = async () => {
  if (!reportReason.trim()) {
    alert('Please describe the issue.');
    return;
  }

  try {
    // Submit the report with passenger, driver IDs, ride ID, and report reason
    const currentUser = auth.currentUser;
    const driverId = currentUser.uid;
    const passengerId = selectedPassengerId; // Verify that this is properly set in the seat selection logic

    if (!passengerId) {
      console.error('No passenger found to report');
      return;
    }

    const rideId = selectedRideId; // Make sure you have access to the current ride ID

    // Add logging for verification
    console.log('Submitting report with details:', { driverId, passengerId, rideId, reportReason });

    await submitDriverReport(driverId, passengerId, rideId, reportReason);
    alert('Your report has been submitted.');
    setSelectedOption(null); // Close the report modal
  } catch (error) {
    console.error('Error submitting the report:', error);
  }
};


// Function to render the status message for a seat
const renderArrivalStatus = (seatData) => {
  if (seatData.isDrop) {
    return <Text style={styles.value}>Passenger has been dropped off.</Text>;
  } else if (seatData.confirmArrived) {
    return <Text style={styles.value}>Passenger has confirmed arrived.</Text>;
  } else if (seatData.initialArrived) {
    return <Text style={styles.value}>Passenger has arrived, please confirm.</Text>;
  } else {
    return <Text style={styles.value}>Waiting for passenger to arrive...</Text>;
  }
};

  useEffect(() => {
    fetchUserRides();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchUserRides(); // Fetch new data on refresh
    calculateFare();
  };

  // function to render seats
  const renderSeats = (Seats, vehicleClass, rideId, ) => {    
    return (
      <View>
        {Object.keys(Seats)
          .sort((a, b) => Number(a) - Number(b))  // Sort seat keys numerically
          .map((seatKey) => {
            const seatData = Seats[seatKey]; // Assuming seatData contains passengerId, firstName, lastName

            return (
              <View key={seatKey} style={styles.seatContainer}>
                <View style={styles.seatVal}>
                  <View style={{flexDirection: 'row', alignItems: 'center'}}>
                    <MaterialIcons name="airline-seat-recline-normal" size={24} color="black" />
                    <Text style={styles.seatText}>
                      {seatKey}
                    </Text>
                  </View>
                  <View style={{width: 90, alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between'}}>
                  <Text style={[
                    styles.seatStatusText,
                    seatData ? styles.occupiedText : styles.availableText // Conditional styling
                  ]}>
                    
                    {seatData ? 'Occupied' : 'Available'}
                  </Text>
                 
                  <TouchableOpacity onPress={() => {
                    setSelectedSeat(seatKey);  // Track which seat is being canceled
                    setSelectedRideId(rideId);  // Track the rideId
                    setSelectedPassengerId(seatData.passengerId);  // Track the rideId
                    setModalVisible2(true);     // Open the modal
                  }}> 
                    <Entypo name="dots-three-vertical" size={18} color="black" />
                  </TouchableOpacity>

                  </View>
                </View>
                {seatData && (
                  <View style={styles.seatVal2}>
                    <View style={{flexDirection: 'row', alignItems: 'center'}}>
                      <Text style={styles.pssLabel}>Status: </Text>
                      {renderArrivalStatus(seatData)}
                    </View>
                    <View style={{flexDirection: 'row', alignItems: 'center'}}>
                      <Text style={styles.pssLabel}>Name: </Text>
                      <Text style={styles.pssValue}>
                        {seatData.firstName} {seatData.lastName}
                      </Text>
                    </View>
                    <View style={{flexDirection: 'row', alignItems: 'center'}}>
                      <Text style={styles.pssLabel}>ID: </Text>
                      <Text style={styles.pssValue}>
                       {seatData.passengerId}
                      </Text>
                    </View>

                      <View>
                        <View style={{flexDirection: 'row', alignItems: 'center', width: '90%'}}>
                          <Text style={styles.pssLabel}>Drop off: </Text>
                          <Text style={styles.pssValue}>
                            {seatData.dropOff?.place || 'Not set'}
                          </Text>
                        </View>
                        <View style={{flexDirection: 'row', alignItems: 'center'}}>
                          <Text style={styles.pssLabel}>Distance: </Text>
                          <Text style={styles.pssValue}>
                           {seatData.dropOff?.distance !== undefined ? seatData.dropOff.distance.toFixed(2) : 'Not set'} km
                          </Text>
                        </View>
                        
                        <View style={{flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-end'}}>
                          <Text style={styles.pssLabel}>Fare:   </Text>
                          <FontAwesome6 name="peso-sign" size={20} color="black"/>
                          <Text style={[styles.pssValue, {fontSize: 20}]}>
                            {seatData.dropOff?.fare != null && !isNaN(seatData.dropOff.fare) 
                              ? seatData.dropOff.fare.toFixed(2) 
                              : 'Not set'
                            }
                          </Text>
                        </View>
                      </View>
                  </View>
                )}
                {/* Declare Drop off of each passenger */}
                {seatData.initialArrived && !seatData.confirmArrived && (
                  <TouchableOpacity
                    style={[styles.button, styles.arrivalButton]}  // Custom style for the button
                    onPress={() => confirmArrival(rideId, seatKey)}
                  >
                    <Text>Confirm Arrival</Text>
                  </TouchableOpacity>
                )}
                  {seatData && !seatData.dropOff && (
                    <TouchableOpacity
                    style={[styles.button, styles.dropoff]}
                    onPress={() => setDropOff(rideId, seatKey)} // Use the function we defined above
                  >
                    <Text>Set drop off</Text>
                  </TouchableOpacity>
                  )}
                  
                  {seatData && seatData.dropOff && !seatData.isDrop &&(
                    <TouchableOpacity
                      style={[styles.button, styles.dropoff]}
                      onPress={() => dropPassenger(rideId, seatKey)}
                    >
                      <Text>Drop Passenger</Text>
                    </TouchableOpacity>
                  )}
                </View>
            );
          })}
      </View>
    );
  };

  if (loading) {
    return (
      <Loading/>
    );
  }

  return (
    <View style={styles.container}>
      <Header/>
      <FlatList
        style={{ padding: 2 }}
        data={userRides}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.rideItem}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <Text style={{ fontFamily: 'Poppins-Medium', fontSize: 18 }}>Your Current Trip</Text>
              
              <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '30%'}}>
                <Text style={styles.rideText}>
                  {item?.isFinish ? 'Completed' : 'Ongoing'}
                </Text>
                <TouchableOpacity onPress={() => {
                  setSelectedRideId(item.id);  // Make sure item.id has a valid ride ID
                    setModalVisible(true);     // Open the modal
                  }}> 
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
              <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <Entypo name="location-pin" size={25} color="red" />
                <Text style={styles.label}>Destination:</Text>
              </View>
              <View style={{ marginLeft: 15 }}>
                <Text style={styles.value}> {item?.rideDestinationPlace}</Text>
                <Text style={{ fontFamily: 'Poppins-Regular', color: 'grey' }}>
                  {item?.rideDestination?.latitude?.toFixed(6) || 'N/A'}, {item?.rideDestination?.longitude?.toFixed(6) || 'N/A'}
                </Text>
              </View>
            </View>

            <View style={{ marginBottom: 10, flexDirection: 'row', justifyContent: 'space-between' }}> 
              <View>
                <Text style={styles.label}>Distance:</Text>
                <View style={{ marginLeft: 15 }}>
                  <Text style={styles.value}> {item?.distance?.toFixed(2)} km</Text>
                </View>
              </View>
              <View>
                <Text style={styles.label}>Total Fare:</Text>
                <View style={{ marginLeft: 15, flexDirection: 'row', alignItems: 'center', }}>
                  <FontAwesome6 name="peso-sign" size={20} color="black" />
                  <Text style={[styles.value, {fontSize: 20}]}> {item?.totalFare?.toFixed(2)} </Text>
                </View>
              </View>
            </View>
            

            <View style={{ marginBottom: 10, justifyContent: 'center' }}>
              <Text style={styles.label}>Passenegr Seats:</Text>
              {item?.seats ? renderSeats(item.seats, item.vehicleClass, item.id) : <View>No seat information available</View>}
            </View>

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 10,}}>
              {!item.startTime && (
                <TouchableOpacity
                  style={styles.button}
                  onPress={() => startRide(item.id)}
                >
                  <Text>Start Ride</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity 
                style={styles.button} 
                onPress={() => finishRide(item.id)}>
                <Text>Finish Ride</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />
      <SwipeableModal3
        isVisible={isModalVisible}
        onSwipeComplete={closeModal}
        onClose={closeModal}
      >
        <Text style={[styles.value, {marginTop: 10}]}>Are you sure to cancel this ride? </Text>   
        <TextInput
          style={[styles.input, { marginTop: 10 }]}
          placeholder='State your reason here..'
          value={cancelReason}
          onChangeText={(text) => setCancelReason(text)} // Capture cancellation reason
        />
        <View style={{width: '90%', flexDirection: 'row', justifyContent: 'space-between', marginTop: 20, alignItems: 'center'}}>
            <TouchableOpacity style={styles.buttonP} onPress={closeModal}>
              <Text>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.button} 
              onPress={() => cancelRide(selectedRideId, cancelReason)}>
              <Text>Proceed</Text>
            </TouchableOpacity>

          </View>     
      </SwipeableModal3>

      <SwipeableModal4
        isVisible={isModalVisible2}
        onSwipeComplete={closeModal}
        onClose={closeModal}
      >
        {!selectedOption && ( // Show options only if no option is selected
        <>
          <View style={{ width: '95%', marginTop: 20, alignItems: 'center' }}>
            <TouchableOpacity style={[styles.button, {width: '65%'}]} onPress={() => setSelectedOption('rate')}>
              <Text style={{fontFamily: 'Poppins-Medium', color: 'white'}}>Rate Passenger</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.button, {marginTop: 5, width: '65%'}]} onPress={() => setSelectedOption('report')}>
              <Text style={{color: 'white', fontFamily: 'Poppins-Medium'}}>Report Passenger</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.button, {marginTop: 5, width: '65%'}]} onPress={() => setSelectedOption('cancel')}>
              <Text style={{color: 'red', fontFamily: 'Poppins-Medium'}}>Cancel Seat</Text>
            </TouchableOpacity>
          </View>
        </>
      )}

      {selectedOption === 'rate' && ( // Show cancel content if 'Cancel Ride' is selected
        <>
          <Text style={{fontSize: 18, fontFamily: 'Poppins-Regular'}}>Rate Passenger</Text>
          <Rating currentRating={currentRating} onRatingChange={(rating) => setCurrentRating(rating)} />
          
          <View style={{ width: '95%', flexDirection: 'row', justifyContent: 'space-between', marginTop:1, alignItems: 'center' }}>
            <TouchableOpacity style={styles.buttonP} onPress={() => setSelectedOption(null)}>
              <Text>Back</Text>
            </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={() => handleRatingSubmit(selectedPassengerId, currentRating)}>
            <Text style={styles.buttonText}>Submit Rating</Text>
          </TouchableOpacity>
          </View>
        </>
      )}

      {selectedOption === 'cancel' && ( // Show report content if 'Report Issue' is selected
        <>
          <Text style={styles.value}>You want to cancel this seat? the seat will be turn into null</Text>
          <View style={{width: '90%', flexDirection: 'row', justifyContent: 'space-between', marginTop: 20, alignItems: 'center'}}>
            <TouchableOpacity style={styles.buttonP} onPress={() => setSelectedOption(null)}>
              <Text>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={() => cancelSeat(selectedRideId, selectedSeat, selectedPassengerId)} >
              <Text>Proceed</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
      {selectedOption === 'report' && ( // Show report content if 'Report Issue' is selected
        <>
          <Text style={styles.value}>Report an issue with the passenger:</Text>
         <TextInput
            style={styles.input}
            placeholder='Describe the issue..'
            value={reportReason} // Bind the report reason to state
            onChangeText={setReportReason}  // Capture the report reason
          />
          <View style={{ width: '95%', flexDirection: 'row', justifyContent: 'space-between', marginTop: 20, alignItems: 'center' }}>
            <TouchableOpacity style={styles.buttonP} onPress={() => setSelectedOption(null)}>
              <Text>Back</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.button, { width: '45%' }]} 
              onPress={handleReportSubmit}  // Call handleReportSubmit function
            >
              <Text>Submit</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
      </SwipeableModal4>
    </View>
  );
};


export default DRTrips;


