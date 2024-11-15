// screens/DriverAcc.js
import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, TouchableHighlight, FlatList, Alert, Image, TouchableOpacity, RefreshControl, TextInput } from 'react-native';
import { auth, firestore, storage } from '../Config'; // Ensure the correct path to your Config.js
import AntDesign from '@expo/vector-icons/AntDesign';
import Header from '../src/Header';
import Loading from '../src/loading';

const PassengerAcc = ({ navigation }) => {
  const [users, setUsers] = useState([]);
  const [originalUsers, setOriginalUsers] = useState([]); // Store the original list
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false); // State for refreshing
  const [search, setSearch] = useState(''); // State for search query

  const fetchUsers = async () => {
    try {
      const snapshot = await firestore.collection('users')
        .where('userType', '==', 'Passenger')
        .get();

      const usersList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setUsers(usersList); // Set both original and filtered user lists
      setOriginalUsers(usersList); // Keep a backup of the original list
    } catch (error) {
      console.error("Error fetching verified drivers: ", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSearch = () => {
    if (!search.trim()) {
      // If search is empty, show all users
      setUsers(originalUsers);
    } else {
      const filteredUsers = originalUsers.filter(user =>
        user.firstName.toLowerCase().includes(search.toLowerCase()) ||
        user.lastName.toLowerCase().includes(search.toLowerCase()) ||
        user.id.toLowerCase().includes(search.toLowerCase()) // Search by user ID
      );
      setUsers(filteredUsers);
    }
  };


  const onRefresh = () => {
    setRefreshing(true);
    fetchUsers(); // Fetch new data on refresh
  };
  
  if (loading) {
    return (
      <Loading/>
    );
  }

  return (
    <View style={styles.container}>
      <Header/>
      <View style={{height: '100%', width: '100%', alignItems: 'center'}}>
        <View style={{flexDirection: 'row', width: '97%', alignItems: 'center', justifyContent: 'space-between', marginTop: 5}}>
          <TextInput
            placeholder='Search name or id'
            style={[styles.input, {width: '75%'}]}
            value={search}
            onChangeText={text => setSearch(text)}
          />
          <TouchableOpacity style={styles.ViewBtn}  onPress={handleSearch}>
            <AntDesign name="search1" size={24} color="white" />
          </TouchableOpacity>
        </View>
        <View style={{width: '100%', height: '80%', paddingHorizontal: 2}}>
        <FlatList
          data={users}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <View style={styles.userItem}>
              {item.userProfile && (
                <Image 
                  source={{ uri: item.userProfile }} 
                  style={{ width: 60, height: 60, borderRadius: 50 }}
                />
              )}
              <View style={{ marginLeft: 10, justifyContent: 'space-between', flexDirection: 'row', width: '70%', alignItems: 'center' }}>
                <View>
                  <Text style={styles.userName}>{item.firstName} {item.lastName}</Text>
                  <View style={{flexDirection: 'row'}}>
                    <AntDesign name="star" size={20} color="#FFE234" />
                    <Text style={styles.userName}>{item.rating?.toFixed(1)}</Text>
                  </View>
                  <Text style={[styles.userName, {fontSize: 9, color: 'grey'}]}>{item.id}</Text>
                </View>
                
                <TouchableHighlight
                  style={styles.ViewBtn}
                  onPress={() => navigation.navigate('PSAccountInfo', { user: item })}
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
      </View>
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
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  input: {
    width: '100%',
    padding: 10,
    borderColor: '#0CC0DF',
    borderWidth: 1,
    borderRadius: 5,
    height: 40
  },
});

export default PassengerAcc;
