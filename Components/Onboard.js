import React from 'react';
import { StyleSheet, View, Text, TouchableHighlight, Image } from 'react-native';
import Onboarding from 'react-native-onboarding-swiper';
import * as Font from 'expo-font';

const Onboard = ({ navigation }) => {


  const handleDone = ()=>{
    navigation.navigate('Login');
  }
  return (
    <View style={styles.container}>
      
      <Onboarding 
        onDone={handleDone}
        onSkip={handleDone}
        containerStyles={{paddingHorizontal: 15}}
        pages={[
          {
            backgroundColor: '#0CC0DF',
            image:  <View style={{alignItems: 'center'}}>
                      <Image source={require('../assets/Skool-Logo.png')} style={{width: 150, height: 150,}}/>
                      <Text style={{fontSize: 25,fontFamily: 'Poppins-Regular', textAlign: 'center', color: 'white',}}>Are you tired of everyday commuting hassles?</Text>
                    </View> ,
            title: '',
            subtitle: <Image source={require('../assets/Onbrd1.png')} style={{marginTop: -70}} />,
          },
          {
            backgroundColor: '#0CC0DF',
            image:  <View style={{alignItems: 'center'}}>
                      <Image source={require('../assets/Skool-Logo.png')} style={{width: 150, height: 150,}}/>
                      <Image source={require('../assets/Onbrd2.png')}  style={{width: 250, height: 250,}}/>
                    </View>,
            title: <View style={{width: '90%'}}><Text style={{fontFamily: 'Poppins-Regular', fontSize: 25, textAlign: 'center', color: 'white',}}>Skool is here for you! Join us as we embark on this journey in making student life a lot better.</Text></View>,
            subtitle: '',
          },
          {
            backgroundColor: '#0CC0DF',
            image:  <View style={{alignItems: 'center'}}>
                      <Image source={require('../assets/Skool-Logo.png')} style={{width: 150, height: 150,}}/>
                      <Image source={require('../assets/Onbrd3.png')}  />
                    </View>,
            title:  <View style={{width: '70%'}}>
                      <Text style={{fontSize: 25, textAlign: 'center', color: 'white', fontFamily: 'Poppins-Regular',}}>Lets get you set up!</Text>
                      <Text style={{fontSize: 20, textAlign: 'center', color: 'white', marginTop: 5 ,fontFamily: 'Poppins-Regular',}}>Fasten your seatbelts this is gonna take a while!</Text>
                    </View>,
            subtitle: '',
          },
          
        ]}
      />

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  button: {
    backgroundColor: '#630436',
    padding: 10,
    borderRadius: 10,
    marginTop: 20,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
  },
});

export default Onboard;
