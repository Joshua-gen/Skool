import React, { useState} from 'react';
import { StyleSheet, View, Text, TouchableHighlight, Image, TouchableOpacity } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { FontAwesome } from '@expo/vector-icons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';



const Signup = ({ navigation }) => {

 
 

  return (
    <View style={styles.container}>
      <View style={{marginTop: '-30%', justifyContent: 'center', alignItems: 'center', width: '100%', }}>
        <Image
        style={{width: 100, height: 100}}
        source={require('../assets/Skool-Logo.png')}
        />

      <Text style={{ fontFamily: 'Shrikhand-Regular', fontSize: 60, color: 'white' }}>Sign up</Text>
        <View style={{justifyContent: 'center', alignItems: 'center', width: '90%', height: 'auto', backgroundColor: 'white', borderRadius: 15}}>
        
        <TouchableOpacity
            onPress={() => navigation.navigate('Passengersign')} // Navigate to 'Tabs' screen
            style={styles.button}
          >
            <Text style={styles.buttonText}>Signup as Passenger  </Text>
            <FontAwesome name="user" size={40} color="white" />
          </TouchableOpacity>

           <Text style={{marginTop: 15, fontSize: 16,  color: '#A98D8D'}}>or</Text>

          <TouchableOpacity
            onPress={() => navigation.navigate('Driversign')} // Navigate to 'Tabs' screen
            style={styles.button}
          >
            <Text style={styles.buttonText}>Signup as driver  </Text>
            <MaterialCommunityIcons name="steering" size={45} color="white" />
          </TouchableOpacity>
        
         
          <View style={{justifyContent: 'center', alignItems: 'center', marginTop: '10%', marginBottom: '5%'}}>
            <Text style={{fontSize: 16, color: '#A98D8D'}}>Already have an Account?</Text>
          
              <TouchableHighlight
                onPress={() => navigation.navigate('Login')} 
                style={{}}
              >
                <Text style={{color: '#0CC0DF',fontSize: 16, fontWeight: 'bold' }}>Sign-In</Text>
              </TouchableHighlight> 
          </View>

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
  button: {
    backgroundColor: '#0CC0DF',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    height: 80,
    borderRadius: 5,
    width: '90%',
    marginTop: 20,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold'
  },
});

export default Signup;
