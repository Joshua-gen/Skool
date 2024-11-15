import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, TextInput, Alert, FlatList, Image,} from 'react-native';
import { auth, firestore, firebase } from '../Config';
import { styles } from './src/homestyle'
import MapView, { Marker, Callout } from 'react-native-maps';
import * as Location from 'expo-location';
import MapViewDirections from 'react-native-maps-directions';
import { GOOGLE_MAPS_KEY } from '@env';
import SwipeableModal from '../src/SwipeableModal';
import CreateRide from './componets/CreateRide';
import RideRequestList from './componets/RideRequest';
import Loading from '../src/loading';

import { Entypo, MaterialCommunityIcons, Ionicons, MaterialIcons, FontAwesome } from '@expo/vector-icons';
import { fetchVehicleClass, getCarImage, getSeatConfiguration } from './src/VehicleClass'; // Import the functions


import imagesPath from '../src/imagesPath';

const DRHome = ({ navigation }) => {
  const mapRef = useRef(null); // Create ref for MapView component
  const [isModalVisible, setModalVisible] = useState(false);
  const [rideLocDes, setrideLocDes] = useState('');
  const [origin, setOrigin] = useState(null);
  const [destination, setDestination] = useState(null);
  const [originAddress, setOriginAddress] = useState('Fetching...');
  const [rideDestinationPlace, setRideDestinationPlace] = useState(null);
  const [ongoingRideId, setOngoingRideId] = useState(null); 
  const [hasPendingRide, setHasPendingRide] = useState(false);
  const [carLocation, setCarLocation] = useState(null); // New state for car's live location
  const [locationSubscription, setLocationSubscription] = useState(null); // For location updates
  const [carHeading, setCarHeading] = useState(0); // New state for car's heading
  const [distance, setDistance] = useState(null); // New state for distance
  const [vehicleClass, setVehicleClass] = useState(null); // State to store vehicle type
  const [fare, setFare] = useState(null);
  const [showAddHint, setShowAddHint] = useState(true);
  const [departureTime, setDepartureTime] = useState(''); // New state for
  const [rideRequests, setRideRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isTracking, setIsTracking] = useState(false);
  const [passenger, setPassenger] = useState(false);
  // Or however you're fetching or setting `passengerId`
  const [isVerified, setIsVerified] = useState(false);

  const openModal = () => {
    setShowAddHint(false); // Hide the description
    setModalVisible(true); // Open the modal
  };
  const closeModal = () => setModalVisible(false);

  const userLocation = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      console.log('Permission to access location was denied');
      return;
    }
  
     // Fetch the user's current position using high accuracy settings
     let location = await Location.getCurrentPositionAsync({
      enableHighAccuracy: true, // Enable high accuracy for better location
      timeInterval: 5000, // Fetch the location every 5 seconds (optional)
      distanceInterval: 10, // Trigger updates only if the user moves 10 meters (optional)
    });
    const { latitude, longitude } = location.coords;

    setOrigin({
      latitude,
      longitude,
      latitudeDelta: 0.005, // Set the zoom level for latitude (smaller means more zoomed in)
      longitudeDelta: 0.005, // Set the zoom level for longitude
    });

    setCarLocation({
      latitude,
      longitude,
      latitudeDelta: 0.005, // Set the zoom level for latitude (smaller means more zoomed in)
      longitudeDelta: 0.005, // Set the zoom level for longitude
    });

    const address = await Location.reverseGeocodeAsync({ latitude, longitude });
    if (address.length > 0) {
      setOriginAddress(`${address[0].street}, ${address[0].city}, ${address[0].region}`);
    } else {
      setOriginAddress('Address not found');
    }

    // Check if the map reference is available
    if (mapRef.current) {
      // Animate the map view to the user's current location
      mapRef.current.animateToRegion({
        latitude, // Center the map on the current latitude
        longitude, // Center the map on the current longitude
        latitudeDelta: 0.005, // Set the zoom level for latitude (smaller means more zoomed in)
        longitudeDelta: 0.005, // Set the zoom level for longitude
      }, 1000); // Animate the transition over 1000 milliseconds (1 second)
    }
  };


  const startLocationTracking = async () => {
    let previousLocation = null;
  
    const subscription = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.High,
        timeInterval: 1000,
        distanceInterval: 1,
      },
      (location) => {
        const { latitude, longitude } = location.coords;
  
        if (previousLocation) {
          const heading = getHeading(previousLocation, { latitude, longitude });
          setCarHeading(heading);
        }
  
        previousLocation = { latitude, longitude };
  
        setCarLocation({
          latitude,
          longitude,
          latitudeDelta: 0.0022,
          longitudeDelta: 0.0021,
        });
  
        if (mapRef.current) {
          mapRef.current.animateToRegion({
            latitude,
            longitude,
            latitudeDelta: 0.0022,
            longitudeDelta: 0.0021,
          }, 1000);
        }
  
        {/*if (ongoingRideId) {
          firestore.collection('Ride').doc(ongoingRideId).update({
            carLocation: {
              latitude,
              longitude,
            },
          });
        }*/}
      }
    );
  
    if (subscription) {
      setLocationSubscription(subscription); // Save the subscription if valid
    } else {
      console.error('Failed to start location tracking.');
    }
  };
    
  const stopLocationTracking = () => {
    if (locationSubscription && typeof locationSubscription.remove === 'function') {
      locationSubscription.remove();
      setLocationSubscription(null);
    }
  };

  // toggle button fot on of realtime location tracking   
