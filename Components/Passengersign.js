import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, TouchableHighlight, TextInput, Alert, Image, TouchableOpacity } from 'react-native';
import { auth, firestore, storage } from '../Config'; // Ensure the correct path to your Config.js
import { registerForPushNotificationsAsync, savePushTokenToFirestore } from '../service/Notifications'; // Assuming these utility functions exist
import { Picker } from '@react-native-picker/picker';
import { Ionicons } from '@expo/vector-icons';
import DashedLine from '../assets/DashedLine';

import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

const Passengersign = ({ navigation }) => {
  // Inputs
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [mobileNo, setMobileNo] = useState('');
  const [idNumber, setIdNumber] = useState('');

  // combo box
  const [selectedInstitution, setSelectedInstitution] = useState('');
  const [selectedGender, setSelectedGender] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedYear, setSelectedYear] = useState('');

  // Screen
  const [currentStep, setCurrentStep] = useState(1);

  // Errors
  const [errors, setErrors] = useState({});

  // Validation function
  const validateStep = () => {
    let valid = true;
    let newErrors = {};

    if (currentStep === 1) {
      if (!selectedInstitution) {
        valid = false;
        newErrors.selectedInstitution = 'Institution is required';
      }
      if (!email) {
        valid = false;
        newErrors.email = 'Email is required';
      }
    } else if (currentStep === 2) {
      if (!firstName) {
        valid = false;
        newErrors.firstName = 'First Name is required';
      }
      if (!lastName) {
        valid = false;
        newErrors.lastName = 'Last Name is required';
      }
      if (!mobileNo) {
        valid = false;
        newErrors.mobileNo = 'Mobile Number is required';
      }
      if (!selectedCourse) {
        valid = false;
        newErrors.selectedCourse = 'Course is required';
      }
      if (!selectedYear) {
        valid = false;
        newErrors.selectedYear = 'Year is required';
      }
      if (!selectedGender) {
        valid = false;
        newErrors.selectedGender = 'Gender is required';
      }
      if (!idNumber) {
        valid = false;
        newErrors.idNumber = 'ID Number is required';
      }
      if (!password) {
        valid = false;
        newErrors.password = 'Password is required';
      }
      if (!confirmPassword) {
        valid = false;
        newErrors.confirmPassword = 'Confirm Password is required';
      }
      if (password !== confirmPassword) {
        valid = false;
        newErrors.passwordMatch = 'Passwords do not match';
      }
    }

    setErrors(newErrors);
    return valid;
  };

  // Next Screen Function
  const handleNext = () => {
    if (validateStep()) {
      setCurrentStep(currentStep + 1);
    } else {
      Alert.alert('Validation Error', 'Please fill all the required fields.');
    }
  };

  const handlePrevious = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleSignUp = async () => {
    try {
      console.log('Signing up with:', email, password);
      const userCredential = await auth.createUserWithEmailAndPassword(email, password);
      const user = userCredential.user;

      console.log('User created:', user);

      await user.sendEmailVerification();
      console.log('Email verification sent');

      await firestore.collection('users').doc(user.uid).set({
        institution: selectedInstitution,
        email: user.email,
        userType: 'Passenger',
        firstName: firstName,
        lastName: lastName,
        mobileNo: mobileNo,
        course: selectedCourse,
        year: selectedYear,
        gender: selectedGender,
        idNumber: idNumber,
        isVerified: true, 
        rating: 0,
        ratingCount: 0,
      });

      const pushToken = await registerForPushNotificationsAsync();
      if (pushToken) {
        await savePushTokenToFirestore(user.uid, pushToken);
      }

      console.log('User data written to Firestore');

      Alert.alert('Verification email sent', 'Please check your email to verify your account.');
      navigation.navigate('Login');
    } catch (error) {
      console.error('Sign Up Error:', error);
      Alert.alert('Sign Up Error', error.message);
    }
  };

  return (
    <View style={styles.container}>
      <View style={{ marginTop: '-30%', justifyContent: 'center', alignItems: 'center', width: '100%' }}>
        <Image style={{ width: 100, height: 100 }} source={require('../assets/Skool-Logo.png')} />
        <Text  style={{ fontFamily: 'Shrikhand-Regular', fontSize: 25, color: 'white' }}>Sign up as a Passenger</Text>
        <View style={{ justifyContent: 'center', alignItems: 'center', width: '90%', height: 'auto', backgroundColor: 'white', borderRadius: 15 }}>
        
        {currentStep === 1 && (
            <View style={{ width: '100%', alignItems: 'center' }}>
              <View style={{width:'90%', marginTop: 20, marginBottom: 30, }}>
               <Text style={{textAlign: 'center', fontSize: 18, fontWeight: 500}}>Please choose your Institution and enter your email.</Text>
              </View>
               <View style={[styles.pickercon1, errors.selectedInstitution && { borderColor: 'red' }]}>
                  <Text style={{ fontSize: 12, color: '#0CC0DF', marginLeft: 5, }}>Institution</Text>
                  <Picker
                    selectedValue={selectedInstitution}
                    style={styles.picker1}
                    onValueChange={(itemValue, itemIndex) => setSelectedInstitution(itemValue)}
                  >
                    <Picker.Item label="STI West Negros University" value="STI West Negros University" />
                  </Picker>
                </View>

              <TextInput
                style={[styles.input, errors.email && { borderColor: 'red' }]}
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
              <TouchableOpacity style={styles.button} onPress={handleNext}>
                <Text style={styles.buttonText}>Submit</Text>
              </TouchableOpacity>
            </View>
          )}

          {currentStep === 2 && (
            <View style={{ width: '100%', alignItems: 'center' }}>
              <View style={{width:'90%', marginTop: 20, alignItems: 'center' }}>
                <View style={{width: '100%', flexDirection: 'row', alignItems: 'center',justifyContent: 'center', }}>
                  <Ionicons name="radio-button-on" size={24} color="#0CC0DF" />
                  <DashedLine color="black" width="73%" height={5} dashArray={[2, 2]} />
                  <Ionicons name="radio-button-off-outline" size={24} color="#0CC0DF" />
                </View>
                <View style={{alignItems: 'center', justifyContent: 'space-between', width: '90%' , flexDirection: 'row',}}>
                  <Text style={{fontSize: 10 , color: '#0CC0DF' }}>User Info</Text>
                  <Text style={{fontSize: 10}}>Done</Text>
                </View>
              </View>

              <View style={{height: 70, width: '90%', alignItems: 'center', justifyContent: 'center', borderBottomColor: 'black', borderBottomWidth: 3}}>
                <View style={{width: '65%', backgroundColor: '#D9D9D9', borderRadius: 5}}>
                  <Text style={{textAlign: 'center', fontSize: 12}}>Please provide the requested info below</Text>
                </View>
              </View>

              <TextInput
                style={[styles.input, errors.firstName && { borderColor: 'red' }]}
                placeholder="First Name"
                value={firstName}
                onChangeText={setFirstName}
              />
              
              <TextInput
                style={[styles.input, errors.lastName && { borderColor: 'red' }]}
                placeholder="Last Name"
                value={lastName}
                onChangeText={setLastName}
              />
              
              <TextInput
                style={[styles.input, errors.mobileNo && { borderColor: 'red' }]}
                placeholder="Mobile No."
                value={mobileNo}
                onChangeText={setMobileNo}
                keyboardType="numeric"
              />
            
              <View style={{ flexDirection: 'row' }}>
                <View style={[styles.pickercon, errors.selectedCourse && { borderColor: 'red' }]}>
                  <Text style={{ fontSize: 12, color: '#0CC0DF', marginLeft: 5, marginTop: -10 }}>Course</Text>
                  <Picker
                    selectedValue={selectedCourse}
                    style={styles.picker}
                    onValueChange={(itemValue, itemIndex) => setSelectedCourse(itemValue)}
                  >
                    <Picker.Item label="BSIT" value="BSIT" />
                    <Picker.Item label="BSCS" value="BSCS" />
                  </Picker>
                </View>
              

                <View style={[styles.pickercon2, errors.selectedYear && { borderColor: 'red' }]}>
                  <Text style={{ fontSize: 12, color: '#0CC0DF', marginLeft: 5, marginTop: -10 }}>Year</Text>
                  <Picker
                    selectedValue={selectedYear}
                    style={styles.picker}
                    onValueChange={(itemValue, itemIndex) => setSelectedYear(itemValue)}
                  >
                    <Picker.Item label="1st Year" value="1st Year" />
                    <Picker.Item label="2nd Year" value="2nd Year" />
                    <Picker.Item label="3rd Year" value="3rd Year" />
                    <Picker.Item label="4th Year" value="4th Year" />
                  </Picker>
                </View>
                
              </View>

              <View style={{ flexDirection: 'row' }}>
                <View style={[styles.pickercon, errors.selectedGender && { borderColor: 'red' }]}>
                  <Text style={{ fontSize: 12, color: '#0CC0DF', marginLeft: 5, marginTop: -10 }}>Gender</Text>
                  <Picker
                    selectedValue={selectedGender}
                    style={styles.picker}
                    onValueChange={(itemValue, itemIndex) => setSelectedGender(itemValue)}
                  >
                    <Picker.Item label="Male" value="Male" />
                    <Picker.Item label="Female" value="Female" />
                  </Picker>
                </View>
               

                <TextInput
                  style={[styles.input, { width: '43.5%', marginLeft: 10, padding: 10, borderColor: '#0CC0DF', borderWidth: 1, borderRadius: 5, marginTop: 15 }, errors.idNumber && { borderColor: 'red' }]}
                  placeholder="ID No. "
                  value={idNumber}
                  onChangeText={setIdNumber}
                />
               
              </View>

              <TextInput
                style={[styles.input, errors.confirmPassword && { borderColor: 'red' }]}
                placeholder="Confirm Password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
              />
              {errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword}</Text>}
              {errors.passwordMatch && <Text style={styles.errorText}>{errors.passwordMatch}</Text>}

              <TextInput
                style={[styles.input, errors.password && { borderColor: 'red' }]}
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
              {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
              
              <TouchableOpacity style={styles.button} onPress={() => { handleSignUp(); handleNext(); }} >
                <Text style={styles.buttonText}>Done</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.button} onPress={handlePrevious}>
                <Text style={styles.buttonText}>Back</Text>
              </TouchableOpacity>
            </View>
          )}

          {currentStep === 3 && (
           <View style={{ width: '100%', alignItems: 'center' }}>
              <View style={{width:'90%', marginTop: 20, alignItems: 'center', marginBottom: 15 }}>
                <View style={{width: '100%', flexDirection: 'row', alignItems: 'center',justifyContent: 'center', }}>
                  <Ionicons name="radio-button-on" size={24} color="#0CC0DF" />
                  <DashedLine color="#0CC0DF" width="73%" height={5} dashArray={[2, 2]} />
                  <Ionicons name="radio-button-on" size={24} color="#0CC0DF" />
                </View>
                <View style={{alignItems: 'center', justifyContent: 'space-between', width: '90%' , flexDirection: 'row',}}>
                  <Text style={{fontSize: 10 , color: '#0CC0DF' }}>User Info</Text>
                  <Text style={{fontSize: 10}}>Done</Text>
                </View>
              </View>

              <View style={{height: 50, width: '70%', backgroundColor: '#D9D9D9', borderRadius: 5, alignItems: 'center', justifyContent: 'center',}}>
                <View style={{width: '90%', }}>
                  <Text style={{textAlign: 'center', fontSize: 12}}>Please kindly check your email, we sent verification for your account.</Text>
                </View>
              </View>

            <View style={{height: 150, width: '90%', justifyContent: 'center', alignItems: 'center', borderTopWidth: 3, marginTop: 10}}>
              <MaterialCommunityIcons name="check-decagram" size={80} color="#0CC0DF" />
              <Text style={{fontFamily:'Shrikhand-Regular', fontSize: 24}}>You're In!</Text>
            </View>
              <Image
                style={{width: 290, height: 290, borderRadius: 10, marginTop: 15, marginBottom: 15 }}
                source={require('../assets/Pass_Done.png')}
              />
              <TouchableHighlight  
                style={styles.button}
                onPress={() => navigation.navigate('Login')}
              >
                <Text style={styles.buttonText}>Proceed</Text>
              </TouchableHighlight>
             
           </View>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0CC0DF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    width: '90%',
    padding: 10,
    borderColor: '#0CC0DF',
    borderWidth: 1,
    borderRadius: 5,
    marginTop: 15,
  },
  picker: {
    color: "#A9A9A9",
    fontSize: 12,
    width: '100%',
    marginTop: -7,
  },

  picker1: {
    color: "#A9A9A9",
    fontSize: 12,
    width: '100%',
    marginTop: -15,
  },
  
  
  pickercon1: {
    width: '90%', 
    height: 30, 
    borderColor: '#0CC0DF', 
    borderWidth: 1, 
    borderRadius: 5, 
    marginTop: 15, 
    justifyContent: 'center'
 },

  pickercon: {
     width: '43.5%', 
     height: 50, 
     borderColor: '#0CC0DF', 
     borderWidth: 1, 
     borderRadius: 5, 
     marginTop: 15, 
     justifyContent: 'center'
  },
  pickercon2: {
    marginLeft: 10 ,
    width: '43.5%', 
    height: 50, 
    borderColor: '#0CC0DF', 
    borderWidth: 1, 
    borderRadius: 5, 
    marginTop: 15, 
    justifyContent: 'center'
 },

 documentCon:{
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    borderTopColor: 'black', 
    borderTopWidth: 2, 
    width: '90%', 
    height: 50,
 },
 
  button: {
    backgroundColor: '#0CC0DF',
    padding: 10,
    borderRadius: 5,
    width: '90%',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 15,
  },

  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold'
  },
  title: {
    fontFamily: 'Shrikhand',
    fontSize: 60,
  },

  
});

export default Passengersign;
