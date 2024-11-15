import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const TimePicker = ({ onTimeChange, }) => {
  const [hours, setHours] = useState(12); // Initial hours
  const [minutes, setMinutes] = useState(30); // Initial minutes
  const [period, setPeriod] = useState('AM'); // Initial period (AM or PM)

  const incrementHours = () => {
    setHours((prev) => (prev < 12 ? prev + 1 : 1)); // Reset to 1 after reaching 12
  };

  const decrementHours = () => {
    setHours((prev) => (prev > 1 ? prev - 1 : 12)); // Reset to 12 after reaching 1
  };

  const incrementMinutes = () => {
    setMinutes((prev) => (prev < 59 ? prev + 1 : 0)); // Reset to 0 after reaching 59
  };

  const decrementMinutes = () => {
    setMinutes((prev) => (prev > 0 ? prev - 1 : 59)); // Reset to 59 after reaching 0
  };

  const togglePeriod = (newPeriod) => {
    setPeriod(newPeriod);
  };

  // Call the onTimeChange prop when time is updated
  const handleTimeChange = () => {
    const selectedTime = `${hours}:${minutes < 10 ? '0' + minutes : minutes} ${period}`;
    if (onTimeChange) {
      onTimeChange(selectedTime); // Ensure the function exists and is called
    }
  };
  return (
    <View style={styles.container}>
      <Text style={styles.label}>Select Time:</Text>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <View style={styles.timePicker}>
          {/* Hours */}
          <TouchableOpacity onPress={incrementHours}>
            <Text style={styles.timeButton}>▲</Text>
          </TouchableOpacity>
          <Text style={styles.timeText}>{hours < 10 ? '0' + hours : hours}</Text>
          <TouchableOpacity onPress={decrementHours}>
            <Text style={styles.timeButton}>▼</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.colon}>:</Text>

        <View style={styles.timePicker}>
          {/* Minutes */}
          <TouchableOpacity onPress={incrementMinutes}>
            <Text style={styles.timeButton}>▲</Text>
          </TouchableOpacity>
          <Text style={styles.timeText}>{minutes < 10 ? '0' + minutes : minutes}</Text>
          <TouchableOpacity onPress={decrementMinutes}>
            <Text style={styles.timeButton}>▼</Text>
          </TouchableOpacity>
        </View>
        
        {/* Period Selection */}
        <View style={styles.periodPicker}>
          <TouchableOpacity onPress={() => togglePeriod('AM')}>
            <Text style={[styles.periodButton, period === 'AM' && styles.selectedPeriod]}>AM</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => togglePeriod('PM')}>
            <Text style={[styles.periodButton, period === 'PM' && styles.selectedPeriod]}>PM</Text>
          </TouchableOpacity>
        </View>
      </View>
      <TouchableOpacity style={styles.confirmButton} onPress={handleTimeChange}>
        <Text style={styles.confirmButtonText}>Confirm</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: 20,
    borderLeftColor: '#0CC0DF',
    padding: 10,
    borderLeftWidth: 3,
    // Shadow for iOS
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 }, // Shadow at the bottom
    shadowOpacity: 0.3,
    shadowRadius: 3,
    // Shadow for Android
    elevation: 2,
  },
  label: {
    fontSize: 18,
    marginBottom: 10,
  },
  timePicker: {
    flexDirection: 'column',
    alignItems: 'center',
  },
  timeButton: {
    fontSize: 24,
  },
  timeText: {
    fontSize: 20,
    marginVertical: 10,
  },
  colon: {
    fontSize: 36,
    marginHorizontal: 10,
  },
  periodPicker: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 10,
  },
  periodButton: {
    fontSize: 20,
    paddingHorizontal: 10,
    paddingVertical: 15,
  },
  selectedPeriod: {
    fontWeight: 'bold',
    color: '#0CC0DF',
  },
  confirmButton: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#0CC0DF',
    borderRadius: 5,
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 16,
  },
});

export default TimePicker;
