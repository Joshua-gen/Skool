import { useState, useEffect } from 'react';
import { SafeAreaView, View, Image, TouchableOpacity , Text} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createDrawerNavigator, DrawerItemList } from '@react-navigation/drawer';
import { createMaterialBottomTabNavigator } from '@react-navigation/material-bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { FontAwesome } from '@expo/vector-icons';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import Ionicons from '@expo/vector-icons/Ionicons';
import defaultProfilePic from './assets/Driver_Done.png'; // Path to your default image


import { auth, firestore, storage } from './Config'; // Ensure the correct path to your Config.js

import * as Font from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';

import Onboard from './Components/Onboard'; // Import the Onboard component
import Login from './Components/Login';
import Signup from './Components/Signup';
import Driversign from './Components/Driversign';
import Passengersign from './Components/Passengersign';

import PSProfile from './Passenger/PSProfile';
import PSSettings from './Passenger/PSSettings';
import PSMyrides from './Passenger/PSMyrides';
import PSHome from './Passenger/PSHome';
import PSNotif from './Passenger/PSNotif';
import PSHistory from './Passenger/PSHistory';

import RideListing from './Passenger/componets/RideListing';

import DRProfile from './Driver/DRProfile';
import DRSettings from './Driver/DRSettings';
import DRTrips from './Driver/DRTrips';
import DRHome from './Driver/DRHome';
import DRNotif from './Driver/DRNotif';
import DRHistory from './Driver/DRHisitory';

import Dropoff from './Driver/componets/Dropoff';

import AdminLogin from './Components/AdminLogin';

import AdminDashboard from './Admin-Fo/AdminDashboard';
import DriverAcc from './Admin-Fo/DriverAcc';
import PassengerAcc from './Admin-Fo/PassengerAcc';
import DriverApplicant from './Admin-Fo/DriverApplicant';
import DRAccountInfo from './Admin-Fo/DRAccountInfo';
import DRDocument from './Admin-Fo/DRDocument';
import PSAccountInfo from './Admin-Fo/PSAccountInfo';
import UpdateDriver from './Admin-Fo/UpdateDriver';
import UpdatePassenger from './Admin-Fo/UpdatePassenger';
import DocsScreen from './Admin-Fo/DriverApplicant/DocsScreen';
import UserInfo from './Admin-Fo/DriverApplicant/UserInfo';
import CanceledRides from './Admin-Fo/CanceledRides';
import SuccessfulRides from './Admin-Fo/SuccessfulRides';
import ADNotif from './Admin-Fo/ADNotif';
import AccountStatus from './Admin-Fo/AccountStatus';
//import SuccessfulRides from './Admin-Fo/SuccessfulRides';


const Stack = createStackNavigator();
const Drawer1 = createDrawerNavigator();
const Drawer2 = createDrawerNavigator();
const Drawer3 = createDrawerNavigator();
const Tab1 = createMaterialBottomTabNavigator();
const Tab2 = createMaterialBottomTabNavigator();

// Passenger Drawer Navigator
function PassengerDrawerNavigator() {
  const [user, setUser] = useState('');

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userDoc = await firestore.collection('users').doc(auth.currentUser.uid).get();
        if (userDoc.exists) {
          setUser(userDoc.data());
        } else {
          console.log('User does not exist');
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUserData();
  }, []);

  const imageSource = user.formalPhoto ? { uri: user.formalPhoto } : defaultProfilePic;

  return (
    <Drawer1.Navigator 
      initialRouteName="Home"
      drawerContent={
        (props) => {
          return (
            <SafeAreaView>
              <View 
                style={{width: '100%', height: 150, backgroundColor: 'white', alignItems: 'center', flexDirection: 'row'}}
              >
                  {user.userProfile ? (
                    <Image source={{ uri: user.userProfile }} style={{ width: 90, height: 90, borderRadius: 100, marginLeft: 5 }} />
                  ) : (
                    <Image
                      source={require('./assets/default-profile.jpg')}
                      style={{ width: 90, height: 90, borderRadius: 100, marginLeft: 5 }}
                    />
                  )}

                <View style={{ width: '63%', height: 120, alignItems: 'center', justifyContent: 'center'}}>
                  <Text 
                    style={{fontSize: 20,  fontFamily: 'Poppins-Regular'}}
                    numberOfLines={1} 
                    ellipsizeMode="tail"
                  >
                    {user.firstName} {user.lastName}
                  </Text>
                  <Text style={{fontSize: 10, color: 'grey', fontFamily: 'Poppins-Regular'}}>{user.email}</Text>

                  <TouchableOpacity
                    style={{width: 125, height: 30, backgroundColor: '#0CC0DF', borderRadius: 5, marginTop: 20, justifyContent: 'center', alignItems: 'center'}}
                     onPress={() => props.navigation.navigate('PSProfile')}
                  >
                    <Text  style={{color: 'white'}}>View Profile</Text>
                  </TouchableOpacity>
                </View>
                
              </View>
              <DrawerItemList {...props}/>
            </SafeAreaView>
          )
        }
      }
      screenOptions={{
        drawerStyle: {
          backgroundColor: '#0CC0DF',
          width: 280,
        },
        drawerActiveTintColor: "black",
        drawerLabelStyle: {
          color: "white"
        },
      }}
    >
      <Drawer1.Screen 
        name="Home" 
        component={PassengerDrawerScreen} 
        options={{ 
          headerShown: true, 
          headerTransparent: true,  
          headerTitle: '',
          drawerIcon: () => (
            <MaterialCommunityIcons name="home" color="white" size={30}/>
          )
        }} 
      />
      <Drawer1.Screen 
        name="Settings" 
        component={PSSettings} 
        options={{ 
          headerShown: true, 
          headerTransparent: true, 
          drawerIcon: () => (
            <Ionicons name="settings" size={30} color="white" />
          )
        }} 
      />
      <Drawer1.Screen 
        name="Ride History" 
        component={PSHistory} 
        options={{ 
          headerShown: true, 
          headerTransparent: true, 
          drawerIcon: () => (
            <Ionicons name="list" size={30} color="white" />
          )
        }} 
      />
    </Drawer1.Navigator>
  );
}

