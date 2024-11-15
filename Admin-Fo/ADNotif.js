import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, FlatList, ActivityIndicator, TouchableOpacity, Image, Alert, RefreshControl } from 'react-native';
import { firestore, auth } from '../Config'; // Ensure auth and firestore are imported
import Header from '../src/Header';
import NotificationHandler from '../service/NotificationHandler'; // Make sure Notifications is imported


const ADNotif = () => {
  const [rideRequests, setRideRequests] = useState([]);
    const [loading, setLoading] = useState(true); // To handle loading state
    const [refreshing, setRefreshing] = useState(false); // State for refreshing
    const [notification, setNotification] = useState(null);
    const [notif, setNotif] = useState([]);
  NotificationHandler(setNotification);
      
  useEffect(() => {
    if (notification) {
      // Handle the notification when it's received
     // Log the notification data to the console
  console.log('Notification Received:', notification);
      // For example, you might want to show an alert or update the ride request list
      Alert.alert('Notification Received', JSON.stringify(notification));
    }
  }, [notification]); // Run this effect when the notification state changes

   // Function to fetch notifications
   const fetchNotifications = async () => {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      console.error('User not logged in!');
      return;
    }

    try {
      // Fetch notifications for the current user (recipientId is assumed to be the currentUser's UID)
      const notificationsSnapshot = await firestore
        .collection('Notifications')
        .where('recipientId', '==', currentUser.uid) // Fetch notifications only for the current user
        .orderBy('timestamp', 'desc') // Order by timestamp in descending order (newest first)
        .get();

      const notificationsData = notificationsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Set the fetched notifications directly
      setNotif(notificationsData);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);
  
  //refresh function
  const onRefresh = () => {
    setRefreshing(true);
    fetchNotifications();
  };

  const formatTimestamp = (timestamp) => {
    const now = new Date();
    const timeDiff = now - timestamp.toDate(); // Difference in milliseconds
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
      return timestamp.toDate().toLocaleDateString();
    ``}
  };``
  
  return (
    <View style={styles.container}>
        <Header/>
        <View style={{height: '92%', width: '100%'}}> 
          <Text style={{fontFamily: 'Poppins-SemiBold', fontSize: 24, marginLeft: 10, marginTop: 5 }}>Notifications</Text>
          <FlatList
            data={notif}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.rideItem2}>
                <View style={{flexDirection: 'row', width: '100%', justifyContent: 'space-between'}}>
                  <Text style={{fontFamily: 'Poppins-Medium'}}>{item.title}</Text>
                  <Text style={{color: 'grey', fontSize: 14}}>{formatTimestamp(item.timestamp)}</Text>
                </View>
                <Text style={{fontFamily: 'Poppins-Regular',}}>{item.message}</Text>
                
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

export default ADNotif

const styles = StyleSheet.create({
    container:{
        flex: 1, 
        alignItems: 'center'
    },

    rideItem2: {
      backgroundColor: '#fff',
      padding: 10,
      marginVertical: 1,
      width: '100%',
      shadowColor: '#000', // Shadow color
      shadowOffset: { width: 0, height: 2 }, // Offset for the shadow (x, y)
      shadowOpacity: 0.25, // Opacity of the shadow
      shadowRadius: 3.84, // Shadow blur radius
         // Android shadow
      elevation: 5, // Elevation for Android
    },
})