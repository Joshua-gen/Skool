// vehicleUtils.js
import { firestore, auth } from '../../Config';
import imagesPath from '../../src/imagesPath';

export const fetchVehicleClass = async (setVehicleClass) => {
  const currentUser = auth.currentUser;
  if (!currentUser) return;

  try {
    const userDoc = await firestore.collection('users').doc(currentUser.uid).get();
    if (userDoc.exists) {
      const userData = userDoc.data();
      if (userData.vehicleClass) {
        setVehicleClass(userData.vehicleClass); // Set vehicle type
      } else {
        console.error('Vehicle type not found in user document');
      }
    } else {
      console.error('User document does not exist');
    }
  } catch (error) {
    console.error('Error fetching vehicle type: ', error);
  }
};

export const getCarImage = (vehicleClass, sedanImage, motorcycleImage, suvImage) => {
  switch (vehicleClass) {
    case 'Sedan':
      return imagesPath.sedanImage;
    case 'Motorcycle':
      return imagesPath.motorcycleImage;
    case 'Suv':
      return imagesPath.suvImage;
    default:
      return null;
  }
};

// declare seat to the firebase once the drive create ride 
export const getSeatConfiguration = (vehicleClass) => {
  let Seats = {};

  if (vehicleClass === 'Sedan') {
    Seats = { Seat1: false, Seat2: false, Seat3: false };
  } else if (vehicleClass === 'Suv') {
    Seats = { Seat1: false, Seat2: false, Seat3: false, Seat4: false, Seat5: false };
  } else if (vehicleClass === 'Motorcycle') {
    Seats = { Seat1: false };
  }

  return Seats;
};