// Passenger Tab Navigator
function PassengerTabNavigator() {
  return (
    <Tab1.Navigator 
      initialRouteName="Feed" 
      activeColor= "#0CC0DF" 
      labelStyle={{ fontSize: 12 }} 
      barStyle={{ backgroundColor: 'white',}}
    >
      <Tab1.Screen 
        name="Feed" 
        component={PSHome} 
        options={{ 
          tabBarLabel: 'Home', 
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="home" color={color} size={30} />
          )
        }}  
      />
      <Tab1.Screen 
        name="Myrides" 
        component={PSMyrides} 
        options={{ 
          tabBarLabel: 'My Rides', 
          tabBarIcon: ({ color }) => (
            <FontAwesome5 name="car" color={color} size={30} />
          )
        }}
      />
      <Tab1.Screen 
        name="PSNotification" 
        component={PSNotif}
        options={{ 
          tabBarLabel: 'Notification', 
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="bell" color={color} size={30} />
          ) 
        }} 
      />
    </Tab1.Navigator>
  );
}

function PassengerDrawerScreen() {
  return <PassengerTabNavigator />;
}

// Driver Drawer Navigator
function DriverDrawerNavigator({navigation}) {
  const [user, setUser] = useState('');

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userDoc = await firestore.collection('users').doc(auth.currentUser.uid).get();
        if (userDoc.exists) {
          setUser(userDoc.data());
        } else {
          console.log('User does not exist');
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUserData();
  }, []);

  return (
    <Drawer2.Navigator 
      initialRouteName="Home"
      drawerContent={
        (props) => {
          return (
            <SafeAreaView>
              <View 
                style={{width: '100%', height: 150, backgroundColor: 'white', alignItems: 'center', flexDirection: 'row'}}
              >
                {user.userProfile ? (
                  <Image 
                    source={{ uri: user.userProfile }} 
                    style={{ width: 90, height: 90, borderRadius: 100, marginLeft: 5 }} 
                  />
                ) : user.formalPhoto ? (
                  <Image 
                    source={{ uri: user.formalPhoto }} 
                    style={{ width: 90, height: 90, borderRadius: 100, marginLeft: 5 }} 
                  />
                ) : null }
                <View style={{ width: '63%', height: 120, alignItems: 'center', justifyContent: 'center',}}>
                  <Text 
                    style={{fontSize: 20,  fontFamily: 'Poppins-Regular'}} 
                    numberOfLines={1} 
                    ellipsizeMode="tail">{user.firstName} {user.lastName}
                  </Text>
                  <Text style={{fontSize: 10, color: 'grey', fontFamily: 'Poppins-Regular'}}>{user.email}</Text>

                  <TouchableOpacity
                    style={{width: 125, height: 30, backgroundColor: '#0CC0DF', borderRadius: 5, marginTop: 20, justifyContent: 'center', alignItems: 'center'}}
                     onPress={() => props.navigation.navigate('DRProfile')}
                  >
                    <Text  style={{color: 'white'}}>View Profile</Text>
                  </TouchableOpacity>
                </View>
                
              </View>
              <DrawerItemList {...props}/>
            </SafeAreaView>
          )
        }
      }
      screenOptions={{
        drawerStyle: {
          backgroundColor: '#0CC0DF',
          width: 280,
        },
        drawerActiveTintColor: "black",
        drawerLabelStyle: {
          color: "white"
        },
      }}
    >
      <Drawer2.Screen 
        name="Home" 
        component={DriverDrawerScreen} 
        options={{ 
          headerShown: true, 
          headerTransparent: true,  
          headerTitle: '',
          drawerIcon: () => (
            <MaterialCommunityIcons name="home" color="white" size={30}/>
          )
        }} 
      />
      <Drawer2.Screen 
        name="Settings" 
        component={DRSettings} 
        options={{ 
          headerShown: true, 
          headerTransparent: true, 
          drawerIcon: () => (
            <Ionicons name="settings" size={30} color="white" />
          )
        }} 
      />
      <Drawer2.Screen 
        name="Trip History" 
        component={DRHistory} 
        options={{ 
          headerShown: true, 
          headerTransparent: true, 
          drawerIcon: () => (
            <Ionicons name="list" size={30} color="white" />
          )
        }} 
      />
    </Drawer2.Navigator>
  );
}

