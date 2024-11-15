// Import the Firebase Admin SDK
const admin = require('firebase-admin');

// Path to your service account key JSON file
const serviceAccount = require('./skool-2721d-firebase-adminsdk-rt22w-263d13b7fc');

// Initialize the Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://skool-2721d.firebaseio.com'
});

// Your Firebase Admin SDK is now initialized and ready to use
