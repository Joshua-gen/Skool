import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, TextInput, Alert, FlatList, Image, Animated, ActivityIndicator } from 'react-native';
import { auth, firestore, firebase } from '../Config';
import { styles } from './src/homestyle'
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import MapViewDirections from 'react-native-maps-directions';
import NotificationHandler from '../service/NotificationHandler'; // Update this path if needed

import imagesPath from '../src/imagesPath';

import { GOOGLE_MAPS_KEY } from '@env';

import { Entypo, MaterialCommunityIcons, Ionicons, MaterialIcons, FontAwesome  } from '@expo/vector-icons';


const PSHome= ({ navigation, route }) => {
  const mapRef = useRef(null); // Create a ref for the MapView
  const notification = NotificationHandler(); // Use the custom hook for notifications
  const rideLocation = route?.params?.rideLocation;
  const vehicleClass = route?.params?.vehicleClass; // Add this line
  const [currentLoc, setCurrentLoc] = useState(null);
  const [currentRide, setCurrentRide] = useState(null); // Current ride information
  const [rideOrigin, setRideOrigin] = useState(null); // Ride originr
  const [dropOffLocation, setDropOffLocation] = useState(null); // Drop-off location
  const [dropOffs, setDropOffs] = useState(null);
  const [vehicleClass1, setVehicleClass1] = useState(null); // Add state for vehicleClass
  const [locationSubscription, setLocationSubscription] = useState(null); // Add state for locationSubscription
  const [carHeading, setCarHeading] = useState(0); // New state for car's heading
  const [availableRides, setAvailableRides] = useState(0);

  const [isTracking, setIsTracking] = useState(false);

  const userLocation = async () => {
    try {
      // Request location permissions
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.log('Permission denied');
        return;
      }

      // Fetch the user's current position
      let location = await Location.getCurrentPositionAsync({
        enableHighAccuracy: true,
        timeInterval: 60000, // optional, fetch every 5 seconds
        distanceInterval: 10, // optional, minimum movement in meters to trigger update
      });
  
      const { latitude, longitude } = location.coords;
      setCurrentLoc({
        latitude,
        longitude,
        latitudeDelta: 0.005, // Set the zoom level for latitude (smaller means more zoomed in)
        longitudeDelta: 0.005, // Set the zoom level for longitude
      });
  
      // Set the map to animate to the user's location
      if (mapRef.current) {
        mapRef.current.animateToRegion({
          latitude,
          longitude,
          latitudeDelta: 0.005, // Zoom level (smaller is more zoomed in)
          longitudeDelta: 0.005,
        }, 1000); // Duration in ms for smooth animation
      }
  
    } catch (error) {
      console.log('Error fetching user location:', error);
    }
  };

  const startLocationTracking = async () => {
    let previousLocation = null;
  
    const subscription = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.High,
        timeInterval: 60000,
        distanceInterval: 1,
      },
      (location) => {
        const { latitude, longitude } = location.coords;

        if (previousLocation) {
          const heading = getHeading(previousLocation, { latitude, longitude });
          setCarHeading(heading);
        }

        previousLocation = { latitude, longitude };
  
        setCurrentLoc({
          latitude,
          longitude,
          latitudeDelta: 0.0022,
          longitudeDelta: 0.0021,
        });

        saveCurrentLocationToFirestore({ latitude, longitude });
  
        if (mapRef.current) {
          mapRef.current.animateToRegion({
            latitude,
            longitude,
            latitudeDelta: 0.0022,
            longitudeDelta: 0.0021,
          }, 5000);
        }
      }
    );
  
    if (subscription) {
      setLocationSubscription(subscription); // Save the subscription if valid
    } else {
      console.error('Failed to start location tracking.');
    }
  };

