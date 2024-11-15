import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, TextInput, Alert, FlatList, Image, Animated, ActivityIndicator, RefreshControl } from 'react-native';
import { styles } from '../src/homestyle'
import { auth, firestore, firebase } from '../../Config';
import { notifyDriverOfRideRequest, notifyPassengerOfRequestAcceptance, } from '../../service/Notifications'; // Update this path based on where your functions are located
import imagesPath from '../../src/imagesPath';
import { createNotification } from '../../service/createNotification';
import Loading from '../../src/loading';

import { Entypo, MaterialCommunityIcons, Ionicons, MaterialIcons, Feather, } from '@expo/vector-icons';
import AntDesign from '@expo/vector-icons/AntDesign';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';


const RideListing = ({ navigation, route}) => {
    const { currentLoc } = route.params; // Retrieve currentLoc passed from PSHome
    const [userRides, setUserRides] = useState([]);
    const [selectedRideLocation, setSelectedRideLocation] = useState(null);
    const [expandedStates, setExpandedStates] = useState({});
    const [timeLeft, setTimeLeft] = useState(300); // 300 seconds = 5 minutes
    const [rideWithTimer, setRideWithTimer] = useState(null); // Track the ride with a visible timer
    const [loadingStates, setLoadingStates] = useState({}); // Track loading states for each ridex
    const [rideRequestStatus, setRideRequestStatus] = useState({}); // Track if a ride is accepted or not
    const [loading, setLoading] = useState(true); // To handle loading state
    const [searchQuery, setSearchQuery] = useState(''); // State to track search input


    const [refreshing, setRefreshing] = useState(false); // State for refreshing

    const fetchRides = async () => {
      try {
        const unsubscribe = firestore
          .collection('Ride')
          .where('isStarted', '==', false)
          .where('isFinish', '==', false)
          .where('cancel', '==', false)
          .onSnapshot(
            (querySnapshot) => {
              const fetchedRides = [];
              querySnapshot.forEach((doc) => {
                const { rideOrigin, rideDestinationPlace, ...rideDataWithoutUserId } = doc.data();
                
                // Calculate distance between user's location and ride's start location
                const distance = calculateDistance(currentLoc, rideOrigin);
    
                // Filter by destination place if search query is provided
                const matchesSearch = searchQuery
                  ? rideDestinationPlace.toLowerCase().includes(searchQuery.toLowerCase())
                  : true;
    
                // Only include rides within 1 kilometer and matching the search query
                if (distance <= 1 && matchesSearch) {
                  fetchedRides.push({
                    id: doc.id,
                    rideDestinationPlace,  // Include the destination place here
                    ...rideDataWithoutUserId
                  });
                }
              });
    
              setUserRides(fetchedRides);
            },
            (error) => {
              console.error('Error fetching rides:', error);
            }
          );
    
        return unsubscribe;
      } catch (error) {
        console.error('Error during fetchRides:', error);
      } finally {
        setRefreshing(false);
        setLoading(false);
      }
    };
    
      // calculate distance currentLoc to rideOrigin
      const toRadians = (degrees) => degrees * (Math.PI / 180);
      // calculate distance currentLoc to rideOrigin
      const calculateDistance = (loc1, loc2) => {
        const R = 6371; // Earth's radius in kilometers

        const lat1 = loc1.latitude;
        const lon1 = loc1.longitude;
        const lat2 = loc2.latitude;
        const lon2 = loc2.longitude;

        const dLat = toRadians(lat2 - lat1);
        const dLon = toRadians(lon2 - lon1);

        const a = 
          Math.sin(dLat / 2) * Math.sin(dLat / 2) +
          Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
          Math.sin(dLon / 2) * Math.sin(dLon / 2);

        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        const distance = R * c; // Distance in kilometers

        return distance;
      };
  
      // get ride location
      const getLocation = async (ride) => {
        const currentUser = auth.currentUser;
      
        if (!currentUser) {
          Alert.alert('Error', 'User not logged in!');
          return;
        }
      
        try {
          // Query the RideRequests collection to check if the user has an accepted and finished ride request
          const rideRequestSnapshot = await firestore
            .collection('RideRequests')
            .where('passengerId', '==', currentUser.uid)
            .where('rideId', '==', ride.id)
            .limit(1)
            .get();
      
          if (!rideRequestSnapshot.empty) {
            const rideRequest = rideRequestSnapshot.docs[0].data();
            const { rideOrigin, rideOriginPlace } = ride;
      
            if (rideOrigin) {
              // If the ride request is accepted and finished, navigate to RideMapScreen and pass location data
              navigation.navigate('Feed', {
                rideLocation: {
                  latitude: rideOrigin.latitude,
                  longitude: rideOrigin.longitude,
                  rideOriginPlace, // Optional: Include place name if needed
                },
                vehicleClass: ride.vehicleClass,
              });
            } else {
              Alert.alert('Error', 'Location data not available');
            }
          } else {
            Alert.alert('Error', 'You can only track the ride location once your ride request is accepted and completed.');
          }
        } catch (error) {
          console.error('Error checking ride request status:', error);
          Alert.alert('Error', 'Failed to check ride request status.');
        }
      };

       // Fetch ride request status for each ride
    // Fetch ride request status for each ride
    const fetchRideRequestStatus = async (rideId) => {
      const currentUser = auth.currentUser;
      if (!currentUser) return;
  
      // Check if rideId is valid before querying
      if (!rideId) {
          // console.error('Ride ID is undefined');
          return;
      }
  
      try {
          const requestSnapshot = await firestore
              .collection('RideRequests')
              .where('passengerId', '==', currentUser.uid)
              .where('rideId', '==', rideId)
              .limit(1)
              .get();
  
          if (!requestSnapshot.empty) {
              const requestData = requestSnapshot.docs[0].data();
              setRideRequestStatus((prev) => ({
                  ...prev,
                  [rideId]: requestData.isAccepted,
              }));
          }
      } catch (error) {
          console.error('Error fetching ride request status:', error);
      }
  };

      
        const getSeatCount = (vehicleClass) => {
            switch (vehicleClass) {
              case 'Suv':
                return '6 Seater';
              case 'Motorcycle':
                return '2 Seater';
              case 'Sedan':
              default:
                return '4 Seater';
            }
          };
          
          // Function to calculate available seats
    const getAvailableSeats = (seats) => {
          const seatKeys = Object.keys(seats);
          const availableSeats = seatKeys.filter(key => seats[key] === false).length;
          return availableSeats;
    };
        
     // ride request function
     const requestRide = async (Ride) => {
        const currentUser = auth.currentUser;
      
        if (!currentUser) {
          Alert.alert('Error', 'User not logged in!');
          return;
        }
      
        // Set loading state for the specific ride
        setLoadingStates((prev) => ({ ...prev, [Ride.id]: true }));
      
        try {
          // Fetch the passenger's details
          const userDoc = await firestore.collection('users').doc(currentUser.uid).get();
      
          if (!userDoc.exists) {
            throw new Error('User details not found');
          }
      
          const userData = userDoc.data();
          const passengerFirstName = userData.firstName;
          const passengerLastName = userData.lastName;
          const passengerProfile = userData.userProfile;
      
          // Check if Ride.driverId is defined  
          if (!Ride.driverId) {
            throw new Error('Driver ID is undefined');
          }
      
          // Check for any existing ride requests that haven't been rejected or accepted yet
          // Check for any existing ride requests that haven't been rejected or accepted yet
           // yudipota amo ni ang ga fileter or ga confirm nga wala sng recent request and either isRejected: true or isAccepted: true...
           // can kun biskan isa lang ang ma break sa duwa ni ka condition ... ang passenger nd ka book ..
           // so which means dapat ma meet ang duwa ka condition .. para maka book liwat ang passnger..  .
            // Check for any existing ride requests that are pending
          const pendingRequest = await firestore.collection('RideRequests')
            .where('passengerId', '==', currentUser.uid)
            .where('isAccepted', '==', false)
            .where('isRejected', '==', false)
            .get();
      
          // Check for any accepted requests
          const acceptedRequests = await firestore.collection('RideRequests')
            .where('passengerId', '==', currentUser.uid)
            .where('isAccepted', '==', true)
            .get();
      
          // Check if there are any accepted requests
          const hasAcceptedRequest = !acceptedRequests.empty;
      
          let mostRecentAcceptedRequest = null;
          if (!acceptedRequests.empty) {
            mostRecentAcceptedRequest = acceptedRequests.docs.reduce((latest, doc) => {
              const data = doc.data();
              return !latest || data.createdAt > latest.createdAt ? data : latest;
            }, null);
          }
      
          // If there's a pending request, prevent booking another ride
          if (!pendingRequest.empty) {
            Alert.alert('Error', 'You have a pending ride request. Wait for it to complete before booking another.');
            return;
          }
      
          // Check if there's an accepted request that hasn't been marked as finished
          if (hasAcceptedRequest && mostRecentAcceptedRequest && !mostRecentAcceptedRequest.isAcceptedRequestFinished) {
            Alert.alert('Error', 'Your previous accepted ride is not finished. You cannot book another ride until it\'s completed.');
            return;
          }
      
          // If no pending or unfinished accepted requests, create a new ride request
          const requestData = {
            passengerId: currentUser.uid,
            firstName: passengerFirstName,
            lastName: passengerLastName,
            passengerProfile: passengerProfile,
            rideId: Ride.id,
            driverId: Ride.driverId,
            isAccepted: false,
            isRejected: false,
            hidden: false,
            createdAt: new Date(),
            isAcceptedRequestFinished: false, // Initially set to false
            isAcceptedRequestStarted: false, // Initially set to false
            currentLocation: currentLoc, // Save the current location here
          };
      
          const newRequestRef = await firestore.collection('RideRequests').add(requestData);
          Alert.alert('Success', 'Ride request sent to the driver!');

          await notifyDriverOfRideRequest(requestData.driverId, requestData);
           // Trigger a notification to the driver
          await createNotification(
            Ride.driverId, // Driver ID (recipient)
            'Ride Request', // Notification title
            `You have ride request from ${passengerFirstName} ${passengerLastName}.` // Notification message
          );
          
          setRideWithTimer(Ride.id); // Set the ride with the timer visible
          setTimeLeft(300);
          startTimer(newRequestRef.id);
        } catch (error) {
          console.error('Error requesting ride:', error);
          Alert.alert('Error', `Failed to request ride. Error: ${error.message}`);
        } finally {
          setLoadingStates((prev) => ({ ...prev, [Ride.id]: false }));
        }
      };
      

       // riderequest timer 
       const startTimer = (requestId) => {
         clearInterval(timerRef.current);
     
         setTimeLeft(300);
     
         const timerInterval = setInterval(() => {
           setTimeLeft((prevTime) => {
             if (prevTime === 1) {
               clearInterval(timerInterval);
               handleRequestTimeout(requestId);
               return 0;
             }
             return prevTime - 1;
           });
         }, 1000);
     
         timerRef.current = timerInterval;
       };
       
       // Ref to store the timer
       const timerRef = useRef(null);
       
       // Clear the timer when the component unmounts
       useEffect(() => {
         return () => {
           if (timerRef.current) {
             clearInterval(timerRef.current);
           }
         };
       }, []);
     
     // Handle ride request timeout
     //if request reach 5 minutes auto reject..
     const handleRequestTimeout = async (requestId) => {
       try {
         // Update the Firestore document to mark the request as rejected
         await firestore.collection('RideRequests').doc(requestId).update({
           isRejected: true
         });
         Alert.alert('Ride request expired', 'Your ride request has expired because the driver did not accept in time.');
       } catch (error) {
         console.error('Error updating ride request:', error);
       }
     };
  
           // Auto-refresh every few seconds using setInterval
           useEffect(() => {
            // Fetch initial data
            fetchRides();
            fetchRideRequestStatus();
        
             // Set up auto-refresh interval (e.g., every 3 seconds)
            const intervalId = setInterval(() => {
             // console.log('Auto-refreshing rides');
              fetchRides(); // Fetch new data every interval
              userRides.forEach(ride => {
                fetchRideRequestStatus(ride.id); // Fetch ride request status for each ride
            });
            }, 60000); // Refresh every 3 seconds
        
            // Cleanup interval when the component unmounts
            return () => clearInterval(intervalId);
          }, []);

          const onRefresh = () => {
            setRefreshing(true);
            fetchRides(); // Fetch new data on refresh
          };   
          

    // Expand Flatlist Item (ride listing)
    const toggleExpand = (itemId) => {
        setExpandedStates((prevState) => {
        const newState = { ...prevState };
        const isExpanded = newState[itemId]?.expanded || false;
        newState[itemId] = {
            expanded: !isExpanded,
            height: new Animated.Value(isExpanded ? 90 :400),
        };

        Animated.timing(newState[itemId].height, {
            toValue: isExpanded ? 90 : 400,
            useNativeDriver: false,
        }).start();

        return newState;
        });
    };


    const renderRideItem = ({ item }) => {
        const { id } = item;
        const expandedState = expandedStates[id] || { expanded: false, height: new Animated.Value(90) };
        const isLoading = loadingStates[id] || false;
        const isAccepted = rideRequestStatus[id]; // Check if the ride is accepted
        // Convert seconds into minutes and seconds for display
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
    
        // Progress calculation
        const progress = (timeLeft / 300) * 100; // Percentage of time left
        return (
          <Animated.View style={[styles.rideItem, { height: expandedState.height }]}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%',}}>
              <View style={{ alignItems: 'center',}}>
                <Image
                  style={{ width: 55, height: 55, marginBottom: 10 }}
                  source={
                    item.vehicleClass === 'Suv' ? imagesPath.suvImg :
                    item.vehicleClass === 'Motorcycle' ? imagesPath.motorcycleImg :
                    item.vehicleClass === 'Sedan' ? imagesPath.sedanImg : 
                    imagesPath.sedanImg
                  }
                />
    
                
              </View>
              <View style={{ marginLeft: 7, width: '65%' ,}}>
                <Text 
                  style={{ fontFamily: 'Poppins-Medium', fontSize: 14 }} 
                  numberOfLines={2} 
                  ellipsizeMode="tail"
                >
                  To - {item?.rideDestinationPlace}
                </Text>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <MaterialIcons name="airline-seat-recline-normal" size={20} color="grey" />
                  <Text style={{ color: 'grey', fontSize: 12, fontFamily: 'Poppins-Regular' }}>
                    {getAvailableSeats(item.seats)} Seat Available
                  </Text>
                </View>
                <Text 
                  style={[styles.valueTxt, {marginTop: 15}]}
                  numberOfLines={2} 
                  ellipsizeMode="tail"
                >
                  Pickup - {item?.rideOriginPlace}
                </Text>
                <Text style={styles.valueTxt}>
                  Description - ({item?.rideLocDes})
                </Text>
                <Text style={styles.valueTxt}>
                  Departure Time - {item?.departureTime}
                </Text>
              </View>
    
              <View style={{ width: '20%', alignItems: 'center', justifyContent: 'space-evenly', height: 50, right: 10}}>
                <View style={{flexDirection: 'row'}}>
                  <FontAwesome6 name="peso-sign" size={20} color="black" />
                  <Text style={{ fontFamily: 'Poppins-Bold', fontSize: 16 }}> {item?.initialFare.toFixed(2)}</Text>
                </View>
                <TouchableOpacity 
                  onPress={() => toggleExpand(id)}
                >
                  
                  {expandedState.expanded ? <AntDesign name="down" size={24} color="#0CC0DF" /> : <AntDesign name="up" size={24} color="#0CC0DF" />}
                </TouchableOpacity>
              </View>
            </View>
            
            <View style={{width: '100%', borderTopColor: '#0CC0DF', borderTopWidth: 2, marginTop: 10, marginBottom: 5,}}>
              <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <Image
                  source={{ uri: item?.driversProfile }}
                  style={{ width: 80, height: 80, borderRadius: 100, marginTop: 5 }}
                />
                <View style={{width: '40%', height: 'auto',marginTop: 5, marginLeft: 2,}}>
                  <Text style={[styles.valueTxt1, {fontSize: 14}]}>{item?.driversFirstName} {item?.driversLastName}</Text>
                  <View style={{width: 50, flexDirection: 'row', alignItems: 'center',}}>
                    <AntDesign name="star" size={20} color="#FFE234" />
                    <Text style={styles.valueTxt1}>{item?.rating?.toFixed(1)}</Text>
                  </View>
                  <Text style={styles.valueTxt1}>No. {item?.driversMobileNo}</Text>
                </View>
                <View style={{borderRightWidth: 2, height: 30,borderRightColor: 'grey', }}></View>
                <View style={{width: '40%', alignItems: 'left', marginLeft: 15}}>
                  <Text style={styles.valueTxt1}>{item?.vehicleClass}</Text>
                  <Text style={styles.valueTxt1}>({getSeatCount(item.vehicleClass)}) </Text>
                  <Text style={styles.valueTxt1}>{item?.vehicleColor}</Text>
                </View>
              </View>      
              
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginTop: 5, marginBottom: 10}}>
                {isAccepted ? (
                  <View style={styles.button200}>
                    <Text style={[styles.buttonText,{color: '#0CC0DF'}]}>Accepted</Text>
                  </View>
                ) : isLoading ? (
                  <TouchableOpacity
                   style={styles.button1}
                  >
                    <ActivityIndicator size="small" color="white" />
                 </TouchableOpacity>
                ) : (
                  rideWithTimer === id && timeLeft > 0 ? (
                    <TouchableOpacity style={styles.progressBarContainer}>
                      <Text style={styles.timerText}>
                        {Math.floor(timeLeft / 60)}:
                        {timeLeft % 60 < 10 ? `0${timeLeft % 60}` : timeLeft % 60}
                      </Text>
                      <View style={[styles.progressBar, { width: `${progress}%`, position: 'absolute', top: 0, left: 0, height: '100%' }]} />
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity
                      style={styles.button1}
                      onPress={() => requestRide(item)}
                    >
                      <Text style={styles.buttonText}>Book Ride</Text>
                    </TouchableOpacity>
                  )
                )}
              
                <TouchableOpacity
                  style={styles.button1}
                  onPress={() => getLocation(item)}
                >
                  <Text style={styles.buttonText}>Get location</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Animated.View>
        );
      };

    if (loading) {
      return (
        <Loading/>
      );
    }
      
    return (
        <View style={styles.container}>
            <View style={{backgroundColor: '#0CC0DF', width: '100%', height: 50, alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between'}}>
                <TouchableOpacity style={{ marginLeft: 5 }} onPress={() => navigation.navigate('Feed')}>
                  <Ionicons name="arrow-back-circle" size={40} color="white" />
                </TouchableOpacity>

                <Text style={{fontFamily: 'Poppins-Medium', fontSize: 18, marginRight: 10, color: 'white'}}>Available Rides</Text>
            </View>
            <View style={{width: '95%', height: 50, alignSelf: 'center', alignItems: 'center', justifyContent: 'space-between', flexDirection: 'row'}}>
                <TextInput 
                  style={[styles.input, {width: '70%'}]}
                  placeholder='Search ride destination'
                  value={searchQuery}
                  onChangeText={(text) => setSearchQuery(text)} // Update search query
                />
                <TouchableOpacity 
                  style={[styles.button6, {height: 40, width: 'auto', paddingHorizontal: 10}]} 
                  onPress={fetchRides} // Re-fetch rides when search is triggered
                >
                  <Text style={styles.buttonText}>Search</Text>
                <Entypo name="direction" size={20 } color="white" />
                </TouchableOpacity> 
            </View>
            <View style={{width: '100%', height: '87%',padding: 2, }}>
            <FlatList
                style={{width: '100%', alignSelf: 'center', height: '100%',}}
                data={userRides}
                keyExtractor={(item) => item.id}
                renderItem={renderRideItem}      
                refreshControl={
                    <RefreshControl
                      refreshing={refreshing}
                      onRefresh={onRefresh} // Trigger refresh when pulled down
                      colors={['#0CC0DF']} // Optional: Customize the color of the refresh indicator
                    />
                  }
            />
            </View>
        </View>
    );
};


export default RideListing;
