import { firestore } from '../Config';

// Update rating for the given user
export const updateRating = async (userId, newRating, count, isDriver = false) => {
  const userRef = firestore.collection('users').doc(userId);

  try {
    await firestore.runTransaction(async (transaction) => {
      const userDoc = await transaction.get(userRef);
      if (!userDoc.exists) {
        throw new Error('User does not exist!');
      }

      const userData = userDoc.data();
      const currentRating = userData.rating || 0;
      const currentCount = userData.ratingCount || 0;

      // Calculate new rating
      const updatedRating = (currentRating * currentCount + newRating) / (currentCount + 1);

      transaction.update(userRef, {
        rating: updatedRating,
        ratingCount: currentCount + 1,
      });
    });
  } catch (error) {
    console.error('Error updating rating:', error);
  }
};
