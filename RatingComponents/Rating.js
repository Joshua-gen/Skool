import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Rating } from 'react-native-ratings';

const CustomRating = ({ onRatingChange, currentRating = 0 }) => {
  const [rating, setRating] = useState(currentRating);

  const handleRatingCompleted = (value) => {
    setRating(value);
    if (onRatingChange) {
      onRatingChange(value);
    }
  };

  return (
    <View style={styles.container}>
      <Rating
        startingValue={rating}
        imageSize={50}
        onFinishRating={handleRatingCompleted}
        style={styles.rating}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
  },
  label: {
    fontSize: 16,
    marginRight: 10,
  },
  rating: {
    paddingVertical: 10,
  },
  
});

export default CustomRating;
