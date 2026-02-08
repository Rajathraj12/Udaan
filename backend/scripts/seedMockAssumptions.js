const { admin, db } = require('../src/config/firebase');

const mockAssumptions = {
  problem: [
    {
      category: 'problem',
      title: 'Students struggle to find affordable food late at night',
      description: 'College students often stay up late studying and face limited food options after 11 PM',
      status: 'untested',
      priority: 'high',
      validationMethod: 'Survey',
      confidence: 30
    },
    {
      category: 'problem',
      title: 'Hostel mess food quality is inconsistent',
      description: 'Students are unhappy with the quality and variety of food in hostel mess',
      status: 'testing',
      priority: 'high',
      validationMethod: 'Interviews',
      confidence: 45
    }
  ],
  solution: [
    {
      category: 'solution',
      title: 'Mobile app for late-night food ordering',
      description: 'A platform that connects students with nearby restaurants and cloud kitchens for late-night delivery',
      status: 'untested',
      priority: 'high',
      validationMethod: 'Prototype',
      confidence: 25
    },
    {
      category: 'solution',
      title: 'Subscription-based healthy meal plans',
      description: 'Monthly subscription for balanced, nutritious meals delivered to hostel',
      status: 'validated',
      priority: 'medium',
      validationMethod: 'MVP',
      confidence: 75
    }
  ],
  market: [
    {
      category: 'market',
      title: 'Target market: 50,000+ college students',
      description: 'Initial focus on tier-1 city colleges with 50,000+ students in 5km radius',
      status: 'testing',
      priority: 'high',
      validationMethod: 'Market Research',
      confidence: 60
    },
    {
      category: 'market',
      title: 'Students willing to pay ₹100-200 per meal',
      description: 'Market research shows students budget ₹100-200 for quality food',
      status: 'validated',
      priority: 'high',
      validationMethod: 'Survey',
      confidence: 80
    }
  ],
  customer: [
    {
      category: 'customer',
      title: 'Primary users are 18-24 year old students',
      description: 'Target demographic is college students living in hostels',
      status: 'validated',
      priority: 'high',
      validationMethod: 'User Interviews',
      confidence: 85
    },
    {
      category: 'customer',
      title: 'Students prefer digital payment over cash',
      description: 'Most students use UPI and digital wallets for transactions',
      status: 'validated',
      priority: 'medium',
      validationMethod: 'Survey',
      confidence: 90
    }
  ],
  competition: [
    {
      category: 'competition',
      title: 'Zomato and Swiggy have high delivery charges',
      description: 'Existing food delivery apps charge ₹40-60 delivery fee which is expensive for students',
      status: 'validated',
      priority: 'medium',
      validationMethod: 'Competitive Analysis',
      confidence: 95
    }
  ]
};

async function seedMockAssumptions() {
  try {
    console.log('🌱 Starting to seed mock assumptions...\n');

    // Get all founders
    const usersSnapshot = await db.collection('users')
      .where('role', '==', 'founder')
      .get();

    if (usersSnapshot.empty) {
      console.log('❌ No founders found in database');
      return;
    }

    console.log(`✅ Found ${usersSnapshot.size} founder(s)\n`);

    for (const userDoc of usersSnapshot.docs) {
      const userId = userDoc.id;
      const userData = userDoc.data();
      
      console.log(`👤 Processing founder: ${userData.email || userId}`);

      // Get or use the startup ID
      let startupId = userData.startupId;
      
      if (!startupId) {
        // Create a startup if it doesn't exist
        const startupRef = await db.collection('startups').add({
          founderId: userId,
          name: userData.startupName || 'My Startup',
          createdAt: admin.firestore.FieldValue.serverTimestamp()
        });
        startupId = startupRef.id;
        
        // Update user with startupId
        await userDoc.ref.update({
          startupId: startupId
        });
        
        console.log(`  ✨ Created new startup: ${startupId}`);
      }

      // Check if assumptions already exist
      const existingAssumptions = await db.collection('assumptions')
        .where('startupId', '==', startupId)
        .limit(1)
        .get();

      if (!existingAssumptions.empty) {
        console.log(`  ⏭️  Assumptions already exist for this startup, skipping...\n`);
        continue;
      }

      // Create assumptions for each category
      let totalAssumptions = 0;
      
      for (const [category, assumptions] of Object.entries(mockAssumptions)) {
        for (const assumption of assumptions) {
          const assumptionData = {
            ...assumption,
            startupId,
            founderId: userId,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            validationCount: 0,
            feedbackCount: 0
          };

          await db.collection('assumptions').add(assumptionData);
          totalAssumptions++;
        }
      }

      console.log(`  ✅ Created ${totalAssumptions} mock assumptions`);
      console.log(`  📊 Breakdown:`);
      console.log(`     • Problem: ${mockAssumptions.problem.length}`);
      console.log(`     • Solution: ${mockAssumptions.solution.length}`);
      console.log(`     • Market: ${mockAssumptions.market.length}`);
      console.log(`     • Customer: ${mockAssumptions.customer.length}`);
      console.log(`     • Competition: ${mockAssumptions.competition.length}`);
      console.log('');
    }

    console.log('🎉 Mock assumptions seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding mock assumptions:', error);
    process.exit(1);
  }
}

// Run the script
seedMockAssumptions();
