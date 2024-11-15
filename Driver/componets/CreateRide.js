import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import TimePicker from '../src/timePicker'; // Import the TimePicker component
import Entypo from '@expo/vector-icons/Entypo';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import AntDesign from '@expo/vector-icons/AntDesign';
import { GOOGLE_MAPS_KEY } from '@env';

const CreateRide = ({
  closeModal,
  originAddress,
  origin,
  rideLocDes,
  setrideLocDes,
  setDestination,
  setRideDestinationPlace,
  distance,
  loading,
  fare,
  handleCreateRide,
  setDepartureTime // Pass down the setter function for departure time
}) => {
  const [selectedTime, setSelectedTime] = useState(''); // State for selected departure time
  const [showTimePicker, setShowTimePicker] = useState(false); // State to control time picker visibility

  const handleTimeChange = (time) => {
    setSelectedTime(time); // Update local state with the selected time
    setDepartureTime(time); // Update parent component's state
    setShowTimePicker(false); // Hide the time picker after selection
  };

  const toggleTimePicker = () => {
    setShowTimePicker(!showTimePicker); // Toggle the time picker visibility
  };


  return (
    <View style={{ width: '100%', justifyContent: 'center', alignItems: 'center' }}>
      <View style={{ width: '100%', marginTop: 10 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Entypo name="location-pin" size={35} color="black" />
          <Text style={{ fontFamily: 'Poppins-Regular' }}>Your Current Location</Text>
        </View>
        <View style={{ marginLeft: 25 }}>
          <Text style={{ fontSize: 16, fontFamily: 'Poppins-SemiBold' }}>{originAddress}</Text>
          <Text style={{ fontSize: 16, fontFamily: 'Poppins-SemiBold' }}>
            {origin ? `${origin.latitude}, ${origin.longitude}` : 'Fetching coordinates...'}
          </Text>
          <TextInput
            placeholder="Current Location Description (Optional)"
            style={styles.input}
            value={rideLocDes}
            onChangeText={text => setrideLocDes(text)}
          />
        </View>

        {/* Destination Section */}
        <View style={{ marginTop: 15 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Entypo name="location-pin" size={35} color="red" />
            <Text style={{ fontFamily: 'Poppins-Regular' }}>Set Destination</Text>
          </View>

          <View style={styles.searchContainer}>
            <AntDesign name="search1" size={18} color="#0CC0DF" style={{ marginLeft: 5, marginTop: 15 }} />
            <View style={{ width: '90%', marginTop: 3 }}>
              <GooglePlacesAutocomplete
                placeholder="Set Destination"
                fetchDetails={true}
                onPress={(data, details = null) => {
                  if (details) {
                    const newDestination = {
                      latitude: details.geometry.location.lat,
                      longitude: details.geometry.location.lng,
                    };
                    setDestination(newDestination);
                    setRideDestinationPlace(details.formatted_address);
                  }
                }}
                query={{
                  key: GOOGLE_MAPS_KEY,
                  language: 'en',
                }}
                onFail={(error) => {
                  console.error("Google Places API Error:", error); // Log the error for debugging
                  alert("There was an issue fetching the location. Please try again.");
                }}
                styles={{
                  container: { flex: 0 },
                  listView: { backgroundColor: 'white' },
                }}
              />

            </View>
          </View>
        </View>
        
         {/* Departure Time Section */}
       <View style={{ marginTop: 15, }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <MaterialCommunityIcons name="clock" size={35} color="black" />
            <Text style={{ fontFamily: 'Poppins-Regular' }}> Departure Time:</Text>
            <TouchableOpacity onPress={toggleTimePicker} style={{borderBottomWidth: 1, marginLeft: 5, borderBottomColor: '#0CC0DF'}}>
              <Text style={{ fontFamily: 'Poppins-SemiBold', }}> {selectedTime || 'Select Time'}</Text>
            </TouchableOpacity>
          </View>

          {/* Render the TimePicker component only when showTimePicker is true */}
          {showTimePicker && <TimePicker onTimeChange={handleTimeChange} />}
        </View>

        {/* Distance and Fare Sections */}
        <View style={{ marginTop: 15 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <MaterialCommunityIcons name="map-marker-distance" size={35} color="black" />
            <Text style={{ fontFamily: 'Poppins-Regular' }}> Distance:</Text>
            {distance && <Text style={{ fontFamily: 'Poppins-SemiBold' }}> {distance.toFixed(2)} km</Text>}
          </View>
        </View>

        <View style={{ marginTop: 15 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <MaterialCommunityIcons name="cash" size={35} color="black" />
            <Text style={{ fontFamily: 'Poppins-Regular' }}> Estimated Fare per seat:</Text>
            {fare && <Text style={{ fontFamily: 'Poppins-SemiBold' }}> {fare.toFixed(2)}</Text>}
          </View>
        </View>

        {/* Action Buttons */}
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            width: '100%',
            marginTop: 15,
          }}
        >
          <TouchableOpacity style={styles.button3} onPress={closeModal}>
            <Text style={styles.buttonText2}>Cancel</Text>
          </TouchableOpacity>

          {loading ? (
            <TouchableOpacity style={styles.button2}>
              <ActivityIndicator size="small" color="white" />
            </TouchableOpacity>
            ) : (
            <TouchableOpacity style={styles.button2} onPress={() => handleCreateRide(selectedTime)}>
              <Text style={styles.buttonText}>Create Trip</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
};

export default CreateRide;

const styles = StyleSheet.create({
    button2: {
        backgroundColor: '#0CC0DF',
        padding: 10,
        borderRadius: 5,
        width: '48%',
        justifyContent: 'center',
        alignItems: 'center',
        alignSelf: 'center'
    
        
      },
    
      button3: {
        backgroundColor: 'white',
        borderColor: '#0CC0DF',
        borderWidth: 2,
        padding: 10,
        borderRadius: 5,
        width: '48%',
        justifyContent: 'center',
        alignItems: 'center',
        alignSelf: 'center'
    
        
      },
      buttonText2: {
        color: '#0CC0DF',
        fontSize: 18,
        fontWeight: 'bold',
        fontFamily: 'Poppins-Regular',
      },
    
      buttonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
        fontFamily: 'Poppins-Regular',
      },

      searchContainer: {
        width: '92%',
        borderColor: '#0CC0DF',
        borderWidth: 1,
        borderRadius: 5,
        marginLeft: 25,
        height: 'auto',
        flexDirection: 'row'
      },
      input: {
        width: '100%',
        padding: 10,
        borderColor: '#0CC0DF',
        borderWidth: 1,
        borderRadius: 5,
        marginTop: 10,
      },
   
  });