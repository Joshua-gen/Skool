import { firestore } from '../Config'; // Adjust the import based on your project structure

export const createReport = async (reporterUserId, reportedUserId, rideId, issueDescription, additionalData = {}) => {
  try {
    console.log('Creating report...'); // Debugging line

    // Prepare the report data
    const reportData = {
      reporterUserId,       // The ID of the user creating the report (current user)
      reportedUserId,      // The ID of the user being reported
      rideId,               // The ID of the ride related to the report
      issueDescription,     // Description of the issue
      timestamp: new Date(), // Timestamp when the report was created
      ...additionalData,    // Any additional data you want to store
    };

    console.log('Report data:', reportData); // Log the data being sent

    // Add the report to the Firestore 'Reports' collection
    await firestore.collection('Reports').add(reportData);

    console.log('Report created successfully');
  } catch (error) {
    console.error('Error creating report:', error);
  }
};