// Driver Tab Navigator
function DriverTabNavigator() {
  return (
    <Tab2.Navigator 
      initialRouteName="Feed" 
      activeColor= "#0CC0DF" 
      labelStyle={{ fontSize: 12 }} 
      barStyle={{ backgroundColor: 'white', height: 55, justifyContent: 'center'}}
    >
      <Tab2.Screen 
        name="Feed" 
        component={DRHome} 
        options={{ 
          tabBarLabel: 'Home', 
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="home" color={color} size={30} />
          )
        }} 
      />
      <Tab2.Screen 
        name="Mytrips" 
        component={DRTrips} 
        options={{ 
          tabBarLabel: 'My Trips', 
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="steering" color={color} size={30}  />
          ) 
        }} 
      />
      <Tab2.Screen 
        name="DRNotification" 
        component={DRNotif}
        options={{ 
          headerShown: false, 
          tabBarLabel: 'Notification',
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="bell" color={color} size={30} />
          ) 
        }} 
      />
    </Tab2.Navigator>
  );
}

function DriverDrawerScreen() {
  return <DriverTabNavigator />;
}

function AdminDrawerNavigator() {
  const [user, setUser] = useState('');

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userDoc = await firestore.collection('users').doc(auth.currentUser.uid).get();
        if (userDoc.exists) {
          setUser(userDoc.data());
        } else {
          console.log('User does not exist');
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUserData();
  }, []);

  return (
    <Drawer3.Navigator
      initialRouteName="Home"
      drawerContent={
        (props) => {
          return (
            <SafeAreaView>
              <View 
                style={{width: '100%', height: 150, backgroundColor: 'white', alignItems: 'center', flexDirection: 'row'}}
              >
                {user.userProfile ? (
                  <Image 
                    source={{ uri: user.userProfile }} 
                    style={{ width: 90, height: 90, borderRadius: 100, marginLeft: 5 }} 
                  />
                ) : user.formalPhoto ? (
                  <Image 
                    source={{ uri: user.formalPhoto }} 
                    style={{ width: 90, height: 90, borderRadius: 100, marginLeft: 5 }} 
                  />
                ) : null }
                <View style={{ width: '63%', height: 120, alignItems: 'center', justifyContent: 'center',}}>
                  <Text 
                    style={{fontSize: 20,  fontFamily: 'Poppins-Regular'}} 
                    numberOfLines={1} 
                    ellipsizeMode="tail">{user.firstName} {user.lastName}
                  </Text>
                  <Text style={{fontSize: 10, color: 'grey', fontFamily: 'Poppins-Regular'}}>{user.email}</Text>
                </View>
                
              </View>
              <DrawerItemList {...props}/>
            </SafeAreaView>
          )
        }
      }
      screenOptions={{
        drawerStyle: {
          backgroundColor: '#0CC0DF',
          width: 280,
        },
        drawerActiveTintColor: "black",
        drawerLabelStyle: {
          color: "white"
        },
      }}
    >
      <Drawer3.Screen 
        name="Home" 
        component={AdminDashboard} 
        options={{ 
          headerShown: true, 
          headerTransparent: true, 
          drawerIcon: () => (
            <Ionicons name="list" size={30} color="white" />
          )
        }} 
      />

      <Drawer3.Screen 
        name="Driver Account" 
        component={DriverAcc} 
        options={{ 
          headerShown: true, 
          headerTransparent: true, 
          drawerIcon: () => (
            <Ionicons name="list" size={30} color="white" />
          )
        }} 
      />
      <Drawer3.Screen 
        name="Passenegr Account"  
        component={PassengerAcc} 
        options={{ 
          headerShown: true, 
          headerTransparent: true, 
          drawerIcon: () => (
            <Ionicons name="list" size={30} color="white" />
          )
        }} 
      />
      <Drawer3.Screen 
        name="Driver Applicant"  
        component={DriverApplicant} 
        options={{ 
          headerShown: true, 
          headerTransparent: true, 
          drawerIcon: () => (
            <Ionicons name="list" size={30} color="white" />
          )
        }} 
      />
      <Drawer3.Screen 
        name="Successful Rides"  
        component={SuccessfulRides} 
        options={{ 
          headerShown: true, 
          headerTransparent: true, 
          drawerIcon: () => (
            <Ionicons name="list" size={30} color="white" />
          )
        }} 
      />
      <Drawer3.Screen 
        name="Canceled Rides"  
        component={CanceledRides} 
        options={{ 
          headerShown: true, 
          headerTransparent: true, 
          drawerIcon: () => (
            <Ionicons name="list" size={30} color="white" />
          )
        }} 
      />
      <Drawer3.Screen 
        name="Notification"  
        component={ADNotif} 
        options={{ 
          headerShown: true, 
          headerTransparent: true, 
          drawerIcon: () => (
            <Ionicons name="list" size={30} color="white" />
          )
        }} 
      />
    </Drawer3.Navigator>
  );
}





