import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, TouchableHighlight, Alert, ScrollView, Dimensions, TouchableOpacity } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import moment from 'moment'; 
import { auth, firestore } from '../Config';
import Loading from '../src/loading';
import Header from '../src/Header';
import { PieChart } from 'react-native-gifted-charts';
import { Picker } from '@react-native-picker/picker';
import Octicons from '@expo/vector-icons/Octicons';
import FontAwesome from '@expo/vector-icons/FontAwesome';


const AdminDashboard = ({ navigation }) => {
  const [ridesData, setRidesData] = useState({ completed: 0, canceled: 0 });
  const [userStats, setUserStats] = useState({ totalUsers: 0, totalPassengers: 0, verifiedDrivers: 0, driverApplicants: 0 });
  const [loading, setLoading] = useState(true);
  const [lineChartData, setLineChartData] = useState([]);
  const [ filteredChartData,  setFilteredChartData] = useState();

   // State for selected month and year
   const [selectedMonth, setSelectedMonth] = useState(moment().format('MM')); // Default to current month
   const [selectedYear, setSelectedYear] = useState(moment().format('YYYY')); // Default to current year

  useEffect(() => {
    const fetchRideData = async () => {
      try {
        const ridesSnapshot = await firestore.collection('Ride').get();
        let completedCount = 0;
        let canceledCount = 0;
        const dailySuccessCount = {};

        ridesSnapshot.forEach((doc) => {
          const ride = doc.data();
          if (ride.isFinish) {
            if (ride.cancel) {
              canceledCount += 1;  // Ride is canceled
            } else {
              completedCount += 1;  // Ride is completed
              
              // Count completed rides by date
              const date = moment(ride.finishTime.toDate()).format('YYYY-MM-DD');
              dailySuccessCount[date] = (dailySuccessCount[date] || 0) + 1;
            }
          }
        });

        setRidesData({ completed: completedCount, canceled: canceledCount });

        // Prepare data for line chart
        const lineData = Object.keys(dailySuccessCount).map(date => ({
          label: date,  // x-axis label
          value: dailySuccessCount[date],  // y-axis value
        }));
        setLineChartData(lineData);

        // Fetch user data
        const usersSnapshot = await firestore.collection('users').get();
        let totalUsers = 0;
        let totalPassengers = 0;
        let verifiedDrivers = 0;
        let driverApplicants = 0;

        usersSnapshot.forEach((doc) => {
          const user = doc.data();
          totalUsers += 1;
          if (user.userType === 'Passenger') {
            totalPassengers += 1;
          } else if (user.userType === 'Driver') {
            if (user.isVerified) {
              verifiedDrivers += 1;
            } else {
              driverApplicants += 1;
            }
          }
        });

        setUserStats({
          totalUsers,
          totalPassengers,
          verifiedDrivers,
          driverApplicants,
        });

        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    };

    fetchRideData();
  }, []);

  // Filter data based on selected month and year
  useEffect(() => {
    const filteredData = lineChartData.filter((data) => {
      const date = moment(data.label);
      return date.format('MM') === selectedMonth && date.format('YYYY') === selectedYear;
    });
    setFilteredChartData(filteredData);
  }, [lineChartData, selectedMonth, selectedYear]);

  if (loading) {
    return <Loading />;
  }
  
  const handleLogout = async () => {
    try {
      await auth.signOut();
      Alert.alert('Logged out', 'You have been logged out successfully.');
      navigation.navigate('AdminLogin');
    } catch (error) {
      console.error('Logout Error:', error);
      Alert.alert('Logout Error', error.message);
    }
  };

  if (loading) {
    return <Loading />;
  }

  const pieChartData = [
    { value: ridesData.completed || 0, label: 'Completed', color: 'green' },
    { value: ridesData.canceled || 0, label: 'Canceled', color: 'red' },
  ];

  return (
    <View style={styles.container}>
      <Header />
      <ScrollView style={{ width: '100%',}}>
      <View style={{alignItems: 'center', width: '100%', }}>
        <Text style={{fontFamily: 'Poppins-SemiBold', fontSize: 20, marginTop: 10}}>Users</Text>
        <View style={{width: '95%', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'}}>
          <TouchableOpacity style={styles.statCon} onPress={() => navigation.navigate('PassengerAcc')}>
            <Text style={styles.statsText}>
                Total Student Passenger
            </Text>
            <Text style={[styles.statsText, {fontSize: 18, marginLeft: 5}]}>
              {userStats.totalPassengers}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.statCon}>
            <Text style={styles.statsText}>
              Total Overall User
            </Text>
            <Text style={[styles.statsText, {fontSize: 18, marginLeft: 5}]}>
              {userStats.totalUsers}
            </Text> 
          </TouchableOpacity>
        </View>

        <View style={{width: '95%', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'}}>
          <TouchableOpacity style={styles.statCon}>
            <Text style={styles.statsText}>
                Total Verified Driver
            </Text>
            <Text style={[styles.statsText, {fontSize: 18, marginLeft: 5}]}>
              {userStats.verifiedDrivers}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.statCon}>
            <Text style={styles.statsText}>
              Total Driver Applicant
            </Text>
            <Text style={[styles.statsText, {fontSize: 18, marginLeft: 5}]}>
              {userStats.driverApplicants}
            </Text> 
          </TouchableOpacity>
        </View>
        
        <Text style={{fontFamily: 'Poppins-SemiBold', fontSize: 20, marginTop: 20}}>Ride Statistics</Text>
        <PieChart
          data={pieChartData}
          innerRadius={50}
          radius={80}
          showText
          textColor="black"
          textSize={16}
          isAnimated
          donut={true}
        />

        <View style={{width: '95%', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'}}>
          <View style={styles.statCon}>
            <View style={{flexDirection: 'row', justifyContent: 'space-between', width: '98%'}}>
              <Text style={styles.statsText}>
                Successful Rides
              </Text>
              <FontAwesome name="bar-chart" size={24} color="green" />
            </View>
            <Text style={[styles.statsText, {fontSize: 18, marginLeft: 5}]}>
              {ridesData.completed}
            </Text>
          </View>

          <View style={styles.statCon}>
            <View style={{flexDirection: 'row', justifyContent: 'space-between', width: '98%'}}>
              <Text style={styles.statsText}>
                Canceled Rides
              </Text>
              <FontAwesome name="bar-chart" size={24} color="red" />
            </View>
            <Text style={[styles.statsText, {fontSize: 18, marginLeft: 5}]}>
              {ridesData.canceled}  
            </Text> 
          </View>
        </View>
        
        <Text style={{fontFamily: 'Poppins-SemiBold', fontSize: 20, marginTop: 20}}>Successful Rides for {moment(selectedMonth, 'MM').format('MMMM')} {selectedYear}</Text>
        <View style={{width: '94%', flexDirection: 'row', alignItems: 'center', marginBottom: 10  }}>
          <View style={styles.datePicM}>
            <Picker
              selectedValue={selectedMonth}
              onValueChange={(itemValue) => setSelectedMonth(itemValue)}
              style={styles.picker}
            >
              {Array.from({ length: 12 }, (_, i) => (
                <Picker.Item
                  key={i}
                  label={moment().month(i).format('MMMM')}
                  value={String(i + 1).padStart(2, '0')}
                />
              ))}
            </Picker>
          </View>
          <View style={[styles.datePicY, {marginLeft: 20}]}>
            <Picker
              selectedValue={selectedYear}
              onValueChange={(itemValue) => setSelectedYear(itemValue)}
              style={styles.picker}
            >
              {Array.from({ length: 5 }, (_, i) => (
                <Picker.Item
                  key={i}
                  label={String(moment().year() - i)}
                  value={String(moment().year() - i)}
                />
              ))}
            </Picker>
          </View>
        </View>

        <LineChart
          data={{
            labels: filteredChartData.map(d => moment(d.label).format('D')), // Show only day of the month on x-axis
            datasets: [{ data: filteredChartData.map(d => d.value) }]
          }}
          width={Dimensions.get('window').width - 22}
          height={220}
          yAxisLabel=""
          yAxisSuffix=" rides"
          chartConfig={{
            backgroundGradientFrom: '#0CC0DF', // Gradient starting color
            backgroundGradientFromOpacity: 1, // Opacity for the starting color
            backgroundGradientTo: '#A3E3E8', // Gradient ending color for a smoother transition
            backgroundGradientToOpacity: 1, // Opacity for the ending color
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
          }}
          style={styles.chartStyle}
        />


        <TouchableHighlight style={styles.button} onPress={handleLogout}>
          <Text style={styles.buttonText}>Logout</Text>
        </TouchableHighlight>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginVertical: 20,
  },
  button: {
    backgroundColor: '#4CAF50',
    padding: 10,
    borderRadius: 5,
    marginTop: '30%',

  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
 statCon: {
  width: '48%', 
  backgroundColor: '#0CC0DF',
  height: 75,
  borderRadius: 5,
  padding: 10,
  marginTop: 10,

},

 statsText:{
  fontFamily: 'Poppins-SemiBold',
  color: 'white',
  fontSize: 11,
 }, 
 datePicM: {width: '50%', borderColor: '#0CC0DF', borderWidth: 2, height: 30, justifyContent: 'center' },
 datePicY: {width: '40%', borderColor: '#0CC0DF', borderWidth: 2, height: 30, justifyContent: 'center' },

});

export default AdminDashboard;
