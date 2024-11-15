import { useEffect, useState } from 'react';
import * as Notifications from 'expo-notifications';

const NotificationHandler = () => {
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    const notificationListener = Notifications.addNotificationReceivedListener(notification => {
      // console.log('Notification received:', notification);
      setNotification(notification);  // Update state when a notification is received
    });

    const responseListener = Notifications.addNotificationResponseReceivedListener(response => {
      // console.log('Notification response:', response);
    });

    return () => {
      Notifications.removeNotificationSubscription(notificationListener);
      Notifications.removeNotificationSubscription(responseListener);
    };
  }, []);

  return notification; // Return the notification state
};

export default NotificationHandler;