// Main App Navigation
export default function App() {

  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    async function loadFonts() {
      try {
        await SplashScreen.preventAutoHideAsync(); // Prevent the splash screen from hiding
        await Font.loadAsync({
          'Shrikhand-Regular': require('./assets/fonts/Shrikhand-Regular.ttf'),
          'Poppins-Regular': require('./assets/fonts/Poppins-Regular.ttf'),
          'Poppins-Medium': require('./assets/fonts/Poppins-Medium.ttf'),
          'Poppins-SemiBold': require('./assets/fonts/Poppins-SemiBold.ttf'),
          'Poppins-Bold': require('./assets/fonts/Poppins-Bold.ttf'),
        });
        setFontsLoaded(true);
      } catch (e) {
        console.warn(e);
      } finally {
        await SplashScreen.hideAsync(); // Hide the splash screen after fonts are loaded
      }
    }

    loadFonts();
  }, []);

  if (!fontsLoaded) {
    return null; // Return null or a loading component until fonts are loaded
  }


  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="GetStarted" component={Onboard} options={{ headerShown: false }} />
        <Stack.Screen name="Login" component={Login} options={{ headerShown: false }} />
        <Stack.Screen name="Signup" component={Signup} options={{ headerShown: false }} />
        <Stack.Screen name="Driversign" component={Driversign} options={{ headerShown: false }} />
        <Stack.Screen name="Passengersign" component={Passengersign} options={{ headerShown: false }} />
        <Stack.Screen name="Drawer1" component={PassengerDrawerNavigator} options={{ headerShown: false }} />
        <Stack.Screen name="Drawer2" component={DriverDrawerNavigator} options={{ headerShown: false }} />
        <Stack.Screen name="AdminLogin" component={AdminLogin} options={{ headerShown: false }} />
        <Stack.Screen name="AdminDashboard" component={AdminDrawerNavigator} options={{ headerShown: false }} />
        <Stack.Screen name="DRAccountInfo" component={DRAccountInfo} options={{ headerShown: false }} />
        <Stack.Screen name="UpdateDriver" component={UpdateDriver} options={{ headerShown: false }} />
        <Stack.Screen name="UpdatePassenger" component={UpdatePassenger} options={{ headerShown: false }} />
        <Stack.Screen name="AccountStatus" component={AccountStatus} options={{ headerShown: false }} />
        <Stack.Screen name="PSAccountInfo" component={PSAccountInfo} options={{ headerShown: false }} />
        <Stack.Screen name="DRDocument" component={DRDocument} options={{ headerShown: false }} />
        <Stack.Screen name="UserInfo" component={UserInfo} options={{ headerShown: false }} />
        <Stack.Screen name="DocsScreen" component={DocsScreen} options={{ headerShown: false }} />
        <Stack.Screen name="DRProfile" component={DRProfile} options={{ headerShown: false }} />
        <Stack.Screen name="PSProfile" component={PSProfile} options={{ headerShown: false }} />
        <Stack.Screen name="Dropoff" component={Dropoff} options={{ headerShown: false }} />
        <Stack.Screen name="RideListing" component={RideListing} options={{ headerShown: false }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
