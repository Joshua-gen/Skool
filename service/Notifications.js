import { Text, View, Button, Platform } from 'react-native'; 
import { firestore } from '../Config'; // Import Firestore configuration
import * as Notifications from 'expo-notifications'; // Import Expo Notifications API
import * as Device from 'expo-device'; // Import Expo Device API for device-specific checks
import Constants from 'expo-constants'; // Import Expo Constants for configuration info
import { useState, useEffect, useRef } from 'react'; // Import React hooks

// Set up notification handler for foreground and background notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,  // Ensure notification shows an alert (foreground)
    shouldPlaySound: true,  // Ensure notification sound is played
    shouldSetBadge: true,   // Update the app badge (iOS only)
  }),
});

// Function to register for push notifications
export async function registerForPushNotificationsAsync() {
  // For Android, create a notification channel to manage notification settings
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Skool', // Name of the channel
      importance: Notifications.AndroidImportance.MAX, // Set importance level to max
      vibrationPattern: [0, 250, 250, 250], // Vibration pattern for notifications
      lightColor: '#FF231F7C', // Light color for notification on Android devices
      icon: '../assets/Skool-Logo.png', // Path to your custom icon
    });
  }

  // Check if running on a physical device
  if (Device.isDevice) {
    // Get current permissions for notifications
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    // If permissions are not granted, request them
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    // If permissions are still not granted, return an error
    if (finalStatus !== 'granted') {
      console.error('Permission not granted to get push token for push notification!');
      return;
    }

    // Get the Expo project ID
    const projectId = 
      Constants.expoConfig?.extra?.eas?.projectId || // Fetch project ID from Expo config
      Constants.easConfig?.projectId || 
      'be16ed4c-e820-4707-b826-7be7b40b8ed0'; // Default project ID (replace with your own)

    if (!projectId) {
      console.error('Project ID not found');
      return;
    }

    try {
      // Get the Expo push token for this device
      const pushToken = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
      console.log('Push Token:', pushToken); // Log the push token
      return pushToken; // Return the token for use
    } catch (error) {
      console.error('Error fetching push token:', error); // Log any error in fetching the token
    }
  } else {
    console.error('Must use a physical device for push notifications'); // Error if running on a simulator
  }
}

// Function to save the push token to Firestore for a specific user
export async function savePushTokenToFirestore(userId, token) {
  try {
    // Get the user's document from Firestore
    const userDoc = await firestore.collection('users').doc(userId).get();

    // Check if the user document exists and if it has a push token
    if (userDoc.exists) {
      const userData = userDoc.data();
      if (userData.expoPushToken && userData.expoPushToken === token) {
        console.log('Push token already exists');
        return; // Token already exists, no need to save
      }
    }
    
    // Save the push token under the user's document in Firestore (if it's new)
    await firestore.collection('users').doc(userId).set({ expoPushToken: token }, { merge: true });
    console.log('Push token saved to Firestore'); // Confirm token saved

  } catch (error) {
    console.error('Error saving push token:', error); // Log any error
  }
}


// Function to fetch user data from Firestore
export async function fetchUserCollection(userId) {
  try {
    // Fetch the user's document from the 'users' collection in Firestore
    const userDoc = await firestore.collection('users').doc(userId).get();
    if (userDoc.exists) {
      return userDoc.data(); // Return user data if found
    } else {
      console.error('No such user found'); // Error if user document does not exist
      return null;
    }
  } catch (error) {
    console.error('Error fetching user:', error); // Log any error
    return null;
  }
}

// Function to send a push notification to a specific device
export async function sendPushNotification(token, title, body, data = {}) {
  // Create a message object for the notification
  const message = {
    to: token, // Target device's push token
    sound: 'default', // Default sound for notification
    title, // Notification title
    body, // Notification body text
    data, // Additional data sent with the notification
  };

  try {
    // Send the notification using Expo's push notification API
    const response = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST', // HTTP method for sending data
      headers: {
        Accept: 'application/json', // Accept JSON response
        'Accept-Encoding': 'gzip, deflate', // Enable compression
        'Content-Type': 'application/json', // Set content type as JSON
      },
      body: JSON.stringify(message), // Convert message object to JSON string
    });
     console.log('Notification response:', await response.json()); // Log response from API
  } catch (error) {
    console.error('Error sending notification:', error); // Log any error in sending
  }
}

