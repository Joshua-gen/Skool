import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet } from 'react-native';
import { auth, firestore } from '../Config'; // Adjust the path as needed
import { registerForPushNotificationsAsync, savePushTokenToFirestore } from '../service/Notifications'; // Assuming these utility functions exist

const AdminLogin = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    try {
      const userCredential = await auth.signInWithEmailAndPassword(email, password);
      const user = userCredential.user;

      const userDoc = await firestore.collection('users').doc(user.uid).get();

      if (userDoc.exists) {
        if (userDoc.data().userType === 'Admin') {
          navigation.navigate('AdminDashboard'); // Navigate to the admin screen
        } else {
          Alert.alert('Access Denied', 'You are not an admin.');
          await auth.signOut(); // Sign out the non-admin user
        }
        // Register push notification token after login
      const pushToken = await registerForPushNotificationsAsync();
      if (pushToken) {
        await savePushTokenToFirestore(user.uid, pushToken);
      }

      } else {
        Alert.alert('User Not Found', 'No user data found in Firestore.');
        await auth.signOut(); // Sign out the user
      }
    } catch (error) {
      Alert.alert('Login Error', error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Admin Login</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <Button title="Login" onPress={handleLogin} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fdf2f3',
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
  },
  input: {
    width: '80%',
    padding: 10,
    marginVertical: 10,
    borderBottomWidth: 1,
    borderColor: '#ccc',
  },
});

export default AdminLogin;
