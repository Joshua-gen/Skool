import { firestore } from '../Config'; // Ensure this imports the Firestore instance correctly

// Function to create a notification in the Notifications collection
{/*export const createNotification = async (recipientId, title, message, additionalData = {}) => {
  try {
    await firestore
      .collection('Notifications') // Access the Notifications collection
      .add({
        recipientId,  // The user who will receive the notification
        title,        // Title of the notification (e.g., 'Ride Request')
        message,      // Notification message (e.g., 'Your ride request has been accepted')
        read: false,  // Indicates if the notification has been read or not
        timestamp: new Date(), // Timestamp when the notification was created
        ...additionalData,  // Any additional data you want to store
      });
    console.log('Notification sent successfully');
  } catch (error) {
    console.error('Error sending notification:', error);
  }
};*/}

// Function to create a notification in the Notifications collection
export const createNotification = async (recipientId, title, message, additionalData = {}) => {
    try {
      console.log('Creating notification...'); // Debugging line
      const notificationData = {
        recipientId,  // The user who will receive the notification
        title,        // Title of the notification (e.g., 'Ride Request')
        message,      // Notification message (e.g., 'Your ride request has been accepted')
        read: false,  // Indicates if the notification has been read or not
        timestamp: new Date(), // Timestamp when the notification was created
        ...additionalData,  // Any additional data you want to store
      };
  
      console.log('Notification data:', notificationData); // Log the data being sent
  
      await firestore.collection('Notifications').add(notificationData);
      
      console.log('Notification sent successfully');
    } catch (error) {
      console.error('Error sending notification:', error);
    }
  };
  