// Function to notify a driver when a passenger requests a ride
export async function notifyDriverOfRideRequest(driverId, rideRequest) {
  try {
    // Fetch driver data using their ID
    const driverData = await fetchUserCollection(driverId);
    if (driverData?.expoPushToken) {
      // If the driver has a push token, send a notification
      const title = 'New Ride Request';
      const body = `You have a new ride request from ${rideRequest.firstName} ${rideRequest.lastName}`;
      await sendPushNotification(driverData.expoPushToken, title, body, rideRequest);
    } else {
      console.log('Driver not found or has no push token'); // Log if no token found
    }
  } catch (error) {
    console.error('Error notifying driver:', error); // Log any error in notifying driver
  }
}

// Function to notify a driver arrive to pick up location 
export async function notifyDriverForArrival(driverId, rideRequest) {
  try {
    // Fetch driver data using their ID
    const driverData = await fetchUserCollection(driverId);
    if (driverData?.expoPushToken) {
      // If the driver has a push token, send a notification
      const title = 'Passenger Arrived';
      const body = `Your passenger has arrived - ${rideRequest.passengerName}`;
      await sendPushNotification(driverData.expoPushToken, title, body, rideRequest);
    } else {
      console.log('Driver not found or has no push token'); // Log if no token found
    }
  } catch (error) {
    console.error('Error notifying driver:', error); // Log any error in notifying driver
  }
}

// Function to notify a passenger for ride cancelation
export async function notifyPassengerForCancelation(passengerId, requestData) {
  try {
    // Fetch passenger data using their ID
    const passengerData = await fetchUserCollection(passengerId);
    if (passengerData?.expoPushToken) {
      // If the passenger has a push token, send a notification
      const title = 'Ride Cancelation';
      const body = `Your driver ${requestData.driverName} has canceled the ride.`;
      await sendPushNotification(passengerData.expoPushToken, title, body, requestData);
    } else {
      console.log('Passenger not found or has no push token'); // Log if no token found
    }
  } catch (error) {
    console.error('Error notifying passenger:', error); // Log any error in notifying passenger
  }
}

// Function to notify a passenger for seat cancelation
export async function notifyPassengerForSeatCancelation(passengerId, requestData) {
  try {
    // Fetch passenger data using their ID
    const passengerData = await fetchUserCollection(passengerId);
    if (passengerData?.expoPushToken) {
      // If the passenger has a push token, send a notification
      const title = 'Seat Cancelation ';
      const body = `Your occupied seat has been canceled by ${requestData.driverName} - Driver`;
      await sendPushNotification(passengerData.expoPushToken, title, body, requestData);
    } else {
      console.log('Passenger not found or has no push token'); // Log if no token found
    }
  } catch (error) {
    console.error('Error notifying passenger:', error); // Log any error in notifying passenger
  }
}

// Function to notify a passenger when their ride request is accepted
export async function notifyPassengerOfRequestAcceptance(passengerId, requestData) {
  try {
    // Fetch passenger data using their ID
    const passengerData = await fetchUserCollection(passengerId);
    if (passengerData?.expoPushToken) {
      // If the passenger has a push token, send a notification
      const title = 'Ride Request Accepted ';
      const body = `Your ride request has been accepted by ${requestData.driverName}`;
      await sendPushNotification(passengerData.expoPushToken, title, body, requestData);
    } else {
      console.log('Passenger not found or has no push token'); // Log if no token found
    }
  } catch (error) {
    console.error('Error notifying passenger:', error); // Log any error in notifying passenger
  }
}

