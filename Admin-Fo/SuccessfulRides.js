import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, FlatList, ActivityIndicator, TouchableOpacity, Image, RefreshControl, TextInput, Alert} from 'react-native';
import { firestore, auth } from '../Config';
import Header from '../src/Header';
import Loading from '../src/loading';

import AntDesign from '@expo/vector-icons/AntDesign';

const SuccessfulRides = () => {
  const [rides, setRides] = useState([]);
  const [originalRides, setOriginalRides] = useState([]); // Store the original list of rides
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false); // State for refreshing
  const [search, setSearch] = useState(''); // State for search query

  const fetchRides = async () => {
    try {
      const snapshot = await firestore.collection('Ride')
        .where('isFinish', '==', true)
        .where('cancel', '==', false)
        .orderBy('finishTime', 'desc')
        .get();

      const ridesList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setRides(ridesList); // Set both original and filtered rides
      setOriginalRides(ridesList); // Keep a backup of the original list
    } catch (error) {
      console.error("Error fetching rides: ", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchRides();
  }, []);

  const handleSearch = () => {
    if (!search.trim()) {
      setRides(originalRides); // If search is empty, show all rides
    } else {
      const filteredRides = originalRides.filter(ride =>
        ride.id.toLowerCase().includes(search.toLowerCase()) ||
        ride.driversFirstName?.toLowerCase().includes(search.toLowerCase()) ||
        ride.driversLastName?.toLowerCase().includes(search.toLowerCase()) || 
        ride.driverId?.toLowerCase().includes(search.toLowerCase()) || 
        ride.vehicleClass?.toLowerCase().includes(search.toLowerCase())
      );
      setRides(filteredRides);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchRides(); // Fetch new data on refresh
  };

  const renderSeats = (seats) => {
    const seatKeys = Object.keys(seats);
    return seatKeys.map((seatKey) => {
        const seat = seats[seatKey];

        if (seat === false) {
            // Unoccupied seat
            return (
                <View key={seatKey} style={{ marginVertical: 5,  borderLeftColor: '#0CC0DF', borderLeftWidth: 2, paddingLeft: 5, borderBottomColor: '#0CC0DF', borderBottomWidth: 1 }}>
                    <Text style={styles.value}>Seat: {seatKey}</Text>
                    <Text style={styles.value}> Unoccupied</Text>
        
                </View>
            );
          } else if (typeof seat === 'object') {
              // Occupied seat with passenger details
              return (
                  <View key={seatKey} style={{ marginVertical: 5,  borderLeftColor: '#0CC0DF', borderLeftWidth: 2, paddingLeft: 5, borderBottomColor: '#0CC0DF', borderBottomWidth: 1 }}>
                      <Text style={styles.value}>Seat: {seatKey}</Text>
                      <Text style={styles.value}>Dropoff Time: {seat.dropOffTime?.toDate().toLocaleTimeString()}</Text>
                      <Text style={styles.value}>Passenger: {seat.firstName} {seat.lastName}</Text>
                      <Text style={styles.value}>Drop-off: {seat.dropOff?.place || 'N/A'}</Text>
                      <Text style={styles.value}>Shared Fare: ₱{seat?.dropOff?.fare?.toFixed(2) || 'N/A'}</Text>
                  </View>
              );
          }
          return null;
      });
  };


  if (loading) {
  return (
    <Loading/>
  );
  }

  return (
    <View style={styles.container}>
        <Header/>
        <View style={{flexDirection: 'row', width: '97%', alignItems: 'center', justifyContent: 'space-between', marginTop: 5}}>
          <TextInput
            placeholder='Search by ride ID, driver name, or vehicle class'
            style={[styles.input, { width: '75%' }]}
            value={search}
            onChangeText={text => setSearch(text)}
          />
          <TouchableOpacity style={styles.ViewBtn} onPress={handleSearch}>
            <AntDesign name="search1" size={24} color="white" />
          </TouchableOpacity>
        </View>
        <View style={{height: '85%', width: '100%'}}>
        <FlatList
        style={{ padding: 3, }}
        data={rides}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.rideItem}>
            <View style={{ width: '95%', marginTop: 2, marginBottom: 2, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'}}>
             <Text style={[styles.value, {fontFamily: 'Poppins-Medium'}]}>Ride ID: </Text>
             <Text style={styles.value}>{item.id}</Text>
            </View>

            <View style={styles.txtCon}>
              <Text style={[styles.value, {fontFamily: 'Poppins-Medium'}]}>Driver ID: </Text>
              <Text 
                style={styles.value2} 
              >
                {item.driverId} 
              </Text>
            </View>

            <View style={styles.txtCon}>
              <Text style={[styles.value, {fontFamily: 'Poppins-Medium'}]}>Driver Name: </Text>
              <Text 
                style={styles.value2} 
              >
                {item.driversFirstName} {item.driversLastName}
              </Text>
            </View>

            <View style={styles.txtCon}>
              <Text style={[styles.value, {fontFamily: 'Poppins-Medium'}]}>Vehicle Classification: </Text>
              <Text 
                style={styles.value2} 
              >
                {item.vehicleClass}
              </Text>
            </View>

            <View style={styles.txtCon}>
              <Text style={[styles.value, {fontFamily: 'Poppins-Medium'}]}>Ride Started: </Text>
              <Text 
                style={styles.value2} 
              >
                {item.startTime?.toDate().toLocaleDateString()} {item.startTime?.toDate().toLocaleTimeString()}
              </Text>
            </View>

            <View style={styles.txtCon}>
              <Text style={[styles.value, {fontFamily: 'Poppins-Medium'}]}>Ride Finished: </Text>
              <Text 
                style={styles.value2} 
              >
                {item.finishTime?.toDate().toLocaleDateString()} {item.finishTime?.toDate().toLocaleTimeString()}
              </Text>
            </View>

            <View style={styles.txtCon}>
              <Text style={[styles.value, {fontFamily: 'Poppins-Medium'}]}>Origin: </Text>
              <Text 
                style={styles.value2} 
                numberOfLines={3} 
                ellipsizeMode="tail"
              >
               {item?.rideOriginPlace}
              </Text>
            </View>

            <View style={styles.txtCon}>
              <Text style={[styles.value, {fontFamily: 'Poppins-Medium'}]}>
                Origin Coordinate:
              </Text>
              <Text style={styles.value2}>
                {item?.rideOrigin?.latitude?.toFixed(6) || 'N/A'}, {item?.rideOrigin?.longitude?.toFixed(6) || 'N/A'}
              </Text>
            </View>

            <View style={styles.txtCon}>
              <Text style={[styles.value, {fontFamily: 'Poppins-Medium'}]}>Destination: </Text>
              <Text 
                style={styles.value2} 
                numberOfLines={3} 
                ellipsizeMode="tail"
              >
                {item?.rideDestinationPlace}
              </Text>
            </View>

            <View style={styles.txtCon}>
              <Text style={[styles.value, {fontFamily: 'Poppins-Medium'}]}>
                Destination Coordinate: 
              </Text>
              <Text style={styles.value2}>
                {item?.rideDestination?.latitude?.toFixed(6) || 'N/A'}, {item?.rideDestination?.longitude?.toFixed(6) || 'N/A'}
              </Text> 
            </View>
            
            <View style={{ width: '95%', marginBottom: 2, marginTop: 7 }}>
              <Text style={[styles.value, {fontFamily: 'Poppins-Medium'}]}>Passengers and Seats:</Text>
                {renderSeats(item.seats)}
            </View>

            <View style={styles.txtCon}>
              <Text style={[styles.value, {fontFamily: 'Poppins-Medium'}]}>
                Distance Travel: 
              </Text>
              <Text style={styles.value2}>
                {item?.distance?.toFixed(2)} km
              </Text> 
            </View>

            <View style={styles.txtCon}>
              <Text style={[styles.value, {fontFamily: 'Poppins-Medium'}]}>
                Total Fare: 
              </Text>
              <Text style={[styles.value2,{fontSize: 20}]}>
               ₱ {item?.totalFare?.toFixed(2)}
              </Text> 
            </View>
            
          </View>
        )}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />
        </View>
    </View>
  )
}