const toggleLocationTracking = () => {
  if (isTracking) {
    stopLocationTracking();
  } else {
    startLocationTracking();
  }
  setIsTracking(!isTracking);
};

// Function to manually re-center the map on the car's location
const forceCenterMap = () => {
  if (mapRef.current && carLocation) {
    mapRef.current.animateToRegion({
      latitude: carLocation.latitude,
      longitude: carLocation.longitude,
      latitudeDelta: 0.0022,
      longitudeDelta: 0.0021,
    }, 1000); // Optional animation duration
  }
};

useEffect(() => {
  if (isTracking) {
    const intervalId = setInterval(() => {
      forceCenterMap();
    }, 20000);
    return () => clearInterval(intervalId);
  }
}, [carLocation, isTracking]); // Ensure cleanup

// Set an interval to re-center the map every few seconds
useEffect(() => {
  const intervalId = setInterval(() => {
    forceCenterMap(); // Re-center the map every 5 seconds
  }, 20000); // Adjust the interval time (e.g., 5 seconds)

  // Cleanup the interval when the component unmounts
  return () => clearInterval(intervalId);
}, [carLocation]); // Dependency on carLocation
  
  
  const loadOngoingRide = async () => {
    const currentUser = auth.currentUser;
    if (!currentUser) return;
  
    try {
      const rideQuery = await firestore
      .collection('Ride')
      .where('driverId', '==', auth.currentUser.uid)
      .where('isFinish', '==', false) // Only check if ride is not finished
      .where('cancel', '==', false) // Only check if ride is not finished
      .limit(1)
      .get();
  
      if (!rideQuery.empty) {
        const rideDoc = rideQuery.docs[0];
        const rideData = rideDoc.data();
  
       //r console.log('Ongoing ride found:', rideData);
  
        setOngoingRideId(rideDoc.id);
        setOrigin(rideData.rideOrigin);
        setDestination(rideData.rideDestination);
        setOriginAddress(rideData.rideOriginPlace);
        setRideDestinationPlace(rideData.rideDestinationPlace);
        setHasPendingRide(true);
        setCarLocation(rideData.carLocation);
      } else {
        setHasPendingRide(false);
        console.log('No ongoing ride found.');
      }
    } catch (error) {
      console.error('Error loading ongoing ride: ', error);
    }
      finally {
        setLoading(false);
      }
  };
  
 // Function to check for pending rides
const checkForPendingRides = async () => {
  try {
    const currentUser = auth.currentUser;
    
    if (!currentUser) return false; // User not logged in

    const ridesSnapshot = await firestore.collection('Ride')
      .where('driverId', '==', currentUser.uid)
      .where('isFinish', '==', false)
      .get();

    return !ridesSnapshot.empty; // Returns true if there are any pending rides
  } catch (error) {
    console.error('Error checking for pending rides:', error);
    return false; // Default to no pending rides on error
  }
};

 // create ride 
