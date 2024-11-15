import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, FlatList, ActivityIndicator, TouchableOpacity, Image, RefreshControl, Alert} from 'react-native';
import { firestore, auth } from '../Config';
import Header from '../src/Header';
import Loading from '../src/loading';

import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import Entypo from '@expo/vector-icons/Entypo';

const DRHisitory = ({navigation}) => {
    const [userRides, setUserRides] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false); // State for refreshing

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
            .where('isFinish', '==', true)
            .orderBy('finishTime', 'desc')
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

      useEffect(() => {
        fetchUserRides();
      }, []);

      const onRefresh = () => {
        setRefreshing(true);
        fetchUserRides(); // Fetch new data on refresh
      };

      const renderSeats = (seats) => {
        const seatKeys = Object.keys(seats);
        return seatKeys.map((seatKey) => {
            const seat = seats[seatKey];
    
            if (seat === false) {
                // Unoccupied seat
                return (
                    <View key={seatKey} style={{ marginVertical: 5,  borderLeftColor: '#0CC0DF', borderLeftWidth: 2, paddingLeft: 5 }}>
                        <Text style={styles.value}>Seat: {seatKey}</Text>
                        <Text style={styles.value}> Unoccupied</Text>
            
                    </View>
                );
            } else if (typeof seat === 'object') {
                // Occupied seat with passenger details
                return (
                    <View key={seatKey} style={{ marginVertical: 5,  borderLeftColor: '#0CC0DF', borderLeftWidth: 2, paddingLeft: 5 }}>
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
    <View style = {styles.mobilecontainer}>
        <Header/>
        <View style={{height: '92%', width: '100%'}}>
        <FlatList
        style={{ padding: 2 }}
        data={userRides}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.rideItem}>
            <View style={{ width: '95%', marginTop: 2, marginBottom: 2, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'}}>
             <Text style={[styles.value, {fontFamily: 'Poppins-Medium'}]}>Ride ID: </Text>
             <Text style={styles.value}>{item.id}</Text>
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
  
  };

 

export default DRHisitory;


const styles = StyleSheet.create({
  mobilecontainer:{
    flex:1,
    alignItems: 'center',
    
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

  txtCon: { width: '95%', height: 'auto', marginBottom: 5}
 

})