export default SuccessfulRides

const styles = StyleSheet.create({
    container:{
        flex: 1, 
        alignItems: 'center'
    },
    rideItem: {
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
    value:{
      fontFamily: 'Poppins-Regular', 
    },
  
    value2:{
      fontFamily: 'Poppins-Regular', 
      marginLeft: 10,
    },
  
    txtCon: { width: '95%', height: 'auto', marginBottom: 5, borderBottomColor: '#0CC0DF', borderBottomWidth: 1},
    userName: {
      fontSize: 16,
      fontFamily: 'Poppins-Medium'
    },
    input: {
      width: '100%',
      padding: 10,
      borderColor: '#0CC0DF',
      borderWidth: 1,
      borderRadius: 5,
      height: 40
    },
    ViewBtn: {
      width: 80, 
      backgroundColor: '#0CC0DF',
      height: 40, 
      alignItems: 'center', 
      justifyContent: 'center', 
      borderRadius: 5,
      alignItems: 'center',
          shadowColor: '#000', // Shadow color
          shadowOffset: { width: 0, height: 2 }, // Offset for the shadow (x, y)
          shadowOpacity: 0.25, // Opacity of the shadow
          shadowRadius: 3.84, // Shadow blur radius
             // Android shadow
          elevation: 5, // Elevation for Android
    },
})