const handleCreateRide = async () => {
  setLoading(true);
  // Check for pending rides
  const hasPendingRide = await checkForPendingRides();
  if (hasPendingRide) {
    setLoading(false);
    Alert.alert(
      'Pending Ride',
      'You have a pending ride. Please finish or cancel it before creating a new one.'
    );
    return;
  }

  if (!origin || !destination) {
    setLoading(false);
    Alert.alert(
      'Missing Information',
      'Please make sure both your current location and destination are set before creating the ride.'
    );
    return;
  }

  // Check if fare and distance are set
  if (fare === null || fare === undefined || distance === null || distance === undefined) {
    setLoading(false);
    Alert.alert(
      'Missing Fare or Distance',
      'Please ensure that the fare and distance are calculated before creating the ride.'
    );
    return;
  }

  try {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      console.error('User not logged in!');
      return;
    }

    // Fetch user details
    const userDoc = await firestore.collection('users').doc(currentUser.uid).get();
    const userData = userDoc.data();

    // Check if the driver is restricted
    if (userData.isRestricted) {
      setLoading(false);
      Alert.alert(
        'Access Denied',
        'Your account is currently restricted, please contact support.'
      );
      return;
    }

    // Get the current date and time
    const currentDate = new Date();
    const rideTimestamp = currentDate.toISOString(); // Convert to ISO string format
    // declare number of seat depending on vehicle class.. 
    // it render the number of seat based on the classification of vehicle of the driver
    const seatConfiguration = getSeatConfiguration(vehicleClass);

    const newRide = {
      rideOrigin: origin, // Set initial car location as origin
      rideOriginPlace: originAddress,
      rideLocDes: rideLocDes,
      rideDestination: destination,
      rideDestinationPlace: rideDestinationPlace,
      carLocation: carLocation, // Save car location at the start
      isFinish: false,
      isStarted: false,
      driverId: currentUser.uid,
      distance: distance,
      totalFare: 0,
      initialFare: fare, 
      createdAt: new Date(), // Save the current timestamp
      vehicleClass: vehicleClass, // Save the vehicle class
      vehicleColor: userData.vehicleColor, 
      driversFirstName: userData.lastName, 
      driversLastName: userData.firstName, 
      driversProfile: userData.userProfile, 
      driversMobileNo: userData.mobileNo, 
      rating: userData.rating, 
      seats: seatConfiguration, // Add seats to Firestore
      departureTime: departureTime, // Add the departure time
      cancel: false,  
    };

    const rideRef = await firestore.collection('Ride').add(newRide);
    setOngoingRideId(rideRef.id);
    // startLocationTracking(); // Start tracking the car's location

    console.log('Ride scheduled successfully!');
    setrideLocDes('');
    closeModal();
  } catch (error) {
    console.error('Error scheduling ride: ', error);
  } finally {
    setLoading(false);
  }
};

  const getHeading = (start, end) => {
    const lat1 = (start.latitude * Math.PI) / 180;
    const lon1 = (start.longitude * Math.PI) / 180;
    const lat2 = (end.latitude * Math.PI) / 180;
    const lon2 = (end.longitude * Math.PI) / 180;
  
    const dLon = lon2 - lon1;
  
    const y = Math.sin(dLon) * Math.cos(lat2);
    const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);
  
    let heading = (Math.atan2(y, x) * 180) / Math.PI;
    heading = (heading + 360) % 360; // Normalize to 0-360 degrees
  
    return heading;
  };
  
  
  useEffect(() => {
    const fetchVehicleClassAndCalculateFare = async () => {
      const currentUser = auth.currentUser;
      if (!currentUser) return;

      try {
        // Fetch the user's document
        const userDoc = await firestore.collection('users').doc(currentUser.uid).get();
        const userData = userDoc.data();
        
        // Set vehicleClass if found
        if (userData && userData.vehicleClass) {
          setVehicleClass(userData.vehicleClass);
        } else {
          console.warn('Vehicle class not found in user data');
        }

        // Calculate fare if distance is available
        if (distance !== null) {
          let baseFare = 40; // Default for Sedan
          let farePerKm = 7.5;

          // Update fare based on vehicle class
          if (userData.vehicleClass === 'Suv') {
            baseFare = 50;
            farePerKm = 9;
          } else if (userData.vehicleClass === 'Motorcycle') {
            baseFare = 25;
            farePerKm = 5;
          }

          // Calculate the total fare
          const calculatedFare = baseFare + (farePerKm * distance);
          // Divide fare based on vehicle class
          let finalFare;
          if (userData.vehicleClass === 'Sedan') {
            finalFare = calculatedFare / 3;
          } else if (userData.vehicleClass === 'Suv') {
            finalFare = calculatedFare / 5;
          } else {
            finalFare = calculatedFare; // No division for other vehicle classes
          }
          
          setFare(finalFare); // Save fare with two decimal points
        }
      } catch (error) {
        console.error('Error fetching vehicle class: ', error);
      }
    };

    fetchVehicleClassAndCalculateFare(); // Call the merged function on component mount
  }, [distance]); // Depend on distance to re-fetch and recalculate when it changes


  const fetchPassengerLocations = async () => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        // console.log('No logged-in user.');
        return;
      }
  
      const driverId = currentUser.uid;
      const rideRequestRef = firestore.collection('RideRequests')
        .where('driverId', '==', driverId)
        .where('isAccepted', '==', true)
        .where('isAcceptedRequestFinished', '==', false)
        .where('isAcceptedRequestStarted', '==', false);
  
      const querySnapshot = await rideRequestRef.get();
  
      if (querySnapshot.empty) {
       // console.log('No matching ride request found.');
        return;
      }
  
      const passengerLocations = [];
      
      // Iterate over each accepted ride request
      querySnapshot.forEach(doc => {
        const rideRequestData = doc.data();
       // console.log('Passenger Profile:', rideRequestData.passengerProfile); // Log profile URL
        if (rideRequestData.currentLocation) {
          passengerLocations.push({
            id: doc.id, // Unique ID for the passenger marker
            location: rideRequestData.currentLocation,
            firstName: rideRequestData.firstName,
            lastName: rideRequestData.lastName,
            passengerId: rideRequestData.passengerId,
          });
        }
      });
  
      // Update the state with all passenger locations
      setPassenger(passengerLocations);
  
    } catch (error) {
      console.error('Error fetching passenger locations:', error);
    }
  };
  
  
  useEffect(() => {
    fetchPassengerLocations();
    
    const intervalId = setInterval(() => {
      fetchPassengerLocations(); // Fetch and update every second
    }, 1000);
  
    return () => clearInterval(intervalId); // Cleanup on unmount
  }, []);
  
  
  
  useEffect(() => {
    fetchVehicleClass(setVehicleClass); // Fetch vehicle type on component mount
    loadOngoingRide(); // Load any ongoing ride
  
    // Fetch user's current location if no ongoing ride
    if (!hasPendingRide) {
      userLocation();
    }
    // return () => stopLocationTracking(); // Cleanup on unmount
  }, [hasPendingRide]);
  
  const handleRefresh = async () => {
    setOrigin(null);         // Clear origin marker
    setDestination(null);    // Clear destination marker
    setCarLocation(null);    // Clear car location
    setDistance(null);       // Clear distance
    setFare(null);           // Clear fare
    setPassenger(null);           // Clear fare
    
    await loadOngoingRide();  // Reload ongoing ride
    await userLocation();  // Refresh current location
    await fetchPassengerLocations();
    console.log('Screen refreshed!');
  };

  useEffect(() => {
    const fetchDriverData = async () => {
      const currentUser = auth.currentUser;
      if (!currentUser) return;

      try {
        const userDoc = await firestore.collection('users').doc(currentUser.uid).get();
        const userData = userDoc.data();
        
        if (userData && userData.isVerified) {
          setIsVerified(userData.isVerified);
        } else {
          console.log('User is not verified ');
        }
      } catch (error) {
        console.error('Error fetching user verification status: ', error);
      }
      finally {
        setLoading(false);
      }
    };
    fetchDriverData();
  }, []);

  if (loading) {
    return (
      <Loading/>
    );
  }

  return (
    <View style={styles.mobilecontainer}>
      <MapView 
        ref={mapRef} // Attach the ref to MapView
        style={StyleSheet.absoluteFill} 
        initialRegion={carLocation}
      >
        {origin && (
          <Marker
            coordinate={origin}
            image={imagesPath.origImage}
            onDragEnd={(direction) => setOrigin(direction.nativeEvent.coordinate)}
          />
        )}

        {destination && (
          <Marker
            coordinate={destination}
            image={imagesPath.desImage}
            onDragEnd={(direction) => setDestination(direction.nativeEvent.coordinate)}
          />
        )}  

        {carLocation && (
          <Marker
            coordinate={carLocation}
            image={getCarImage(vehicleClass, imagesPath.sedanImage, imagesPath.motorcycleImage, imagesPath.suvImage)}
            rotation={carHeading} // Rotate the car marker based on the heading
            anchor={{ x: 0.5, y: 0.5 }} // Set the anchor point to the center of the image
          />
        )}

        {origin && destination && (
          <MapViewDirections
            origin={origin}
            destination={destination}
            apikey={GOOGLE_MAPS_KEY}
            strokeColor='#0CC0DF'
            strokeWidth={5}
            onReady={result => {
              setDistance(result.distance); // Set the distance in km
            }}
          />
        )}

        {passenger && passenger.map((passenger) => (
            <Marker
              key={passenger.id} // Unique key for each passenger marker
              coordinate={{
                latitude: passenger.location.latitude,
                longitude: passenger.location.longitude
              }}
              image={imagesPath.desImage} // Use an appropriate marker image for passengers
              >
                <Callout>
                  <View style={{ alignItems: 'center' }}>
                    <Text>{`Passenger: ${passenger.firstName} ${passenger.lastName}`}</Text>
                    <Text>{`ID: ${passenger.passengerId}`}</Text>
                  </View>
                </Callout>
              </Marker>
          ))}
        
      </MapView>

      <SwipeableModal
        isVisible={isModalVisible}
        onSwipeComplete={closeModal}
        onClose={closeModal}
      >
       <CreateRide
          closeModal={closeModal}
          originAddress={originAddress}
          origin={origin}
          rideLocDes={rideLocDes}
          setrideLocDes={setrideLocDes}
          setDestination={setDestination}
          setRideDestinationPlace={setRideDestinationPlace}
          distance={distance}
          fare={fare}
          loading={loading}
          handleCreateRide={handleCreateRide}
          setDepartureTime={setDepartureTime} // Pass the setter function
        />
      </SwipeableModal>
      
      {/*Ride request display on the top right side of the map/screen...*/}
      <View style={{ height: '70%', width: '60%', alignSelf: 'flex-end', marginRight: 10,}}>
        <Image
          style={{ width: 80, height: 40, marginTop: 5, alignSelf: 'flex-end', right: -10}}
          source={require('../assets/Logo-Skool.png')}
        />
        <RideRequestList rideRequests={rideRequests} setRideRequests={setRideRequests} />
      </View>

      <View style={{alignSelf: 'flex-end', }}>
        <TouchableOpacity
          style={styles.button}
          onPress={handleRefresh}
        >
          <MaterialIcons name="refresh" size={30} color="white" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.button}
          onPress={userLocation}
        >
          <MaterialIcons name="my-location" size={30} color="white" />
        </TouchableOpacity>
      </View>

      {isVerified && (
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%' ,}}>
          <TouchableOpacity
            style={[styles.button, { marginLeft: 10 }]}
            onPress={toggleLocationTracking}
          >
            <FontAwesome name="power-off" size={30} color={isTracking ? 'green' : 'red'} />
          </TouchableOpacity>

          <View style={styles.conCreate}>
            <View style={{width: 115}}>
            {showAddHint && (
              <View style={styles.floatingComment}>
                <Text style={styles.commentText}>Schedule Ride</Text>
              </View>
            )}
            </View>
            <TouchableOpacity
              style={styles.button}
              onPress={openModal}
            >
              <Entypo name="plus" size={30} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
};

export default DRHome;
