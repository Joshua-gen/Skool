  import React, { useState, useEffect } from 'react';
  import { StyleSheet, View, Text, FlatList, ActivityIndicator, TouchableOpacity, Image, Alert, RefreshControl } from 'react-native';
  import { firestore, auth } from '../Config'; // Ensure auth and firestore are imported
  import { notifyPassengerOfRequestAcceptance, notifyPassengerOfRequestRejected } from '../service/Notifications'; // Update this path based on where your functions are located
  import NotificationHandler from '../service/NotificationHandler'; // Make sure Notifications is imported
  import RideRequestList from './componets/RideRequest';
  import Loading from '../src/loading';
  import Header from '../src/Header';
  import { Entypo, MaterialCommunityIcons, Ionicons, MaterialIcons, } from '@expo/vector-icons';

  const DRNotif = () => {
    const [rideRequests, setRideRequests] = useState([]);
    const [loading, setLoading] = useState(true); // To handle loading state
    const [refreshing, setRefreshing] = useState(false); // State for refreshing
    const [selectedScreen, setSelectedScreen] = useState('notification');
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
      }
    };

  if (loading) {
    return (
      <Loading/>
    );
  }

  return (
    <View style={styles.container}>
      <Header/>
      <View style={{height: '80%', width: '100%',}}>
        {selectedScreen === 'rideRequest' ? (
        <View style={{ height: '100%'}}>
          <Text style={{fontFamily: 'Poppins-SemiBold', fontSize: 24, marginLeft: 10, marginTop: 5 }}>Ride Request</Text>
          <View style={{padding: 5, height: '100%', }}>
            <RideRequestList rideRequests={rideRequests} setRideRequests={setRideRequests} />
          </View>
        </View>
         ) : (
        <View style={{height: '100%'}}> 
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
         )}
         
      </View>

      <View style={{flexDirection: 'row', backgroundColor: 'rgba(255, 255, 255, 0)', width: '80%', height: '10%', width: '100%', justifyContent: 'center', alignItems: 'center'}}>
        <TouchableOpacity
          style={[
            styles.button,
            selectedScreen === 'notification' && styles.button2 // Apply selected style if 'notification' is selected
          ]}
          onPress={() => setSelectedScreen('notification')}
        >
          <Text
            style={[
              styles.buttonText,
              selectedScreen === 'notification' && styles.buttonText2 // Apply selected style if 'notification' is selected
            ]}
          >Notification</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.button, {marginLeft: 5},
            selectedScreen === 'rideRequest' && styles.button2 // Apply selected style if 'notification' is selected
          ]}
          onPress={() => setSelectedScreen('rideRequest')}
        >
          <Text 
            style={[
              styles.buttonText,
              selectedScreen === 'rideRequest' && styles.buttonText2 // Apply selected style if 'notification' is selected
            ]}
          >
            Ride Request
          </Text>
          {rideRequests.length > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{rideRequests.length}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View> 
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,  
    backgroundColor: '#f5f5f5',
  },
  rideItem: {
    backgroundColor: '#fff',
    padding: 10,
    marginVertical: 5,
    borderRadius: 8,
    shadowColor: '#000', // Shadow color
    shadowOffset: { width: 0, height: 2 }, // Offset for the shadow (x, y)
    shadowOpacity: 0.25, // Opacity of the shadow
    shadowRadius: 3.84, // Shadow blur radius
       // Android shadow
    elevation: 5, // Elevation for Android
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

  label: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  badge: {
    backgroundColor: 'red',
    borderRadius: 100,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    top: -10,
    right: -10
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },

  value: {
    fontSize: 14,
    marginBottom: 5,
  },
  button: {
    backgroundColor: '#0CC0DF',
    padding: 10,
    borderRadius: 5,
    width: '45%',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10, 
  },
  button2: {
    backgroundColor: 'rgba(12, 192, 223, 0.5)',
    padding: 10,
    borderRadius: 5,
    width: '45%',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10, 
  },
  
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
  buttonText2: {
    color: '#fff',
    fontSize: 16,
  },

  button7: {
    backgroundColor: '#0CC0DF',
    height: 30,
    borderRadius: 5,
    width: '45%',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10, 
  },
  button8: {
    backgroundColor: '#C0C0C0',
    height: 30,
    borderRadius: 5,
    width: '45%',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10, 
  },

  buttonText7: {
    color: 'white',
    fontSize: 14,
    fontFamily: 'Poppins-Medium'
  },

  buttonText8: {
    color: 'red',
    fontSize: 14,
    fontFamily: 'Poppins-Medium'
  },
});

export default DRNotif;
