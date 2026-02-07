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

// Helper to get user by email
async function getUserByEmail(email) {
  const userRecord = await admin.auth().getUserByEmail(email);
  const userDoc = await db.collection('users').doc(userRecord.uid).get();
  const userData = userDoc.data();
  return {
    uid: userRecord.uid,
    email: userRecord.email,
    startupId: userData.startupId,
  };
}

async function seedDemoData() {
  console.log('🌱 Seeding demo data...\n');

  try {
    // Get the founder user
    const founder = await getUserByEmail('founder@startup.com');
    console.log(`✅ Found user: ${founder.email} (${founder.uid})`);
    console.log(`   Startup ID: ${founder.startupId}\n`);

    // 1. SEED TASKS
    console.log('📝 Creating tasks...');
    const tasks = [
      {
        title: 'Conduct 10 customer interviews',
        description: 'Interview potential SMB customers about invoicing pain points',
        status: 'done',
        priority: 'high',
        dueDate: new Date('2026-01-15'),
        startupId: founder.startupId,
        createdBy: founder.uid,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      },
      {
        title: 'Build MVP landing page',
        description: 'Create simple landing page with waitlist signup',
        status: 'done',
        priority: 'high',
        dueDate: new Date('2026-01-20'),
        startupId: founder.startupId,
        createdBy: founder.uid,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      },
      {
        title: 'Develop core invoicing feature',
        description: 'Build basic invoice creation and PDF export',
        status: 'in-progress',
        priority: 'high',
        dueDate: new Date('2026-02-10'),
        startupId: founder.startupId,
        createdBy: founder.uid,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      },
      {
        title: 'Set up payment gateway integration',
        description: 'Integrate Stripe for subscription payments',
        status: 'todo',
        priority: 'medium',
        dueDate: new Date('2026-02-20'),
        startupId: founder.startupId,
        createdBy: founder.uid,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      },
      {
        title: 'Create demo video',
        description: '2-minute product demo video for marketing',
        status: 'todo',
        priority: 'low',
        dueDate: new Date('2026-01-05'), // Overdue!
        startupId: founder.startupId,
        createdBy: founder.uid,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      },
    ];

    for (const task of tasks) {
      await db.collection('tasks').add(task);
    }
    console.log(`   ✅ Created ${tasks.length} tasks\n`);

    // 2. SEED MILESTONES
    console.log('🎯 Creating milestones...');
    const milestones = [
      {
        title: 'MVP Beta Launch',
        description: 'Launch MVP to first 20 beta customers',
        status: 'in-progress',
        targetDate: new Date('2026-03-01'),
        metrics: '20 beta users, 70% completion rate',
        startupId: founder.startupId,
        createdBy: founder.uid,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      },
      {
        title: 'First Paying Customer',
        description: 'Get first customer to pay $50/month',
        status: 'pending',
        targetDate: new Date('2026-03-15'),
        metrics: '$50 MRR',
        startupId: founder.startupId,
        createdBy: founder.uid,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      },
      {
        title: 'Product-Market Fit Validation',
        description: 'Achieve 40% NPS and 60% retention',
        status: 'pending',
        targetDate: new Date('2026-05-01'),
        metrics: 'NPS 40+, 60% retention',
        startupId: founder.startupId,
        createdBy: founder.uid,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      },
    ];

    for (const milestone of milestones) {
      await db.collection('milestones').add(milestone);
    }
    console.log(`   ✅ Created ${milestones.length} milestones\n`);

    // 3. SEED FEEDBACK
    console.log('💬 Creating customer feedback...');
    const feedbacks = [
      {
        source: 'Interview - Sarah (SMB Owner)',
        summary: 'Loves the automation, willing to pay $75/month',
        type: 'positive',
        date: new Date('2026-01-10'),
        notes: 'Currently spending 5 hours/week on manual invoicing. Would save her 20 hours/month.',
        startupId: founder.startupId,
        createdBy: founder.uid,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      },
      {
        source: 'Beta User - Mike (Freelancer)',
        summary: 'UI is confusing, needs onboarding flow',
        type: 'negative',
        date: new Date('2026-01-25'),
        notes: 'Took 10 minutes to figure out how to create first invoice. Needs tutorial.',
        startupId: founder.startupId,
        createdBy: founder.uid,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      },
      {
        source: 'Interview - Lisa (Agency Owner)',
        summary: 'Wants bulk invoice feature for 50+ clients',
        type: 'feature_request',
        date: new Date('2026-02-01'),
        notes: 'Has 50+ recurring clients. Bulk creation would be killer feature.',
        startupId: founder.startupId,
        createdBy: founder.uid,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      },
      {
        source: 'Survey Response - John (Consultant)',
        summary: 'Price point is perfect, excited to switch',
        type: 'positive',
        date: new Date('2026-02-03'),
        notes: 'Currently paying $120/month for QuickBooks. Our $50 price is attractive.',
        startupId: founder.startupId,
        createdBy: founder.uid,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      },
    ];

    for (const feedback of feedbacks) {
      await db.collection('feedback').add(feedback);
    }
    console.log(`   ✅ Created ${feedbacks.length} feedback entries\n`);

    // 4. SEED DECISIONS
    console.log('📋 Creating decision log entries...');
    const decisions = [
      {
        title: 'Focus on SMBs (not enterprises)',
        context: 'Interviewed both SMBs and enterprises. SMBs have faster sales cycles.',
        options: ['Target enterprises', 'Target SMBs', 'Serve both'],
        chosenOption: 'Target SMBs',
        reasoning: '80% of interviews showed SMBs have urgent pain and can buy in 1 week vs 6 months for enterprise.',
        dataSupport: '12/15 SMBs said "I would buy today" vs 0/5 enterprises',
        expectedOutcome: 'Faster customer acquisition, $5K MRR in 3 months',
        actualOutcome: '',
        category: 'strategic',
        status: 'active',
        startupId: founder.startupId,
        createdBy: founder.uid,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      },
      {
        title: 'Price at $50/month (not $25)',
        context: 'Debated pricing between $25, $50, and $99/month tiers.',
        options: ['$25/month', '$50/month', '$99/month'],
        chosenOption: '$50/month',
        reasoning: 'Value-based pricing. Saving customers 20 hours/month = $400-800 value. $50 is 10x ROI.',
        dataSupport: '8/10 customers said they would pay $50-75/month',
        expectedOutcome: 'Higher revenue per customer, better unit economics',
        actualOutcome: 'First 3 customers signed at $50 without objection',
        category: 'business model',
        status: 'validated',
        startupId: founder.startupId,
        createdBy: founder.uid,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      },
    ];

    for (const decision of decisions) {
      await db.collection('decisions').add(decision);
    }
    console.log(`   ✅ Created ${decisions.length} decisions\n`);

    // 5. SEED ASSUMPTIONS
    console.log('🔬 Creating assumption board entries...');
    const assumptions = [
      {
        hypothesis: 'Small businesses spend 5+ hours/week on manual invoicing',
        category: 'problem',
        priority: 'high',
        status: 'validated',
        testMethod: '15 customer interviews',
        evidence: [
          { feedbackId: 'manual', supportsHypothesis: true, addedAt: new Date().toISOString() },
        ],
        linkedFeedback: [],
        validationScore: 87,
        startupId: founder.startupId,
        createdBy: founder.uid,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      },
      {
        hypothesis: 'Customers will pay $50/month for automation',
        category: 'business model',
        priority: 'high',
        status: 'testing',
        testMethod: 'Pricing interviews + beta signups',
        evidence: [
          { feedbackId: 'price1', supportsHypothesis: true, addedAt: new Date().toISOString() },
          { feedbackId: 'price2', supportsHypothesis: true, addedAt: new Date().toISOString() },
        ],
        linkedFeedback: [],
        validationScore: 80,
        startupId: founder.startupId,
        createdBy: founder.uid,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      },
      {
        hypothesis: 'Freelancers are our primary customer segment',
        category: 'customer',
        priority: 'medium',
        status: 'invalidated',
        testMethod: 'Customer interviews',
        evidence: [
          { feedbackId: 'seg1', supportsHypothesis: false, addedAt: new Date().toISOString() },
          { feedbackId: 'seg2', supportsHypothesis: false, addedAt: new Date().toISOString() },
        ],
        linkedFeedback: [],
        validationScore: 25,
        startupId: founder.startupId,
        createdBy: founder.uid,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      },
      {
        hypothesis: 'Users need mobile app for on-the-go invoicing',
        category: 'solution',
        priority: 'low',
        status: 'untested',
        testMethod: 'Survey + interviews',
        evidence: [],
        linkedFeedback: [],
        validationScore: 0,
        startupId: founder.startupId,
        createdBy: founder.uid,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      },
    ];

    for (const assumption of assumptions) {
      await db.collection('assumptions').add(assumption);
    }
    console.log(`   ✅ Created ${assumptions.length} assumptions\n`);

    console.log('\n====================================');
    console.log('✅ DEMO DATA SEEDED SUCCESSFULLY!');
    console.log('====================================\n');
    console.log('You can now:');
    console.log('1. Login as: founder@startup.com / Founder123!');
    console.log('2. View Health Meter (should show some risks)');
    console.log('3. Check Investor Readiness Timeline');
    console.log('4. Review Decision Log');
    console.log('5. Explore Assumption Board');
    console.log('6. See "What Should I Do Next?" suggestions\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding data:', error);
    process.exit(1);
  }
}

seedDemoData();
