import React, { useEffect, useState } from 'react';
import {  ScrollView ,StyleSheet, View, Text, TouchableHighlight, TextInput, Alert, Image, TouchableOpacity, } from 'react-native';
import { auth, firestore, storage } from '../Config'; // Ensure the correct path to your Config.js
import { registerForPushNotificationsAsync, savePushTokenToFirestore } from '../service/Notifications'; // Assuming these utility functions exist
import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import DashedLine from '../assets/DashedLine';

import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';


const Driversign = ({ navigation }) => {

  const [images, setImages] = useState({
    formalPhoto: null,
    universityIDfront: null,
    universityIDback: null,
    driversLicenseFront: null,
    driversLicenseBack: null,
    oR: null,
    cR: null,
    vehicleFront: null,
    vehicleBack: null,
    vehicleLeft: null,
    vehicleRight: null,
    vehicleUpper: null,
    policeClear: null,
    nbiClear: null,

  });

  const [imageNames, setImageNames] = useState({
    formalPhoto: null,
    universityIDfront: null,
    universityIDback: null,
    driversLicenseFront: null,
    driversLicenseBack: null,
    oR: null,
    cR: null,
    vehicleFront: null,
    vehicleBack: null,
    vehicleLeft: null,
    vehicleRight: null,
    vehicleUpper: null,
    policeClear: null,
    nbiClear: null,

  });

  //upload status
  const [uploadStatus, setUploadStatus] = useState({
    formalPhoto: false,
    universityIDfront: null,
    universityIDback: null,
    driversLicenseFront: null,
    driversLicenseBack: null,
    oR: null,
    cR: null,
    vehicleFront: null,
    vehicleBack: null,
    vehicleLeft: null,
    vehicleRight: null,
    vehicleUpper: null,
    policeClear: null,
    nbiClear: null,

  });


  // Inputs
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [mobileNo, setMobileNo] = useState('');
  const [idNumber, setIdNumber] = useState('');
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [yearModel, setYearModel] = useState('');
  const [plateNo, setPlateNo] = useState('');
  const [vehicleColor, setVehicleColor] = useState('');

  // combo box
  const [selectedInstitution, setSelectedInstitution] = useState('');
  const [selectedGender, setSelectedGender] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedVehicleClass, setSelectedVehicleClass] = useState('');

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
    } else if (currentStep === 3) {
      if (!selectedVehicleClass) {
        valid = false;
        newErrors.selectedVehicleClass = 'Vehicle Classification is required';
      }
      if (!brand) {
        valid = false;
        newErrors.brand = 'Brand is required';
      }
      if (!model) {
        valid = false;
        newErrors.model = 'Model is required';
      }
      if (!yearModel) {
        valid = false;
        newErrors.yearModel = 'Year Model is required';
      }
      if (!plateNo) {
        valid = false;
        newErrors.plateNo = 'Plate Number is required';
      }
      if (!vehicleColor) {
        valid = false;
        newErrors.vehicleColor = 'Vehicle Color is required';
      }
    } else if (currentStep === 4) {
      if (!images.vehicleFront) {
        valid = false;
        newErrors.vehicleFront = 'Vehicle Images are required';
      }
      if (!images.vehicleBack) {
        valid = false;
        newErrors.vehicleBack = 'Vehicle Images are required';
      }
      if (!images.vehicleLeft) {
        valid = false;
        newErrors.vehicleLeft = 'Vehicle Images are required';
      }
      if (!images.vehicleRight) {
        valid = false;
        newErrors.vehicleRight = 'Vehicle Images are required';
      }
      if (!images.vehicleUpper) {
        valid = false;
        newErrors.vehicleUpper = 'Vehicle Images are required';
      }
    } else if (currentStep === 5) {
      if (!images.formalPhoto) {
        valid = false;
        newErrors.formalPhoto = 'Formal Photo is required';
      }
      if (!images.universityIDfront) {
        valid = false;
        newErrors.universityIDfront = 'University ID is required';
      }
      if (!images.universityIDback) {
        valid = false;
        newErrors.universityIDback = 'University ID is required';
      }
      if (!images.driversLicenseFront) {
        valid = false;
        newErrors.driversLicenseFront = 'Driver\'s License is required';
      }
      if (!images.driversLicenseBack) {
        valid = false;
        newErrors.driversLicenseBack = 'Driver\'s License is required';
      }
      if (!images.oR) {
        valid = false;
        newErrors.oR = 'OR and CR are required';
      }
      if (!images.cR) {
        valid = false;
        newErrors.cR = 'OR and CR are required';
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

  const pickImage = async (type) => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });
  
    if (!result.canceled) {
      const uri = result.assets[0].uri;
      setImages({ ...images, [type]: uri });
      setImageNames({ ...imageNames, [type]: uri.split('/').pop() });
      setUploadStatus((prevStatus) => ({
        ...prevStatus,
        [type]: true, // Fixed here
      }));
    }
  };

  const uploadImage = async (uri, imageName) => {
    const response = await fetch(uri);
    const blob = await response.blob();
    const ref = storage.ref().child(`images/${imageName}`);
    await ref.put(blob);
    return await ref.getDownloadURL();
  };

  const handleSignUp = async () => {
    try {
      console.log('Signing up with:', email, password);
      const userCredential = await auth.createUserWithEmailAndPassword(email, password);
      const user = userCredential.user;

      console.log('User created:', user);

      await user.sendEmailVerification();
      console.log('Email verification sent');

      const imageUrls = {};
      for (const [key, uri] of Object.entries(images)) {
        if (uri) {
          const imageUrl = await uploadImage(uri, imageNames[key]);
          imageUrls[key] = imageUrl;
        }
      }

      await firestore.collection('users').doc(user.uid).set({
        institution: selectedInstitution,
        email: user.email,
        userType: 'Driver',
        firstName: firstName,
        lastName: lastName,
        mobileNo: mobileNo,
        course: selectedCourse,
        year: selectedYear,
        gender: selectedGender,
        idNumber: idNumber,
        vehicleClass: selectedVehicleClass,
        brand: brand,
        model: model,
        yearModel: yearModel,
        plateNo: plateNo,
        vehicleColor: vehicleColor,
        formalPhoto: imageUrls.formalPhoto,
        universityIDfront: imageUrls.universityIDfront,
        universityIDback: imageUrls.universityIDback,
        driversLicenseFront: imageUrls.driversLicenseFront,
        driversLicenseBack: imageUrls.driversLicenseBack,
        oR: imageUrls.oR,
        cR: imageUrls.cR,
        vehicleFront: imageUrls.vehicleFront,
        vehicleBack: imageUrls.vehicleBack,
        vehicleLeft: imageUrls.vehicleLeft,
        vehicleRight: imageUrls.vehicleRight,
        vehicleUpper: imageUrls.vehicleUpper,
        isVerified: false, 
        rating: 0,
        ratingCount: 0,
      });

       // Register push notification token after login
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
        <Text  style={{ fontFamily: 'Shrikhand-Regular', fontSize: 30, color: 'white' }}>Sign up as a Driver</Text>
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
              <View style={{width:'90%', marginTop: 20,alignItems: 'center' }}>
                <View style={{width: '98%', flexDirection: 'row', alignItems: 'center',justifyContent: 'center', }}>
                  <Ionicons name="radio-button-on" size={24} color="#0CC0DF" />
                  <DashedLine color="black" width="20%" height={5} dashArray={[5, 5]} />
                  <Ionicons name="radio-button-off-outline" size={24} color="#0CC0DF" />
                  <DashedLine color="black" width="22%" height={5} dashArray={[5, 5]} />
                  <Ionicons name="radio-button-off-outline" size={24} color="#0CC0DF" />
                  <DashedLine color="black" width="20%" height={5} dashArray={[5, 5]} />
                  <Ionicons name="radio-button-off-outline" size={24} color="#0CC0DF" />
                </View>
                <View style={{width: '100%', justifyContent: 'center', alignItems: 'center'}}>
                <View style={{alignItems: 'center', justifyContent: 'space-between', width: '92%' , flexDirection: 'row'}}>
                  <Text style={{fontSize: 9 , color: '#0CC0DF' }}>User Info</Text>
                  <Text style={{fontSize: 9}}>Vehicle Info</Text>
                  <Text style={{fontSize: 9}}>Vehicle Images</Text>
                  <Text style={{fontSize: 9}}>Submit</Text>
                </View>
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
              
              <View style={{flexDirection: 'row', width: '90%', marginTop: 15, marginBottom: 20}}>
                <TouchableOpacity style={styles.bckBtn} onPress={handlePrevious}>
                  <Text style={styles.buttonText2}>Back</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.nextBtn} onPress={handleNext}>
                  <Text style={styles.buttonText}>Next</Text>
                </TouchableOpacity>
              </View>

            </View>
          )}

          {currentStep === 3 && (
            <View style={{ width: '100%', alignItems: 'center' }}>
               <View style={{width:'90%', marginTop: 20,alignItems: 'center' }}>
                <View style={{width: '98%', flexDirection: 'row', alignItems: 'center',justifyContent: 'center', }}>
                  <Ionicons name="radio-button-on" size={24} color="#0CC0DF" />
                  <DashedLine color="#0CC0DF" width="20%" height={5} dashArray={[5, 5]} />
                  <Ionicons name="radio-button-on" size={24} color="#0CC0DF" />
                  <DashedLine color="black" width="22%" height={5} dashArray={[5, 5]} />
                  <Ionicons name="radio-button-off-outline" size={24} color="#0CC0DF" />
                  <DashedLine color="black" width="20%" height={5} dashArray={[5, 5]} />
                  <Ionicons name="radio-button-off-outline" size={24} color="#0CC0DF" />
                </View>
                <View style={{width: '100%', justifyContent: 'center', alignItems: 'center'}}>
                <View style={{alignItems: 'center', justifyContent: 'space-between', width: '92%' , flexDirection: 'row'}}>
                  <Text style={{fontSize: 9 , color: '#0CC0DF' }}>User Info</Text>
                  <Text style={{fontSize: 9, color: '#0CC0DF'}}>Vehicle Info</Text>
                  <Text style={{fontSize: 9}}>Vehicle Images</Text>
                  <Text style={{fontSize: 9}}>Submit</Text>
                </View>
                </View>
              </View>

              <View style={{height: 70, width: '90%', alignItems: 'center', justifyContent: 'center', borderBottomColor: 'black', borderBottomWidth: 3}}>
                <View style={{width: '65%', backgroundColor: '#D9D9D9', borderRadius: 5}}>
                  <Text style={{textAlign: 'center', fontSize: 12}}>Please provide the requested info below</Text>
                </View>
              </View>
              
              <View style={[styles.input, { width: '90%', height: 50, justifyContent: 'center' }, errors.selectedVehicleClass && { borderColor: 'red' }]}>
                <Text style={{ fontSize: 12, color: '#0CC0DF', marginLeft: 5, marginTop: -10 }}>Vehicle Classification</Text>
                <Picker
                  selectedValue={selectedVehicleClass}
                  style={styles.picker}
                  onValueChange={(itemValue, itemIndex) => setSelectedVehicleClass(itemValue)}
                >
                  <Picker.Item label="Sedan" value="Sedan" />
                  <Picker.Item label="SUV" value="SUV" />
                  <Picker.Item label="Motorcycle" value="Motorcycle" />
                </Picker>
              </View>
             

              <TextInput
                style={[styles.input, errors.brand && { borderColor: 'red' }]}
                placeholder="Brand"
                value={brand}
                onChangeText={setBrand}
              />
              {errors.brand && <Text style={styles.errorText}>{errors.brand}</Text>}

              <TextInput
                style={[styles.input, errors.model && { borderColor: 'red' }]}
                placeholder="Model"
                value={model}
                onChangeText={setModel}
              />
              {errors.model && <Text style={styles.errorText}>{errors.model}</Text>}

              <TextInput
                style={[styles.input, errors.yearModel && { borderColor: 'red' }]}
                placeholder="Year Model"
                value={yearModel}
                onChangeText={setYearModel}
              />
              {errors.yearModel && <Text style={styles.errorText}>{errors.yearModel}</Text>}

              <TextInput
                style={[styles.input, errors.plateNo && { borderColor: 'red' }]}
                placeholder="Plate No."
                value={plateNo}
                onChangeText={setPlateNo}
              />
              {errors.plateNo && <Text style={styles.errorText}>{errors.plateNo}</Text>}

              <TextInput
                style={[styles.input, errors.vehicleColor && { borderColor: 'red' }]}
                placeholder="Vehicle Color"
                value={vehicleColor}
                onChangeText={setVehicleColor}
              />
              {errors.vehicleColor && <Text style={styles.errorText}>{errors.vehicleColor}</Text>}
              
              <View style={{flexDirection: 'row', width: '90%', marginTop: 15, marginBottom: 20}}>
                <TouchableOpacity style={styles.bckBtn} onPress={handlePrevious}>
                  <Text style={styles.buttonText2}>Back</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.nextBtn} onPress={handleNext}>
                  <Text style={styles.buttonText}>Next</Text>
                </TouchableOpacity>
              </View>

            </View>
          )}
           {currentStep === 4 && (
           <View style={{ width: '100%', alignItems: 'center' }}>
              <View style={{width:'90%', marginTop: 20,alignItems: 'center' }}>
                <View style={{width: '98%', flexDirection: 'row', alignItems: 'center',justifyContent: 'center', }}>
                  <Ionicons name="radio-button-on" size={24} color="#0CC0DF" />
                  <DashedLine color="#0CC0DF" width="20%" height={5} dashArray={[5, 5]} />
                  <Ionicons name="radio-button-on" size={24} color="#0CC0DF" />
                  <DashedLine color="#0CC0DF" width="22%" height={5} dashArray={[5, 5]} />
                  <Ionicons name="radio-button-on" size={24} color="#0CC0DF" />
                  <DashedLine color="black" width="20%" height={5} dashArray={[5, 5]} />
                  <Ionicons name="radio-button-off-outline" size={24} color="#0CC0DF" />
                </View>
                <View style={{width: '100%', justifyContent: 'center', alignItems: 'center'}}>
                <View style={{alignItems: 'center', justifyContent: 'space-between', width: '92%' , flexDirection: 'row'}}>
                  <Text style={{fontSize: 9 , color: '#0CC0DF' }}>User Info</Text>
                  <Text style={{fontSize: 9, color: '#0CC0DF'}}>Vehicle Info</Text>
                  <Text style={{fontSize: 9, color: '#0CC0DF'}}>Vehicle Images</Text>
                  <Text style={{fontSize: 9}}>Submit</Text>
                </View>
                </View>
              </View>
              
              <View style={{height: 70, width: '90%', alignItems: 'center', justifyContent: 'center',}}>
                <View style={{width: '80%', backgroundColor: '#D9D9D9', borderRadius: 5}}>
                  <Text style={{textAlign: 'center', fontSize: 12, fontWeight: '500'}}>Please provide the requested info below.</Text>
                  <Text style={{textAlign: 'center', fontSize: 10}}>Be sure to submit the highest image quality possible. This ensures faster verification of your credentials.</Text>
                </View>
              </View>

              <View style={styles.documentCon}>
                  <Text style={{fontSize: 15, fontWeight: 'bold'}}>5 Point Vehicle Images</Text>
                  <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%' , marginBottom: 5,}}>
                    <Text>Front</Text>
                    <TouchableOpacity
                      style={uploadStatus.vehicleFront ? styles.uploaded : styles.upload}
                      onPress={() => pickImage('vehicleFront')}
                    >
                      <Text  
                        style={uploadStatus.vehicleFront ? styles.txtUploaded : styles.txtUpload}
                      >
                        {uploadStatus.vehicleFront ? 'Uploaded' : 'Upload'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                  <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%' , marginBottom: 5,}}>
                    <Text>Back</Text>
                    <TouchableOpacity
                      style={uploadStatus.vehicleBack ? styles.uploaded : styles.upload}
                      onPress={() => pickImage('vehicleBack')}
                    >
                      <Text  
                        style={uploadStatus.vehicleBack ? styles.txtUploaded : styles.txtUpload}
                      >
                        {uploadStatus.vehicleBack ? 'Uploaded' : 'Upload'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                  <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%' , marginBottom: 5,}}>
                    <Text>Left Side</Text>
                    <TouchableOpacity
                      style={uploadStatus.vehicleLeft ? styles.uploaded : styles.upload}
                      onPress={() => pickImage('vehicleLeft')}
                    >
                      <Text  
                        style={uploadStatus.vehicleLeft ? styles.txtUploaded : styles.txtUpload}
                      >
                        {uploadStatus.vehicleLeft ? 'Uploaded' : 'Upload'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                  <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%' , marginBottom: 5,}}>
                    <Text>Right Side</Text>
                    <TouchableOpacity
                      style={uploadStatus.vehicleRight ? styles.uploaded : styles.upload}
                      onPress={() => pickImage('vehicleRight')}
                    >
                      <Text  
                        style={uploadStatus.vehicleRight ? styles.txtUploaded : styles.txtUpload}
                      >
                        {uploadStatus.vehicleRight ? 'Uploaded' : 'Upload'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                  <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%' , marginBottom: 5,}}>
                    <Text>Upper Side</Text>
                    <TouchableOpacity
                      style={uploadStatus.vehicleUpper ? styles.uploaded : styles.upload}
                      onPress={() => pickImage('vehicleUpper')}
                    >
                      <Text  
                        style={uploadStatus.vehicleUpper ? styles.txtUploaded : styles.txtUpload}
                      >
                        {uploadStatus.vehicleUpper ? 'Uploaded' : 'Upload'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
   
              <View style={{flexDirection: 'row', width: '90%', marginTop: 15, marginBottom: 20}}>
                <TouchableOpacity style={styles.bckBtn} onPress={handlePrevious}>
                  <Text style={styles.buttonText2}>Back</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.nextBtn} onPress={handleNext}>
                  <Text style={styles.buttonText}>Next</Text>
                </TouchableOpacity>
              </View>
             
           </View>
          )}  

          {currentStep === 5 && (
            <View style={{ width: '100%',alignItems: 'center' }}>
              <View style={{width:'90%', marginTop: 20,alignItems: 'center' }}>
                <View style={{width: '98%', flexDirection: 'row', alignItems: 'center',justifyContent: 'center', }}>
                  <Ionicons name="radio-button-on" size={24} color="#0CC0DF" />
                  <DashedLine color="#0CC0DF" width="20%" height={5} dashArray={[5, 5]} />
                  <Ionicons name="radio-button-on" size={24} color="#0CC0DF" />
                  <DashedLine color="#0CC0DF" width="22%" height={5} dashArray={[5, 5]} />
                  <Ionicons name="radio-button-on" size={24} color="#0CC0DF" />
                  <DashedLine color="#0CC0DF" width="20%" height={5} dashArray={[5, 5]} />
                  <Ionicons name="radio-button-on" size={24} color="#0CC0DF" />
                </View>
                <View style={{width: '100%', justifyContent: 'center', alignItems: 'center'}}>
                <View style={{alignItems: 'center', justifyContent: 'space-between', width: '92%' , flexDirection: 'row'}}>
                  <Text style={{fontSize: 9 , color: '#0CC0DF' }}>User Info</Text>
                  <Text style={{fontSize: 9, color: '#0CC0DF'}}>Vehicle Info</Text>
                  <Text style={{fontSize: 9, color: '#0CC0DF'}}>Vehicle Images</Text>
                  <Text style={{fontSize: 9, color: '#0CC0DF'}}>Submit</Text>
                </View>
                </View>
              </View>

              <View style={{height: 70, width: '90%', alignItems: 'center', justifyContent: 'center',}}>
                <View style={{width: '80%', backgroundColor: '#D9D9D9', borderRadius: 5}}>
                  <Text style={{textAlign: 'center', fontSize: 12, fontWeight: '500'}}>Please provide the requested info below.</Text>
                  <Text style={{textAlign: 'center', fontSize: 10}}>Be sure to submit the highest image quality possible. This ensures faster verification of your credentials.</Text>
                </View>
              </View>
              
              
              <View style={{ marginTop: 9 }}>
                <View style={styles.documentCon}>
                  <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%' , marginBottom: 5, marginTop: 5}}>
                    <Text style={{fontSize: 15, fontWeight: 'bold'}}>Most recent formal photo</Text>
                    <TouchableOpacity
                      style={uploadStatus.formalPhoto ? styles.uploaded : styles.upload}
                      onPress={() => pickImage('formalPhoto')}
                    >
                      <Text  
                        style={uploadStatus.formalPhoto ? styles.txtUploaded : styles.txtUpload}
                      >
                        {uploadStatus.formalPhoto ? 'Uploaded' : 'Upload'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.documentCon}>
                  <Text style={{fontSize: 15, fontWeight: 'bold'}}>University ID</Text>
                  <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%', marginBottom: 5,}}>  
                    <Text>Front</Text>
                    <TouchableOpacity
                      style={uploadStatus.universityIDfront ? styles.uploaded : styles.upload}
                      onPress={() => pickImage('universityIDfront')}
                    >
                      <Text  
                        style={uploadStatus.universityIDfront ? styles.txtUploaded : styles.txtUpload}
                      >
                        {uploadStatus.universityIDfront ? 'Uploaded' : 'Upload'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                  <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%',  marginBottom: 5,}}>  
                    <Text>Back</Text>
                    <TouchableOpacity
                      style={uploadStatus.universityIDback ? styles.uploaded : styles.upload}
                      onPress={() => pickImage('universityIDback')}
                    >
                      <Text  
                        style={uploadStatus.universityIDback ? styles.txtUploaded : styles.txtUpload}
                      >
                        {uploadStatus.universityIDback ? 'Uploaded' : 'Upload'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.documentCon}>
                <Text style={{fontSize: 15, fontWeight: 'bold'}}>Drivers License</Text>
                  <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%', marginBottom: 5,}}>  
                    <Text>Front</Text>
                    <TouchableOpacity
                      style={uploadStatus.driversLicenseFront ? styles.uploaded : styles.upload}
                      onPress={() => pickImage('driversLicenseFront')}
                    >
                      <Text  
                        style={uploadStatus.driversLicenseFront ? styles.txtUploaded : styles.txtUpload}
                      >
                        {uploadStatus.driversLicenseFront ? 'Uploaded' : 'Upload'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                  <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%' , marginBottom: 5,}}>  
                    <Text>Back</Text>
                    <TouchableOpacity
                      style={uploadStatus.driversLicenseBack ? styles.uploaded : styles.upload}
                      onPress={() => pickImage('driversLicenseBack')}
                    >
                      <Text  
                        style={uploadStatus.driversLicenseBack ? styles.txtUploaded : styles.txtUpload}
                      >
                        {uploadStatus.driversLicenseBack ? 'Uploaded' : 'Upload'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.documentCon}>
                  <Text style={{fontSize: 15, fontWeight: 'bold'}}>OR and CR</Text>
                  <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%' , marginBottom: 5,}}>
                    <Text>OR</Text>
                    <TouchableOpacity
                      style={uploadStatus.oR ? styles.uploaded : styles.upload}
                      onPress={() => pickImage('oR')}
                    >
                      <Text  
                        style={uploadStatus.oR ? styles.txtUploaded : styles.txtUpload}
                      >
                        {uploadStatus.oR ? 'Uploaded' : 'Upload'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                  <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%' , marginBottom: 5,}}>
                    <Text>CR</Text>
                    <TouchableOpacity
                      style={uploadStatus.cR ? styles.uploaded : styles.upload}
                      onPress={() => pickImage('cR')}
                    >
                      <Text  
                        style={uploadStatus.cR ? styles.txtUploaded : styles.txtUpload}
                      >
                        {uploadStatus.cR ? 'Uploaded' : 'Upload'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
                
              </View>
              

              <View style={{flexDirection: 'row', width: '90%', marginTop: 15, marginBottom: 20}}>
                <TouchableOpacity style={styles.bckBtn} onPress={handlePrevious}>
                  <Text style={styles.buttonText2}>Back</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.nextBtn} onPress={() => { handleSignUp(); handleNext(); }}>
                  <Text style={styles.buttonText}>Done</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

         
           
          {currentStep === 6 && (
           <View style={{ width: '100%', alignItems: 'center' }}>
            <View style={{height: 150, width: '90%', justifyContent: 'center', alignItems: 'center', borderBottomColor: 'black', borderBottomWidth: 3, }}>
              <MaterialCommunityIcons name="check-decagram" size={80} color="#0CC0DF" />
              <Text style={{fontFamily:'Shrikhand-Regular', fontSize: 24}}>Done!</Text>
            </View>
            
              <View style={{height: 70, width: '90%', marginTop: 15, alignItems: 'center', justifyContent: 'center', backgroundColor: '#D9D9D9', borderRadius: 5}}>
                <View style={{width: '90%',  }}>
                  <Text style={{textAlign: 'center', fontSize: 14}}>Check your email provided for authentication.</Text>
                  <Text style={{textAlign: 'center', fontSize: 14}}>We recieved your documents. We'll review it and get back to you within 3 business, for now on you can login your account.</Text>
                </View>
              </View>
              <Image
                style={{width: 290, height: 290, borderRadius: 10, marginTop: 15, marginBottom: 15 }}
                source={require('../assets/Driver_Done.png')}
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
    borderTopColor: 'black', 
    borderTopWidth: 2, 
    width: '90%', 
    height: 'auto',
 },

 documentCon1:{
  borderTopColor: 'black', 
  borderTopWidth: 2, 
  borderBottomWidth: 2,  
  width: '90%', 
  height: 'auto',
},
 
 
  button: {
    backgroundColor: '#0CC0DF',
    padding: 10,
    borderRadius: 5,
    width: '90%',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 10,
  },

  nextBtn: {
    backgroundColor: '#0CC0DF',
    padding: 10,
    borderRadius: 5,
    width: 135,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 20,
  },

  bckBtn: {
    backgroundColor: 'white',
    borderColor: '#0CC0DF',
    borderWidth: 2,
    padding: 10,
    borderRadius: 5,
    width: 135,
    justifyContent: 'center',
    alignItems: 'center',
  },


  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold'
  },
  buttonText2: {
    color: '#0CC0DF',
    fontSize: 18,
    fontWeight: 'bold'
  },
  title: {
    fontFamily: 'Shrikhand',
    fontSize: 60,
  },

  upload: {
    backgroundColor: '#0CC0DF',
    height: 30,
    width: 50,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 5,
    alignItems: 'center',
  },

  uploaded: {
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  
  txtUploaded: {
    color: 'green',
    fontSize: 12,
    fontWeight: 'bold'
  },
  txtUpload: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold'
  },
  
});

export default Driversign;
