import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  
    mobilecontainer: {
        flex: 1,
        backgroundColor: '#fdf2f3',
        alignItems: 'center',
        zIndex: 1,
      },
    
      button: {
        backgroundColor: '#0CC0DF',
        padding: 10,
        borderRadius: 5,
        width: '70%',
        justifyContent: 'center',
        alignItems: 'center',
        
      },

      button4: {
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
      
      List: {width: '100%', height: '100%',padding: 2, },

       progressBarContainer: {
        height: 42,
        width: '48%',
        backgroundColor: 'lightgray',
        borderRadius: 5,
        overflow: 'hidden',
        justifyContent: 'center'
      },
      progressBar: {
        backgroundColor: 'rgba(12, 192, 223, 0.5)',
        borderRadius: 5,
        height: '100%',
      },
      timerText: {
        fontSize: 14,
        fontFamily: 'Poppins-Bold',
        alignSelf: 'center',
      },
    
      button1: {
        backgroundColor: '#0CC0DF',
        padding: 10,
        borderRadius: 5,
        width: '48%',
        alignItems: 'center',
        marginBottom: 5,  
      },
      button200: {
        backgroundColor: 'white',
        padding: 10,
        borderRadius: 5,
        width: '48%',
        alignItems: 'center',
        marginBottom: 5,  
      },

      button5: {
        backgroundColor: 'white',
        padding: 10,
        borderRadius: 5,
        width: '25%',
        alignItems: 'center',
        marginBottom: 5,  
      },

      button6: {
        backgroundColor: 'white',
        justifyContent: 'center',
        height: 40,
        borderRadius: 5,
        width: '25%',
        alignItems: 'center',  
        backgroundColor: '#0CC0DF',
        flexDirection: 'row' 
      },
    
      rideItem: {
        padding: 10,
        width: '100%',
        alignSelf: 'center',
        backgroundColor: '#fff',
        borderBottomColor: 'lightgrey',
        borderBottomWidth: 2,
      },
    
      button2: {
        backgroundColor: '#0CC0DF',
        padding: 10,
        borderRadius: 5,
        width: '48%',
        justifyContent: 'center',
        alignItems: 'center',
        alignSelf: 'center'
        
      },
    
      button3: {
        backgroundColor: 'white',
        borderColor: '#0CC0DF',
        borderWidth: 2,
        padding: 10,
        borderRadius: 5,
        width: '48%',
        justifyContent: 'center',
        alignItems: 'center',
        alignSelf: 'center'
    
        
      },
      buttonText2: {
        color: '#0CC0DF',
        fontSize: 18,
        fontWeight: 'bold',
        fontFamily: 'Poppins-Regular',
      },
    
      buttonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
        fontFamily: 'Poppins-Regular',
      },
    
      searchContainer: {
        width: '92%',
        borderColor: '#0CC0DF',
        borderWidth: 1,
        borderRadius: 5,
        marginLeft: 25,
       
      },

      input: {
        width: '100%',
        padding: 10,
        borderColor: '#0CC0DF',
        borderWidth: 1,
        borderRadius: 5,
        height: 40
      },
    
      rideText:{
        fontFamily: 'Poppins-Regular',
        fontSize: 14,
      },

      valueTxt: {
        fontFamily: 'Poppins-Medium', fontSize: 14, marginTop: 5 
      },
      valueTxt1: {
        fontFamily: 'Poppins-Medium', fontSize: 12, 
      }
});
