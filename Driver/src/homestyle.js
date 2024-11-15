import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  
    mobilecontainer: {
        flex: 1,
        backgroundColor: '#fdf2f3',
        alignItems: 'center',
      },
    
      rideItem: {
        backgroundColor: '#fff',
        padding: 10,
        marginVertical: 10,
        borderRadius: 8,
        shadowColor: '#000', // Shadow color
        shadowOffset: { width: 0, height: 2 }, // Offset for the shadow (x, y)
        shadowOpacity: 0.25, // Opacity of the shadow
        shadowRadius: 3.84, // Shadow blur radius
           // Android shadow
        elevation: 5, // Elevation for Android
      },
    
      button: {
        backgroundColor: '#0CC0DF',
        borderRadius: 100,
        width: 50,
        marginTop: 10,
        marginRight: 10,
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000', // Shadow color
        shadowOffset: { width: 0, height: 2 }, // Offset for the shadow (x, y)
        shadowOpacity: 0.25, // Opacity of the shadow
        shadowRadius: 3.84, // Shadow blur radius
           // Android shadow
        elevation: 5, // Elevation for Android
        
      },

      button300: {
        backgroundColor: 'rgba(12, 192, 223, 0.5)',
        borderRadius: 100,
        width: 50,
        marginTop: 10,
        marginRight: 10,
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000', // Shadow color
        shadowOffset: { width: 0, height: 2 }, // Offset for the shadow (x, y)
        shadowOpacity: 0.25, // Opacity of the shadow
        shadowRadius: 3.84, // Shadow blur radius
           // Android shadow
        elevation: 5, // Elevation for Android
        
      },
    
      buttonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
        fontFamily: 'Poppins-Regular',
      },
    
      floatingComment: {
        backgroundColor: 'white',
        padding: 8,
        borderRadius: 5,
        justifyContent: 'center',
        height: 50,
        shadowColor: '#000', // Shadow color
        shadowOffset: { width: 0, height: 2 }, // Offset for the shadow (x, y)
        shadowOpacity: 0.25, // Opacity of the shadow
        shadowRadius: 3.84, // Shadow blur radius
           // Android shadow
        elevation: 5, // Elevation for Android
      },
      commentText: {
        color: '#0CC0DF',
        fontSize: 14,
        fontFamily: 'Poppins-Medium'
      },
    
      button2: {
        backgroundColor: '#0CC0DF',
        height: 30,
        borderRadius: 5,
        width: '45%',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10, 
      },
      button3: {
        backgroundColor: '#C0C0C0',
        height: 30,
        borderRadius: 5,
        width: '45%',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10, 
      },
    
      buttonText2: {
        color: 'white',
        fontSize: 14,
        fontFamily: 'Poppins-Medium'
      },
    
      buttonText3: {
        color: 'red',
        fontSize: 14,
        fontFamily: 'Poppins-Medium'
      },
    
      label: {
        fontSize: 16,
        fontWeight: 'bold',
      },
    
      value: {
        fontSize: 14,
        marginBottom: 5,
      },
    
      conCreate: {alignSelf: 'flex-end', flexDirection: 'row', alignItems: 'center', width: '50%', justifyContent: 'space-between', },
});
