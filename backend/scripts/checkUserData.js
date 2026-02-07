const admin = require('firebase-admin');
const path = require('path');

// Initialize Firebase
const serviceAccount = require(path.join(__dirname, '../../startup-1205-9080f-firebase-adminsdk-fbsvc-798a473ed9.json'));
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
const auth = admin.auth();

async function checkUserData() {
  try {
    // Get user by email
    const userRecord = await auth.getUserByEmail('founder@startup.com');
    console.log('\n📧 Firebase Auth User:');
    console.log('UID:', userRecord.uid);
    console.log('Email:', userRecord.email);
    
    // Get user document from Firestore
    const userDoc = await db.collection('users').doc(userRecord.uid).get();
    
    if (userDoc.exists) {
      console.log('\n📄 Firestore User Document:');
      console.log(JSON.stringify(userDoc.data(), null, 2));
      
      const userData = userDoc.data();
      if (userData.startupId) {
        // Get startup data
        const startupDoc = await db.collection('startups').doc(userData.startupId).get();
        if (startupDoc.exists) {
          console.log('\n🚀 Startup Data:');
          console.log(JSON.stringify(startupDoc.data(), null, 2));
        } else {
          console.log('\n⚠️  Startup document not found!');
        }
      } else {
        console.log('\n⚠️  WARNING: User document has NO startupId field!');
      }
    } else {
      console.log('\n❌ User document not found in Firestore!');
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  }
  
  process.exit(0);
}

checkUserData();
