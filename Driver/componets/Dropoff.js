import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Alert } from 'react-native';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import { GOOGLE_MAPS_KEY } from '@env';

const Dropoff = ({ navigation, route }) => {
    const { rideId, seatKey, onPlaceSelect } = route.params; // Extract onPlaceSelect from route.params
    const [selectedLocation, setSelectedLocation] = useState(null); // State to store the selected location

    const handleDone = () => {
        if (selectedLocation && onPlaceSelect) {
            onPlaceSelect(selectedLocation); // Call the function with the selected location
            navigation.goBack();
        } else {
            Alert.alert('Error', 'No location selected.');
        }
    };

    return (
        <View style={styles.container}>
            <GooglePlacesAutocomplete
                placeholder="Enter Drop Off"
                fetchDetails={true}
                onPress={(data, details = null) => {
                    if (details) {
                        const location = {
                            place: data.description,
                            coordinates: {
                                latitude: details.geometry.location.lat,
                                longitude: details.geometry.location.lng,
                            },
                        };
                        setSelectedLocation(location); // Temporarily store the selected location
                    }
                }}
                query={{
                    key: GOOGLE_MAPS_KEY,
                    language: 'en',
                }}
            />

            <View style={styles.buttonContainer}>
                {/* Done Button */}
                <TouchableOpacity style={[styles.button, styles.doneButton]} onPress={handleDone}>
                    <Text style={styles.buttonText}>Done</Text>
                </TouchableOpacity>

                {/* Cancel Button */}
                <TouchableOpacity
                    style={[styles.button, styles.cancelButton]}
                    onPress={() => navigation.goBack()} // Just navigate back without setting drop-off
                >
                    <Text style={styles.buttonText}>Cancel</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
container: {
  flex: 1,
  padding: 20,
  backgroundColor: '#f5f5f5',
},
button: {
    backgroundColor: '#0CC0DF',
    padding: 10,
    borderRadius: 5,
    width: '70%',
    justifyContent: 'center',
    alignItems: 'center',
    
  },
});

export default Dropoff;
