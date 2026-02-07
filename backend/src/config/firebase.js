const admin = require('firebase-admin');
const path = require('path');

// Initialize Firebase Admin SDK
// Try to use service account file first, fallback to environment variables
try {
  const serviceAccountPath = path.join(__dirname, '../../../startup-1205-9080f-firebase-adminsdk-fbsvc-798a473ed9.json');
  const serviceAccount = require(serviceAccountPath);
  
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
  
  console.log('✅ Firebase initialized with service account file');
} catch (error) {
  // Fallback to environment variables
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    }),
  });
  
  console.log('✅ Firebase initialized with environment variables');
}

const db = admin.firestore();
const auth = admin.auth();

module.exports = { admin, db, auth };