// Stop location tracking
const stopLocationTracking = () => {
  if (locationSubscription) {
    locationSubscription.remove(); // Remove location updates
    setLocationSubscription(null); // Reset subscription state
  }
};
// Function to manually re-center the map on the current location
const forceCenterMap = () => {
  if (mapRef.current && currentLoc) {
    mapRef.current.animateToRegion({
      latitude: currentLoc.latitude,
      longitude: currentLoc.longitude,
      latitudeDelta: 0.0022, // Slightly zoomed in for better visibility
      longitudeDelta: 0.0021,
    }, 20000); // Smooth animation over 1 second
  }
};
{/* 
  // toggle button fot on of realtime location tracking   
  const toggleLocationTracking = () => {
    if (isTracking) {
      stopLocationTracking();
    } else {
      startLocationTracking();
    }
    setIsTracking(!isTracking);
  };

useEffect(() => {
  if (isTracking) {
    const intervalId = setInterval(() => {
      forceCenterMap();
    }, 5000);
    return () => clearInterval(intervalId);
  }
}, [currentLoc, isTracking]); // Ensure cleanup

*/}

// Set an interval to re-center the map every few seconds
useEffect(() => {
  const intervalId = setInterval(() => {
    forceCenterMap(); // Re-center the map every 5 seconds
  }, 10000); // Adjust the interval time (e.g., 5 seconds)

  // Cleanup the interval when the component unmounts
  return () => clearInterval(intervalId);
}, [currentLoc]); // Dependency on carLocation

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


  const fetchCurrentRide = async () => {
    try {
      // console.log('Current User ID:', auth.currentUser.uid); // Log the current user ID
      // Fetch the active RideRequest
      const rideRequestSnapshot = await firestore
        .collection('RideRequests')
        .where('passengerId', '==', auth.currentUser.uid)
        .where('isAccepted', '==', true)
        .where('isAcceptedRequestFinished', '==', false) // Only active ride requests
        .limit(1)
        .get();
      
      if (rideRequestSnapshot.empty) {
       //  console.log('No active ride request found for this passenger.');
        return;
      }
  
      // Extract rideId from RideRequest
      const rideRequestData = rideRequestSnapshot.docs[0].data();
      const rideId = rideRequestData.rideId;
  
      // Fetch the Ride document using the rideId and check for isStarted and isFinish fields
      const rideDoc = await firestore.collection('Ride').doc(rideId).get();
      
      if (!rideDoc.exists) {
        console.error('Ride not found.');
        return;
      }
  
      const rideData = rideDoc.data();
      
      // Check if the ride has started and hasn't finished
      if (rideData.isStarted && !rideData.isFinish) {
        setCurrentRide(rideData); 
        setVehicleClass1(rideData.vehicleClass); // Fetch and set vehicleClass
  
        const rideOrigin = rideData.rideOrigin;
        setRideOrigin({
          latitude: rideOrigin.latitude,
          longitude: rideOrigin.longitude,
          place: rideData.rideOriginPlace || 'Unknown Origin',
        });
  
        // Handle seats as an object
        const passengerSeat = Object.entries(rideData.seats).find(
          ([seatId, seat]) => seat.passengerId === auth.currentUser.uid
        );
  
        if (passengerSeat && passengerSeat[1].dropOff) {
          const dropOff = passengerSeat[1].dropOff;
          setDropOffLocation({
            latitude: dropOff.latitude,
            longitude: dropOff.longitude,
          });
        } else {
          console.error('No drop-off location found for this passenger.');
        }
      } else if (rideData.isFinish) {
        console.log('The ride has already finished.');
      }
    } catch (error) {
      console.error('Error fetching current ride: ', error);
    }
  };
  
  const getMarkerImage = () => {
    if (currentRide?.isStarted) { // Check if the ride has started
      switch (vehicleClass1) { // Use the vehicleClass state here
        case 'Sedan':
          return imagesPath.sedanImage; // Use sedan image
        case 'Suv':
          return imagesPath.suvImage; // Use SUV image
        case 'Motorcycle':
          return imagesPath.motorcycleImage; // Use motorcycle image
        default:
          return imagesPath.currentImage; // Fallback image for unknown vehicle types
      }
    } else {
      return imagesPath.currentImage; // Default image when the ride hasn't started
    }
  };

  const getMarkerImage2 = () => {
    switch (vehicleClass) {
      case 'Sedan':
        return imagesPath.sedanImage; // Use sedan image
      case 'Suv':
        return imagesPath.suvImage; // Use SUV image
      case 'Motorcycle':
        return imagesPath.motorcycleImage; // Use motorcycle image
      default:
        return imagesPath.origImage; // Fallback image
    }
  };

  const activateRideRequestListener = () => {
    const currentUser = auth.currentUser;

    if (!currentUser) return;

    // Listen to changes in the RideRequests collection
    return firestore
      .collection('RideRequests')
      .where('passengerId', '==', currentUser.uid)
      .where('isAccepted', '==', true) // Filter for accepted requests
      .where('isAcceptedRequestFinished', '==', false) // Filter for unfinished requests
      .onSnapshot((snapshot) => {
        if (snapshot.empty) {
        //  console.log('No ride request'); // Log if no requests found
          stopLocationTracking(); // Stop tracking if no request
        } else {
          snapshot.forEach((doc) => {
            const data = doc.data();
           // console.log('Ride Request:', data); // Log the ride request data
            startLocationTracking(); // Start tracking location when conditions are met
            saveCurrentLocationToFirestore(data.currentLocation); // Pass current location for saving
          });
        }
      });
};

