import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, FlatList, ActivityIndicator, TouchableOpacity, Image, RefreshControl, Alert} from 'react-native';
import { firestore, auth } from '../Config';
import Header from '../src/Header';
import Loading from '../src/loading';

import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import Entypo from '@expo/vector-icons/Entypo';

const PSHisitory = ({navigation}) => {
    const [userRides, setUserRides] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false); // State for refreshing

    const fetchPassengerRide = async () => {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        console.error('User not logged in!');
        return;
      }
    
      try {
        const rideSnapshot = await firestore
          .collection('Ride')
          .where('isFinish', '==', true) // Only finished rides
          .get();
    
        if (rideSnapshot.empty) {
          console.log('No ride history found');
          return;
        }
    
        const ridesData = [];
    
        // Loop through each ride and find the passenger's seat with dropOffTime
        rideSnapshot.forEach((rideDoc) => {
          const rideData = rideDoc.data();
    
          const passengerSeat = Object.entries(rideData.seats).find(
            ([seatId, seat]) => seat.passengerId === currentUser.uid
          );
    
          if (passengerSeat) {
            const [seatId, seatData] = passengerSeat;
            
            // Only push data if dropOffTime exists
            if (seatData.dropOffTime) {
              ridesData.push({
                id: rideDoc.id,
                ...rideData,
                seatId,
                seatData,
                dropOffTime: seatData.dropOffTime, // Access dropOffTime for sorting
              });
            }
          }
        });
    
        // Sort the ridesData array by dropOffTime in descending order
        ridesData.sort((a, b) => b.dropOffTime.toDate() - a.dropOffTime.toDate());
    
        setUserRides(ridesData);
      } catch (error) {
        console.error('Error fetching passenger ride history:', error);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    };
    
    

      useEffect(() => {
        fetchPassengerRide();
      }, []);

      const onRefresh = () => {
        setRefreshing(true);
        fetchPassengerRide(); // Fetch new data on refresh
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
                {item?.seatData?.dropOffTime?.toDate().toLocaleDateString()} {item?.seatData?.dropOffTime?.toDate().toLocaleTimeString()}
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
              <Text style={[styles.value, {fontFamily: 'Poppins-Medium'}]}>Dropoff: </Text>
              <Text 
                style={styles.value2} 
                numberOfLines={3} 
                ellipsizeMode="tail"
              >
                {item?.seatData?.dropOff?.place}
              </Text>
            </View>

            <View style={styles.txtCon}>
              <Text style={[styles.value, {fontFamily: 'Poppins-Medium'}]}>Dropoff Coordinate: </Text>
              <Text 
                style={styles.value2} 
                numberOfLines={2} 
                ellipsizeMode="tail"
              >
                {item?.seatData?.dropOff?.latitude?.toFixed(6)}, {item?.seatData?.dropOff?.longitude?.toFixed(6)}
              </Text>
            </View>

            <View style={styles.txtCon}>
              <Text style={[styles.value, {fontFamily: 'Poppins-Medium'}]}>Distance: </Text>
              <Text 
                style={styles.value2} 
                numberOfLines={3} 
                ellipsizeMode="tail"
              >
                {item?.seatData?.dropOff?.distance.toFixed(2)} km
              </Text>
            </View>

            <View style={styles.txtCon}>
              <Text style={[styles.value, {fontFamily: 'Poppins-Medium'}]}>Fare: </Text>
              <Text 
                style={[styles.value2, {fontSize: 20}]} 
                numberOfLines={3} 
                ellipsizeMode="tail"
              >
               ₱ {item?.seatData?.dropOff?.fare.toFixed(2)}
              </Text>
            </View>
            <View style={{borderLeftWidth: 2, borderLeftColor: '#0CC0DF', width: '95%', marginBottom: 10, marginTop: 5, paddingLeft: 10}}>
              <View style={styles.txtCon}>
                <Text style={[styles.value, {fontFamily: 'Poppins-Medium'}]}>Driver Name: </Text>
                <Text 
                  style={styles.value2} 
                  numberOfLines={3} 
                  ellipsizeMode="tail"
                >
                {item?.driversFirstName} {item?.driversFirstName}
                </Text>
              </View>

              <View style={styles.txtCon}>
                <Text style={[styles.value, {fontFamily: 'Poppins-Medium'}]}>Vehicle: </Text>
                <Text 
                  style={styles.value2} 
                  numberOfLines={3} 
                  ellipsizeMode="tail"
                >
                {item?.vehicleClass} {item?.vehicleColor}
                </Text>
              </View>
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

 

export default PSHisitory;


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