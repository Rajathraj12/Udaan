const admin = require('firebase-admin');
const path = require('path');

// Initialize Firebase Admin
try {
  const serviceAccountPath = path.join(__dirname, '../../startup-1205-9080f-firebase-adminsdk-fbsvc-798a473ed9.json');
  const serviceAccount = require(serviceAccountPath);
  
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
  
  console.log('✅ Firebase initialized\n');
} catch (error) {
  console.error('Error initializing Firebase:', error);
  process.exit(1);
}

const db = admin.firestore();

const accountsToDelete = [
  'investor@demo.com',
  'mentor@test.com',
];

async function cleanupOldAccounts() {
  console.log('🧹 Cleaning up old accounts...\n');

  for (const email of accountsToDelete) {
    try {
      // Get user by email
      const userRecord = await admin.auth().getUserByEmail(email);
      const uid = userRecord.uid;

      // Get user document to find startupId
      const userDoc = await db.collection('users').doc(uid).get();
      const userData = userDoc.data();
      const startupId = userData?.startupId;

      // Delete from Firestore - users collection
      await db.collection('users').doc(uid).delete();
      console.log(`   📄 Deleted Firestore user document: ${email}`);

      // Delete startup if it exists
      if (startupId) {
        await db.collection('startups').doc(startupId).delete();
        console.log(`   🏢 Deleted associated startup`);
      }

      // Delete from Firebase Auth
      await admin.auth().deleteUser(uid);
      console.log(`✅ Deleted account: ${email}\n`);

    } catch (error) {
      if (error.code === 'auth/user-not-found') {
        console.log(`⚠️  User not found: ${email} (already deleted)\n`);
      } else {
        console.error(`❌ Error deleting ${email}:`, error.message, '\n');
      }
    }
  }

  console.log('====================================');
  console.log('✅ CLEANUP COMPLETE!');
  console.log('\nRemaining accounts:');
  console.log('📧 founder@startup.com');
  console.log('📧 team@startup.com');
  console.log('====================================\n');
  
  process.exit(0);
}

cleanupOldAccounts();
