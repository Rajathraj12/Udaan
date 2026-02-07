const admin = require('firebase-admin');
const path = require('path');

// Initialize Firebase Admin with service account
const serviceAccount = require(path.join(__dirname, '../../startup-1205-9080f-firebase-adminsdk-fbsvc-798a473ed9.json'));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function checkAndCreateTeamAccounts() {
  console.log('🔍 Checking team member accounts...\n');

  const teamAccounts = [
    {
      email: 'team@startup.com',
      password: 'Team123!',
      displayName: 'Alex Chen',
      role: 'team_member'
    },
    {
      email: 'developer@startup.com',
      password: 'Dev123!',
      displayName: 'Jordan Smith',
      role: 'team_member'
    }
  ];

  // First, get the founder's startup
  let founderStartupId = null;
  try {
    const founderEmail = 'founder@startup.com';
    const founderUser = await admin.auth().getUserByEmail(founderEmail);
    const founderDoc = await db.collection('users').doc(founderUser.uid).get();
    
    if (founderDoc.exists) {
      founderStartupId = founderDoc.data().startupId;
      console.log(`✅ Found founder's startup: ${founderStartupId}\n`);
    }
  } catch (error) {
    console.log('⚠️  Founder account not found, team members will not be linked to a startup\n');
  }

  for (const account of teamAccounts) {
    try {
      // Check if user exists
      let userRecord;
      try {
        userRecord = await admin.auth().getUserByEmail(account.email);
        console.log(`✅ User ${account.email} already exists in Firebase Auth`);
      } catch (error) {
        if (error.code === 'auth/user-not-found') {
          // Create user in Firebase Auth
          userRecord = await admin.auth().createUser({
            email: account.email,
            password: account.password,
            displayName: account.displayName,
            emailVerified: true,
          });
          console.log(`✅ Created Firebase Auth user: ${account.email}`);
        } else {
          throw error;
        }
      }

      // Check and create/update Firestore document
      const userDocRef = db.collection('users').doc(userRecord.uid);
      const userDoc = await userDocRef.get();

      const userData = {
        email: account.email,
        displayName: account.displayName,
        role: account.role,
        startupId: founderStartupId,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      };

      if (!userDoc.exists) {
        userData.createdAt = admin.firestore.FieldValue.serverTimestamp();
        await userDocRef.set(userData);
        console.log(`✅ Created Firestore document for ${account.email}`);
      } else {
        await userDocRef.update(userData);
        console.log(`✅ Updated Firestore document for ${account.email}`);
      }

      console.log(`   📧 Email: ${account.email}`);
      console.log(`   🔑 Password: ${account.password}`);
      console.log(`   👤 Role: ${account.role}\n`);

    } catch (error) {
      console.error(`❌ Error processing ${account.email}:`, error.message);
      console.error(error);
    }
  }

  console.log('\n====================================');
  console.log('✅ TEAM ACCOUNTS CHECK COMPLETE!\n');
  console.log('You can now login with:');
  teamAccounts.forEach(acc => {
    console.log(`\n📧 ${acc.email}`);
    console.log(`🔑 ${acc.password}`);
  });
  console.log('\n====================================\n');

  await admin.app().delete();
  process.exit(0);
}

checkAndCreateTeamAccounts().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
