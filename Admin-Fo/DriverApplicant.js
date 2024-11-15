import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, TouchableHighlight, FlatList, Alert, Image, TouchableOpacity, RefreshControl, TextInput } from 'react-native';
import { auth, firestore, storage } from '../Config'; // Ensure the correct path to your Config.js
import AntDesign from '@expo/vector-icons/AntDesign';
import Header from '../src/Header';
import Loading from '../src/loading';


const DriverApplicant = ({navigation}) => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedDocs, setSelectedDocs] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false); // State for refreshing

  
    const fetchUsers = async () => {
      try {
        const snapshot = await firestore.collection('users')
          .where('isVerified', '==', false)
          .where('userType', '==', 'Driver')
          .get();
  
        const usersList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setUsers(usersList); // Set both original and filtered user lists
        
      } catch (error) {
        console.error("Error fetching verified drivers: ", error);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    };

  const onRefresh = () => {
    setRefreshing(true);
    fetchUsers(); // Fetch new data on refresh
  };

  useEffect(() => {
    fetchUsers();
  }, []);
  
  if (loading) {
    return (
      <Loading/>
    );
  }


  return (
    <View style={styles.container}>
      <Header/>
        <FlatList
          data={users}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <View style={styles.userItem}>
              {item.formalPhoto && (
                <Image 
                  source={{ uri: item.formalPhoto }} 
                  style={{ width: 60, height: 60, borderRadius: 50 }}
                />
              )}
              <View style={{ marginLeft: 10, justifyContent: 'space-between', flexDirection: 'row', width: '70%', alignItems: 'center' }}>
                <View>
                  <Text style={styles.userName}>{item.firstName} {item.lastName}</Text>
                  
                </View>
                <TouchableHighlight
                  style={styles.ViewBtn}
                  onPress={() => navigation.navigate('UserInfo', { user: item })}
                >
                  <Text style={{ color: 'white', fontWeight: 'bold' }}>View</Text>
                </TouchableHighlight>
              </View>
            </View>
          )}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />

    </View>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    alignItems: 'center',
  },
  userItem: {
    height: 100,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
        marginTop: 5,
        marginBottom: 5, 
        borderLeftColor: '#0CC0DF',
        backgroundColor: 'white',
        borderLeftWidth: 3,
        shadowColor: '#000', // Shadow color
        shadowOffset: { width: 0, height: 2 }, // Offset for the shadow (x, y)
        shadowOpacity: 0.25, // Opacity of the shadow
        shadowRadius: 3.84, // Shadow blur radius
           // Android shadow
        elevation: 5, // Elevation for Android
  },
  ViewBtn: {
    width: 80, 
    backgroundColor: '#0CC0DF',
    height: 40, 
    alignItems: 'center', 
    justifyContent: 'center', 
    borderRadius: 5,
    alignItems: 'center',
        shadowColor: '#000', // Shadow color
        shadowOffset: { width: 0, height: 2 }, // Offset for the shadow (x, y)
        shadowOpacity: 0.25, // Opacity of the shadow
        shadowRadius: 3.84, // Shadow blur radius
           // Android shadow
        elevation: 5, // Elevation for Android
  },
  
});

export default DriverApplicant;