export async function notifyPassengerOfRequestRejected(passengerId, requestData) {
  try {
    // Fetch passenger data using their ID
    const passengerData = await fetchUserCollection(passengerId);

    if (passengerData?.expoPushToken) {
      // If the passenger has a push token, send a notification
      const title = 'Ride Request Rejected';
      const body = `Your ride request has been rejected by ${requestData.driverName}`; // Use requestData instead of rideData
      await sendPushNotification(passengerData.expoPushToken, title, body, userData);
    } else {
      console.log('Passenger not found or has no push token'); // Log if no token found
    }
  } catch (error) {
    console.error('Error notifying passenger:', error); // Log any error in notifying passenger
  }
}

// Function to notify a driver for account rejection
export async function notifyAdminForDocumentUpdate(userId, userData) {
  try {
    // Fetch driver data using their ID
    const driverData = await fetchUserCollection(userId);
    if (driverData?.expoPushToken) {
      // If the driver has a push token, send a notification
      const title = 'Driver Applicant';
      const body = `Driver Document Updated - ${userData.firstName} ${userData.lastName}`;
      await sendPushNotification(driverData.expoPushToken, title, body, userData);
    } else {
      console.log('Driver not found or has no push token'); // Log if no token found
    }
  } catch (error) {
    console.error('Error notifying driver:', error); // Log any error in notifying driver
  }
}

//admin
// Function to notify a driver for account verification
export async function notifyDriverOfAccountVerification(userId, rideRequest) {
  try {
    // Fetch driver data using their ID
    const driverData = await fetchUserCollection(userId);
    if (driverData?.expoPushToken) {
      // If the driver has a push token, send a notification
      const title = 'Admin';
      const body = `Good day! Your account has been verified by admin. Thank you for your patience.`;
      await sendPushNotification(driverData.expoPushToken, title, body, rideRequest);
    } else {
      console.log('Driver not found or has no push token'); // Log if no token found
    }
  } catch (error) {
    console.error('Error notifying driver:', error); // Log any error in notifying driver
  }
}

//admin
// Function to notify a driver for account rejection
export async function notifyDriverOfAccountRejection(userId, rideRequest) {
  try {
    // Fetch driver data using their ID
    const driverData = await fetchUserCollection(userId);
    if (driverData?.expoPushToken) {
      // If the driver has a push token, send a notification
      const title = 'Admin';
      const body = `Your acccount verification has been rejected by the admin, Please proceed to the Account status screen located in your Profile screen.`;
      await sendPushNotification(driverData.expoPushToken, title, body, rideRequest);
    } else {
      console.log('Driver not found or has no push token'); // Log if no token found
    }
  } catch (error) {
    console.error('Error notifying driver:', error); // Log any error in notifying driver
  }
}

// Main component that listens for notifications
export default function App() {
  const [expoPushToken, setExpoPushToken] = useState(''); // State to store push token
  const [notification, setNotification] = useState(undefined); // State to store received notifications
  const notificationListener = useRef(); // Ref for notification listener
  const responseListener = useRef(); // Ref for notification response listener

  useEffect(() => {
    // Register for push notifications and save the token
    registerForPushNotificationsAsync()
      .then(token => {
        if (token) setExpoPushToken(token); // Save the token in state
      })
      .catch(error => console.error('Error getting push token:', error)); // Log any error

    // Listener for receiving notifications while the app is open
    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      setNotification(notification); // Update notification state
      console.log('Notification received:', notification); // Log received notification
    });

    // Listener for handling user interaction with notifications
    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Notification response received:', response); // Log response
    });

    // Cleanup listeners when component unmounts
    return () => {
      Notifications.removeNotificationSubscription(notificationListener.current);
      Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, []); // Empty dependency array to run effect once on mount

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'space-around' }}>
      <Text>Your Expo push token: {expoPushToken}</Text> 
      <View style={{ alignItems: 'center', justifyContent: 'center' }}>
        
        <Text>Title: {notification?.request?.content?.title}</Text>
        <Text>Body: {notification?.request?.content?.body}</Text>
        <Text>Data: {notification ? JSON.stringify(notification.request.content.data) : ''}</Text>
      </View>
     
      <Button
        title="Press to Send Notification"
        onPress={async () => {
          await sendPushNotification(expoPushToken, 'Test Title', 'This is a test notification');
        }}
      />
    </View>
  );
}
