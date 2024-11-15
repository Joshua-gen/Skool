import React, { useState } from 'react';
import {
  StyleSheet, View, Text, TextInput, TouchableHighlight, ScrollView, Button, Image, Switch
} from 'react-native';

const DRSettings = ({navigation}) => {


  return (
    <View style = {akonstyle.mobilecontainer}>

     <View style={akonstyle.profSet}>
       
        <Text style={{marginTop: 30, marginLeft: 30, fontSize: 25, fontWeight: 'bold', color: 'white'}}>The Tenth</Text>
     </View>

      <View style={akonstyle.setting}>
        <Text style={akonstyle.settingText}>Personal</Text>
      </View>
      <View style={akonstyle.setting}>
        <Text style={akonstyle.settingText}>Privacy</Text>
      </View>
      <View style={akonstyle.setting}>
        <Text style={akonstyle.settingText}>Preference</Text>
      </View>
      <View style={akonstyle.setting}>
        <Text style={akonstyle.settingText}>Profile Details</Text>
      </View>
        
      <View style={akonstyle.setting}>
        
        <Text style={akonstyle.settingText}>Notifications</Text>
        <Switch
          trackColor={{ false: "#767577", true: "#81b0ff" }}
          thumbColor="#f4f3f4"
          ios_backgroundColor="#3e3e3e"
        />
      </View>
      <View style={akonstyle.setting}>
        <Text style={akonstyle.settingText}>Dark Mode</Text>
        <Switch
          trackColor={{ false: "#767577", true: "#81b0ff" }}
          thumbColor="#f4f3f4"
          ios_backgroundColor="#3e3e3e"
        />
      </View>
      <View style={akonstyle.setting}>
        <Text style={akonstyle.settingText}>Dark Mode</Text>
      </View>

    
      
 

    </View> 
  )
  
  };

 

export default DRSettings;


const akonstyle = StyleSheet.create({
  mobilecontainer:{
    flex:1,
    backgroundColor: '#fdf2f3',
    alignItems: 'center',
    justifyContent: 'center',
  }, 
  setting: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    borderBottomWidth: 1,
    borderColor: '#630436', 
    width: 300,
    borderBottomColor: '#ccc',
    paddingBottom: 10,
  },
  settingText: {
    fontSize: 18,
    
  },
  profSet:{
    flexDirection: 'row',
    backgroundColor: '#630436',
    marginVertical: 10,
    marginHorizontal: 16,
    width: 330,
    height: 100,
    paddingBottom: 32,
    borderRadius: 6,
    top: -30,
    alignItems: 'center',
    alignContent: 'center'
  },



  con:{
   
        backgroundColor: '#630436',
        marginVertical: 10,
        marginHorizontal: 16,
        width: 330,
        height: 50 ,
        paddingBottom: 32,
        borderRadius: 6,
        justifyContent: 'center',
        alignItems: 'center',
        textAlign:'center'
   
  },

  Name:{
    fontSize: 25,
    fontWeight: 'bold',
    marginTop: 10,
    color: 'white'
    

  },
  akonbtn:{ 
    backgroundColor: '#630436',
    padding: 10,
    margin: 15,
    height: 40,
    width: 130,
    borderRadius: 10,
    alignItems: 'center', 
    justifyContent: 'center', 
 },

 akonbtn1:{ 
  borderColor: '#630436', 
  borderWidth: 2,     
  borderStyle: 'solid' ,
  padding: 10,
  margin: 15,
  height: 40,
  width: 130,
  borderRadius: 10,
  alignItems: 'center', 
  justifyContent: 'center', 
}

 

})