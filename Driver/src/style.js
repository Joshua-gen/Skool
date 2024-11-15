import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  
    container: {
        flex: 1,
      
        backgroundColor: '#f5f5f5',
      },
      loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#0CC0DF',
      },
      emptyText: {
        textAlign: 'center',
        fontSize: 18,
        color: '#666',
      },
      button: {
        backgroundColor: '#0CC0DF',
        padding: 10,
        borderRadius: 5,
        width: '45%',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,        
      },
    
      rideItem: {
        padding: 10,
        height: '100%',
        width: '100%',
        alignSelf: 'center',
        backgroundColor: '#fff',
        borderColor: '#0CC0DF',
        borderWidth: 1  ,
        borderRadius: 8,
        shadowColor: '#000', // Shadow color
        shadowOffset: { width: 0, height: 2 }, // Offset for the shadow (x, y)
        shadowOpacity: 0.25, // Opacity of the shadow
        shadowRadius: 3.84, // Shadow blur radius
        // Android shadow
        elevation: 5, // Elevation for Android
      },
      rideText: {
        fontSize: 12,
        fontFamily: 'Poppins-Regular'
      },
      input: {
        width: '100%',
        padding: 10,
        borderColor: '#0CC0DF',
        borderWidth: 1,
        borderRadius: 5,
        height: 40
      },
    
      value:{
        fontSize: 14,
        fontFamily: 'Poppins-Medium',
      },
      label:{
        fontSize: 12,
        fontFamily: 'Poppins-Regular',
      },
      seats: {
        width: '50%', 
        borderColor: 'black', 
        borderWidth: 1, 
        height: 150,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
      },
      seatContainer: {
        width: '100%',
        marginTop: 10,
        borderLeftColor: '#0CC0DF',
        backgroundColor: 'white',
        borderLeftWidth: 3,
        alignItems: 'center',
        shadowColor: '#000', // Shadow color
        shadowOffset: { width: 0, height: 2 }, // Offset for the shadow (x, y)
        shadowOpacity: 0.25, // Opacity of the shadow
        shadowRadius: 3.84, // Shadow blur radius
        // Android shadow
        elevation: 5, // Elevation for Android
      },
      seatText: {
        fontFamily: 'Poppins-Medium',
        fontSize: 14, 
      },
    
      occupiedText: {
        fontFamily: 'Poppins-Regular',
        fontSize: 12,
        color: 'red',
      },
    
      availableText: {
        fontFamily: 'Poppins-Regular',
        fontSize: 12,
        color: 'green',
      },
    
      seatVal: { 
        flexDirection: 'row', 
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '95%'
      },
      seatVal2: { 
        width: '95%',
      },
      searchContainer: {
        width: '92%',
        borderColor: '#0CC0DF',
        height: 50,
        borderWidth: 1,
        borderRadius: 5,
        marginBottom: 5,
        height: 'auto',
      },
    
      dropoff: {
        alignSelf: 'flex-end', marginRight: 10, marginBottom: 10
      },

      buttonP: {
        backgroundColor: 'white',
        borderWidth: 2,
        borderColor:  '#0CC0DF',
        padding: 10,
        borderRadius: 5,
        width: '45%',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,      
      },
    
      pssLabel: {fontFamily: 'Poppins-Regular', fontSize: 10},
      pssValue: {fontFamily: 'Poppins-Medium', fontSize: 13}
});
