import React, { useState } from 'react';
import { View, Image, Text, Button, StyleSheet, ScrollView, TouchableOpacity, Modal,} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import Entypo from '@expo/vector-icons/Entypo';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import AntDesign from '@expo/vector-icons/AntDesign';


const DRDocument = ({ route, navigation }) => {
  const { user } = route.params;
// taposon mo ni haa fetching Images

  const [isModalVisible, setModalVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  const openImageModal = (imageUri) => {
    setSelectedImage(imageUri);
    setModalVisible(true);
  };
  return (
    <View style={styles.container}>
      <View style={{backgroundColor: '#0CC0DF', width: '100%', height: 50, alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between'}}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{marginLeft: 5}}
        >
          <Ionicons name="arrow-back" size={28} color="white" />
        </TouchableOpacity>
          <Text style={{fontFamily: 'Poppins-Medium', fontSize: 18, marginRight: 10, color: 'white'}}>Driver Documents</Text>
      </View>
    
        <ScrollView style={{width: '100%', }}>
          <View style={{alignItems: 'center', width: '100%', paddingTop: 10 }}>
            
            <Text style={[styles.imgTitle, {fontSize: 20, marginBottom: 5, marginTop: 20}]}>Formal Photo</Text>
            <View style={styles.imageCon}>
              <View style={{width: 150, height: 150, marginBottom: 20,}}>
                <Text style={styles.imgTitle}>Formal Photo</Text>
                {user.formalPhoto && (
                    <Image
                    source={{ uri: user.formalPhoto }}
                    style={styles.image}
                    onError={(e) => console.log('Error loading image: ', e.nativeEvent.error)}
                    />
                )}
                <TouchableOpacity style={{position:'absolute', marginTop: 140, marginLeft: 120}} onPress={() => openImageModal(user.formalPhoto)}>
                  <FontAwesome5 name="expand" size={24} color="white"/>
                </TouchableOpacity>
              </View>
            </View>
            
            <Text style={[styles.imgTitle, {fontSize: 20, marginBottom: 5, marginTop: 20}]}>University ID</Text>
            <View style={styles.imageCon}>
              <View style={{width: 150, height: 150, marginBottom: 20,}}>
                <Text style={styles.imgTitle}>University ID Front</Text>
                {user.universityIDfront && (
                    <Image
                    source={{ uri: user.universityIDfront }}
                    style={styles.image}
                    onError={(e) => console.log('Error loading image: ', e.nativeEvent.error)}
                    />
                )}
                <TouchableOpacity style={{position:'absolute', marginTop: 140, marginLeft: 120}} onPress={() => openImageModal(user.universityIDfront)}>
                  <FontAwesome5 name="expand" size={24} color="white"/>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.imageCon}>
              <View style={{width: 150, height: 150, marginBottom: 20,}}>
                <Text style={styles.imgTitle}>University ID Back</Text>
                {user.universityIDback && (
                    <Image
                    source={{ uri: user.universityIDback }}
                    style={styles.image}
                    onError={(e) => console.log('Error loading image: ', e.nativeEvent.error)}
                    />
                )}
                <TouchableOpacity style={{position:'absolute', marginTop: 140, marginLeft: 120}} onPress={() => openImageModal(user.universityIDback)}>
                  <FontAwesome5 name="expand" size={24} color="white"/>
                </TouchableOpacity>
              </View>
            </View>

            <Text style={[styles.imgTitle, {fontSize: 20, marginBottom: 5, marginTop: 20}]}>Drivers License</Text>
            <View style={styles.imageCon}>
              <View style={{width: 150, height: 150, marginBottom: 20,}}>
                <Text style={styles.imgTitle}>Drivers License Front</Text>
                {user.driversLicenseFront && (
                    <Image
                    source={{ uri: user.driversLicenseFront }}
                    style={styles.image}
                    onError={(e) => console.log('Error loading image: ', e.nativeEvent.error)}
                    />
                )}
                <TouchableOpacity style={{position:'absolute', marginTop: 140, marginLeft: 120}} onPress={() => openImageModal(user.driversLicenseFront)}>
                  <FontAwesome5 name="expand" size={24} color="white"/>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.imageCon}>
              <View style={{width: 150, height: 150, marginBottom: 20,}}>
                <Text style={styles.imgTitle}>Drivers License Back</Text>
                {user.driversLicenseBack && (
                    <Image
                    source={{ uri: user.driversLicenseBack }}
                    style={styles.image}
                    onError={(e) => console.log('Error loading image: ', e.nativeEvent.error)}
                    />
                )}
                <TouchableOpacity style={{position:'absolute', marginTop: 140, marginLeft: 120}} onPress={() => openImageModal(user.driversLicenseBack)}>
                  <FontAwesome5 name="expand" size={24} color="white"/>
                </TouchableOpacity>
              </View>
            </View>

            <Text style={[styles.imgTitle, {fontSize: 20, marginBottom: 5, marginTop: 20}]}>OR & CR</Text>
            <View style={styles.imageCon}>
              <View style={{width: 150, height: 150, marginBottom: 20,}}>
                <Text style={styles.imgTitle}>OR</Text>
                {user.oR && (
                    <Image
                    source={{ uri: user.oR }}
                    style={styles.image}
                    onError={(e) => console.log('Error loading image: ', e.nativeEvent.error)}
                    />
                )}
                <TouchableOpacity style={{position:'absolute', marginTop: 140, marginLeft: 120}} onPress={() => openImageModal(user.oR)}>
                  <FontAwesome5 name="expand" size={24} color="white"/>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.imageCon}>
              <View style={{width: 150, height: 150, marginBottom: 20,}}>
                <Text style={styles.imgTitle}>CR</Text>
                {user.cR && (
                    <Image
                    source={{ uri: user.cR }}
                    style={styles.image}
                    onError={(e) => console.log('Error loading image: ', e.nativeEvent.error)}
                    />
                )}
                <TouchableOpacity style={{position:'absolute', marginTop: 140, marginLeft: 120}} onPress={() => openImageModal(user.cR)}>
                  <FontAwesome5 name="expand" size={24} color="white"/>
                </TouchableOpacity>
              </View>
            </View>

            <Text style={[styles.imgTitle, {fontSize: 20, marginBottom: 5, marginTop: 20}]}>5 Point Vehicle View</Text>
            <View style={styles.imageCon}>
              <View style={{width: 150, height: 150, marginBottom: 20,}}>
                <Text style={styles.imgTitle}>Front</Text>
                {user.vehicleFront && (
                    <Image
                    source={{ uri: user.vehicleFront}}
                    style={styles.image}
                    onError={(e) => console.log('Error loading image: ', e.nativeEvent.error)}
                    />
                )}
                <TouchableOpacity style={{position:'absolute', marginTop: 140, marginLeft: 120}} onPress={() => openImageModal(user.vehicleFront)}>
                  <FontAwesome5 name="expand" size={24} color="white"/>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.imageCon}>
              <View style={{width: 150, height: 150, marginBottom: 20,}}>
                <Text style={styles.imgTitle}>Back</Text>
                {user.vehicleBack && (
                    <Image
                    source={{ uri: user.vehicleBack }}
                    style={styles.image}
                    onError={(e) => console.log('Error loading image: ', e.nativeEvent.error)}
                    />
                )}
                <TouchableOpacity style={{position:'absolute', marginTop: 140, marginLeft: 120}} onPress={() => openImageModal(user.vehicleBack)}>
                  <FontAwesome5 name="expand" size={24} color="white"/>
                </TouchableOpacity>
              </View>
              
            </View>

            <View style={styles.imageCon}>
              <View style={{width: 150, height: 150, marginBottom: 20,}}>
                <Text style={styles.imgTitle}>Left</Text>
                {user.vehicleLeft && (
                    <Image
                    source={{ uri: user.vehicleLeft }}
                    style={styles.image}
                    onError={(e) => console.log('Error loading image: ', e.nativeEvent.error)}
                    />
                )}
                <TouchableOpacity style={{position:'absolute', marginTop: 140, marginLeft: 120}} onPress={() => openImageModal(user.vehicleLeft)}>
                  <FontAwesome5 name="expand" size={24} color="white"/>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.imageCon}>
              <View style={{width: 150, height: 150, marginBottom: 20,}}>
                <Text style={styles.imgTitle}>Right</Text>
                {user.vehicleRight && (
                    <Image
                    source={{ uri: user.vehicleRight }}
                    style={styles.image}
                    onError={(e) => console.log('Error loading image: ', e.nativeEvent.error)}
                    />
                )}
                <TouchableOpacity style={{position:'absolute', marginTop: 140, marginLeft: 120}} onPress={() => openImageModal(user.vehicleRight)}>
                  <FontAwesome5 name="expand" size={24} color="white"/>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.imageCon}>
              <View style={{width: 150, height: 150, marginBottom: 20,}}>
                <Text style={styles.imgTitle}>Upper</Text>
                {user.vehicleUpper&& (
                    <Image
                    source={{ uri: user.vehicleUpper }}
                    style={styles.image}
                    onError={(e) => console.log('Error loading image: ', e.nativeEvent.error)}
                    />
                )}
                <TouchableOpacity style={{position:'absolute', marginTop: 140, marginLeft: 120}} onPress={() => openImageModal(user.vehicleUpper)}>
                  <FontAwesome5 name="expand" size={24} color="white"/>
                </TouchableOpacity>
              </View>
            </View>

            
          </View>
      </ScrollView>
   
      <Modal visible={isModalVisible} transparent={true} onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalContainer}>
          <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeButton}>
            <AntDesign name="close" size={24} color="white" />  
          </TouchableOpacity>
          {selectedImage && <Image source={{ uri: selectedImage }} style={styles.fullscreenImage} />}
        </View>
      </Modal>

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: 150,
    height: 150,
  },
  imgTitle:{
    fontFamily: 'Poppins-Regular',
  },

  reCon: {alignItems: 'center', marginLeft: 20, justifyContent: 'center', width: '40%', height: 100, alignSelf: 'center' },

  imageCon: {width: '95%', height: 'auto', flexDirection: 'row', marginBottom: 10, borderLeftColor: '#0CC0DF', borderLeftWidth: 2, 
    padding: 10,
    justifyContent: 'center', alignItems: 'center',
    shadowColor: '#000', // Shadow color
    shadowOffset: { width: 0, height: 2 }, // Offset for the shadow (x, y)
    shadowOpacity: 0.25, // Opacity of the shadow
    shadowRadius: 3.84, // Shadow blur radius
       // Android shadow
    elevation: 1, // Elevation for Android
   },
   modalContainer: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.8)', justifyContent: 'center', alignItems: 'center' },
  fullscreenImage: { width: '90%', height: '80%', resizeMode: 'contain' },
  closeButton: { position: 'absolute', top: 40, right: 20,},
});

export default DRDocument;
