const admin = require('firebase-admin');
require('dotenv').config();

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  }),
});

const db = admin.firestore();

const dummyAccounts = [
  {
    email: 'founder@startup.com',
    password: 'Founder123!',
    displayName: 'Sarah Johnson',
    role: 'founder',
    startupData: {
      name: 'TechVenture AI',
      stage: 'mvp',
      industry: 'Artificial Intelligence',
      description: 'AI-powered customer service automation for SMBs',
      foundedDate: '2025-09-01',
      teamSize: 4,
    }
  },
  {
    email: 'team@startup.com',
    password: 'Team123!',
    displayName: 'Alex Chen',
    role: 'team_member',
    startupData: {
      name: 'TechVenture AI',
      stage: 'mvp',
      industry: 'Artificial Intelligence',
      description: 'AI-powered customer service automation for SMBs',
      foundedDate: '2025-09-01',
      teamSize: 4,
    }
  },
];

async function createDummyAccounts() {
  console.log('🚀 Creating dummy accounts...\n');

  for (const account of dummyAccounts) {
    try {
      // Create user in Firebase Auth
      const userRecord = await admin.auth().createUser({
        email: account.email,
        password: account.password,
        displayName: account.displayName,
        emailVerified: true,
      });

      console.log(`✅ Created user: ${account.email}`);

      // Create user document in Firestore
      await db.collection('users').doc(userRecord.uid).set({
        email: account.email,
        displayName: account.displayName,
        role: account.role,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      // Create startup profile
      const startupRef = await db.collection('startups').add({
        ...account.startupData,
        founderId: userRecord.uid,
        founderEmail: account.email,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      console.log(`   📊 Created startup: ${account.startupData.name}`);

      // Update user with startupId
      await db.collection('users').doc(userRecord.uid).update({
        startupId: startupRef.id,
      });

      console.log(`   🔗 Linked user to startup\n`);

    } catch (error) {
      if (error.code === 'auth/email-already-exists') {
        console.log(`⚠️  User ${account.email} already exists, skipping...\n`);
      } else {
        console.error(`❌ Error creating ${account.email}:`, error.message);
      }
    }
  }

  console.log('\n====================================');
  console.log('✅ DUMMY ACCOUNTS CREATED!\n');
  console.log('Login credentials:');
  dummyAccounts.forEach(acc => {
    console.log(`\n📧 ${acc.email}`);
    console.log(`🔑 ${acc.password}`);
    console.log(`👤 Role: ${acc.role} | Startup: ${acc.startupData.name}`);
  });
  console.log('\n====================================\n');

  process.exit(0);
}

createDummyAccounts().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