const saveCurrentLocationToFirestore = async (location) => {
  const currentUser = auth.currentUser;
  if (!currentUser) {
   //   console.log('No user is currently logged in.');
      return;
  }

  try {
      const snapshot = await firestore.collection('RideRequests').get();
      const rideRequests = snapshot.docs.filter(doc => {
          const data = doc.data();
          return data.passengerId === currentUser.uid && data.isAccepted && !data.isAcceptedRequestFinished;
      });

      if (rideRequests.length === 0) {
         // console.log('No active accepted ride request found.');
          return;
      }

      const rideRequestDoc = rideRequests[0];
      const docRef = rideRequestDoc.ref;
      const previousLocation = rideRequestDoc.data().currentLocation;

      if (!previousLocation || previousLocation.latitude !== location.latitude || previousLocation.longitude !== location.longitude) {
         // console.log('Location changed:', location);
          await docRef.update({ currentLocation: location });
      } else {
        //  console.log('No change in location.');
      }
  } catch (error) {
      console.error('Error saving current location:', error);
  }
};
  
  useEffect(() => {
    userLocation();
    fetchCurrentRide();
    activateRideRequestListener();
  }, [currentRide?.isStarted, currentRide?.isFinish, vehicleClass]); // Add vehicleClass as a dependency

  useEffect(() => {
    // Function to refresh the ride request listener and location data
    const refreshData = async () => {
      await fetchCurrentRide();
      await activateRideRequestListener();
      console.log('Data refreshed...');
    };
  
    // Set an interval to refresh data every 10 seconds (or adjust the interval as needed)
    const intervalId = setInterval(() => {
      refreshData();
    }, 60000); // 10,000 milliseconds = 10 seconds
  
    // Cleanup interval on component unmount
    return () => clearInterval(intervalId);
  }, [currentRide?.isStarted, currentRide?.isFinish, vehicleClass]);
  
   // Update availableRides if the ride count is passed back from RideListing
   useEffect(() => {
    if (route.params?.rideCount) {
      setAvailableRides(route.params.rideCount);
    }
  }, [route.params?.rideCount]);

  const handleRefresh = async () => {
    await userLocation();
    await fetchCurrentRide();
    await activateRideRequestListener();
    console.log('Screen refreshed!');
  };
  
 {/* useEffect(() => {
    console.log("Updated currentLoc: ", currentLoc);
  }, [currentLoc]);
  */}
  

  return (
    <View style={styles.mobilecontainer}>
      <MapView 
        ref={mapRef} // Attach the ref to MapView
        style={StyleSheet.absoluteFill} 
        region={currentLoc}
      >
        {/* Ride origin marker */}
      {rideOrigin && (
        <Marker
          coordinate={rideOrigin}
          title={rideOrigin.place || 'Ride Origin'}
          image={imagesPath.origImage}
        />
      )}

      {/* Passenger's drop-off location marker */}
      {dropOffLocation && (
        <Marker
          coordinate={dropOffLocation}
          title={dropOffLocation.place || 'Drop-off Location'}
          image={imagesPath.desImage}
        />
      )}

      {/* Directions from ride origin to passenger's drop-off */}
      {rideOrigin && dropOffLocation && currentRide?.isStarted && (
        <MapViewDirections
          origin={rideOrigin}
          destination={dropOffLocation}
          apikey={GOOGLE_MAPS_KEY}
           strokeColor='#0CC0DF'
          strokeWidth={5}
        />
      )}
        {currentLoc && (
          <Marker
            coordinate={currentLoc}
            image={getMarkerImage()} // Set the marker image based on the vehicle class
            rotation={carHeading} // Rotate the car marker based on the heading
            anchor={{ x: 0.5, y: 0.5 }} // Set the anchor point to the center of the image
          />
        )}

       {rideLocation && (
          <Marker
            coordinate={{
              latitude: rideLocation.latitude,
              longitude: rideLocation.longitude,
            }}
            title={rideLocation.rideOriginPlace || 'Ride Origin'}
            image={getMarkerImage2()} // Set the marker image based on vehicle class
          />
        )}

        {currentLoc && rideLocation && (
          <MapViewDirections
            origin={currentLoc}
            destination={rideLocation}
            apikey={GOOGLE_MAPS_KEY}
            strokeColor='#0CC0DF'
            strokeWidth={5}
           // onReady={result => {
          //    setDistance(result.distance); // Set the distance in km
           // }}
          />
        )}

      
      </MapView>
      <View style={{height: '70%', width: '100%', alignItems: 'flex-end'}}>
        <Image
          style={{ width: 80, height: 40, marginTop: 5}}
          source={require('../assets/Logo-Skool.png')}
        />
      </View>
      <View style={{height: '20%', width: 50, alignSelf: 'flex-end', marginRight: 10,}}>
        <TouchableOpacity
          style={styles.button4}
          onPress={handleRefresh}
        >
          <MaterialIcons name="refresh" size={30} color="white" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.button4}
          onPress={userLocation}
        >
          <MaterialIcons name="my-location" size={30} color="white" />
        </TouchableOpacity>
      </View>
      <View style={{backgroundColor: 'rgba(12, 192, 223, 0.5)', width: '100%', height: '10%', justifyContent: 'center', alignItems: 'center', borderTopLeftRadius: 50,   }}>
        <View style={{justifyContent: 'space-between', width: '95%', flexDirection: 'row', alignItems: 'center', marginTop: '2%', marginLeft: 10 }}> 
        <View style={{flexDirection: 'row', alignItems: 'center', width: '72%', height: 40,}}>
          <Text style={{color: 'white', fontSize: 14, fontFamily: 'Poppins-SemiBold'}}>Check for the available ride near your area</Text>
        </View>
        <TouchableOpacity
            style={styles.button5}
            onPress={() => {
              if (currentLoc) {
                navigation.navigate('RideListing', { currentLoc }); // Pass currentLoc as a parameter
              } else {
                Alert.alert('Error', 'Current location is not available.'); // Handle case where currentLoc is not set
              }
            }}
        >
          <Text style={[styles.buttonText, {color: '#0CC0DF'}]}>View</Text>
          
        </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default PSHome;

