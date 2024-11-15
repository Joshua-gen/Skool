import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableHighlight, TextInput, Switch, Alert, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { auth, firestore } from '../Config'; // Ensure the correct path to your Config.js
import { registerForPushNotificationsAsync, savePushTokenToFirestore } from '../service/Notifications'; // Assuming these utility functions exist
import { Ionicons } from '@expo/vector-icons';

const Login = ({ navigation }) => {
  const [isDriver, setIsDriver] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);

  const toggleSwitch = () => setIsDriver(previousState => !previousState);


  // Login function
  // Login function
  const handleLogin = async () => {
    setLoading(true);
    try {
      const userCredential = await auth.signInWithEmailAndPassword(email, password);
      const user = userCredential.user;
  
      const userDoc = await firestore.collection('users').doc(user.uid).get();
      const userData = userDoc.data();
      const userType = userData.userType;
      const isVerified = userData.isVerified;
      const isBlocked = userData.isBlocked;
  
      // Check if the user is blocked
      if (isBlocked) {
        Alert.alert('Login Error', 'Your account is blocked. Please contact support.');
        auth.signOut();
        setLoading(false);
        return; // Prevent further execution
      }
  
      // Register push notification token after login
      const pushToken = await registerForPushNotificationsAsync();
      if (pushToken) {
        await savePushTokenToFirestore(user.uid, pushToken);
      }
  
      // Check if the user is a driver and wants to log in as a driver
      if (userType === 'Driver' && isDriver) {
          navigation.navigate('Drawer2'); // Navigate to driver view
      } 
      // Allow driver to log in as a passenger
      else if (userType === 'Driver' && !isDriver) {
        navigation.navigate('Drawer1'); // Navigate to passenger view 
      }
      // Regular passenger login
      else if (userType === 'Passenger' && !isDriver) {
        navigation.navigate('Drawer1'); // Navigate to passenger view
      } 
      // Handle login error
      else {
        Alert.alert('Login Error', 'Kindly check your login screen.');
        auth.signOut();
      }
    } catch (error) {
      console.error('Login Error:', error);
      Alert.alert('Login Error', error.message);
    } finally {
      setLoading(false);
    }
  };
  


  // Password reset function
  const handlePasswordReset = async () => {
    if (!email) {
      Alert.alert('Reset Password', 'Please enter your email address.');
      return;
    }

    try {
      await auth.sendPasswordResetEmail(email);
      Alert.alert('Reset Password', 'A password reset link has been sent to your email address.');
    } catch (error) {
      console.error('Password Reset Error:', error);
      Alert.alert('Password Reset Error', error.message);
    }
    
  };

  return (
    <View style={styles.container}>
      <View style={{flexDirection: 'row', justifyContent: 'space-between', height: 50, alignItems: 'center', width: '95%', }}>
        <TouchableOpacity
          onPress={() => navigation.navigate('GetStarted')}
        >
          <Ionicons name="arrow-back-circle" size={40} color="white" />
        </TouchableOpacity>
        <View style={{ height: 50, flexDirection: 'row', alignItems: 'center', width: 130, justifyContent: 'space-between' }}>
          <Text style={{ fontFamily: 'Poppins-Regular', color: 'white', fontSize: 15, fontWeight: 'bold' }}>{isDriver ? 'Driver Mode' : 'Passenger'}</Text>
          <Switch
            trackColor={{ false: '#767577', true: '#81b0ff' }}
            thumbColor={isDriver ? 'black' : '#f4f3f4'}
            onValueChange={toggleSwitch}
            value={isDriver}
            style={styles.switch}
          />
        </View>
      </View>
      <View style={{width: '100%', alignItems: 'center', justifyContent: 'center'}}>
        <Image
          style={{ width: 100, height: 100 }}
          source={require('../assets/Skool-Logo.png')}
        />

        <View style={{ justifyContent: 'center', alignItems: 'center', width: '100%', height: 'auto' }}>
          <Text style={{ fontFamily: 'Shrikhand-Regular', fontSize: 60, color: 'white' }}>Sign In</Text>
          <View style={{ justifyContent: 'center', alignItems: 'center', width: '90%', height: 'auto', backgroundColor: 'white', borderRadius: 15 }}>
            <TextInput
              style={styles.input}
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.inputPassword}
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Ionicons name={showPassword ? 'eye' : 'eye-off'} size={24} color="#A98D8D" />
              </TouchableOpacity>
            </View>
            
            {loading ? (
              <TouchableOpacity
                style={styles.button}
              >
                <ActivityIndicator size="small" color="white" style={{marginTop: 2.5, marginBottom: 2.5}}/>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                onPress={handleLogin}
                style={styles.button}
              >
                <Text style={styles.buttonText}>Login</Text>
              </TouchableOpacity>
            )}

            <TouchableHighlight
              onPress={handlePasswordReset}
              style={{ marginLeft: '40%', marginTop: '10%' }}
            >
              <Text style={{ color: '#0CC0DF', fontSize: 16, textDecorationLine: 'underline', fontWeight: 'bold' }}>
                Forgot Password
              </Text>
            </TouchableHighlight>

            <View style={{ justifyContent: 'center', alignItems: 'center', marginTop: '5%', marginBottom: '5%' }}>
              <Text style={{ fontSize: 16, color: '#A98D8D' }}>Don't have an Account?</Text>

              <TouchableHighlight
                onPress={() => navigation.navigate('Signup')}
                style={{}}
              >
                <Text style={{ color: '#0CC0DF', fontSize: 16, fontWeight: 'bold' }}>Sign-Up</Text>
              </TouchableHighlight>
            </View>

          </View>
        </View>
      </View>
      <View>
        <TouchableOpacity
          style={{marginTop: 30}}
          onPress={() => navigation.navigate('AdminLogin')}
        >
          <Text style={{ fontSize: 16, color: 'white' }}>Login as Admin</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0CC0DF',
    alignItems: 'center',
   
  },
  input: {
    width: '90%',
    padding: 10,
    borderColor: '#0CC0DF',
    borderWidth: 1,
    borderRadius: 5,
    marginTop: 20,
  },
  passwordContainer: {
    flexDirection: 'row',
    width: '90%',
    alignItems: 'center',
    borderColor: '#0CC0DF',
    borderWidth: 1,
    borderRadius: 5,
    marginTop: 20,
    paddingRight: 10,
  },
  inputPassword: {
    flex: 1,
    padding: 10,
  },
  
  button: {
    backgroundColor: '#0CC0DF',
    padding: 10,
    borderRadius: 5,
    width: '90%',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'Poppins-Regular',
  },
});

export default Login;
