const admin = require('firebase-admin');
const path = require('path');

// Initialize Firebase Admin
const serviceAccount = require(path.resolve(__dirname, '../../startup-1205-9080f-firebase-adminsdk-fbsvc-798a473ed9.json'));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function seedAssumptions() {
  try {
    console.log('🌱 Starting to seed assumptions data...');

    // Get all founders
    const usersSnapshot = await db.collection('users').where('role', '==', 'founder').get();
    
    if (usersSnapshot.empty) {
      console.log('❌ No founders found. Please create a founder account first.');
      return;
    }

    const founders = usersSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    console.log(`✅ Found ${founders.length} founder(s)`);

    // Sample assumptions templates
    const assumptionTemplates = [
      {
        category: 'Problem',
        assumptions: [
          {
            title: 'Students struggle to order food late at night',
            description: 'Hostel students face difficulty ordering food after 10 PM as most food delivery services stop operating in campus areas.',
            hypothesis: 'If we provide a 24/7 food ordering service specifically for hostel students, they will use it regularly',
            priority: 'high',
            confidenceLevel: 3,
            targetAudience: ['students'],
            status: 'identified'
          },
          {
            title: 'Current food delivery apps are too expensive for students',
            description: 'Students find existing food delivery platforms expensive due to high delivery charges and surge pricing.',
            hypothesis: 'Students will prefer a budget-friendly alternative with lower or no delivery charges',
            priority: 'high',
            confidenceLevel: 4,
            targetAudience: ['students'],
            status: 'testing'
          },
          {
            title: 'Group ordering is inconvenient on current platforms',
            description: 'When students want to order together, splitting bills and coordinating orders is cumbersome.',
            hypothesis: 'A built-in group ordering and bill splitting feature will increase order frequency',
            priority: 'medium',
            confidenceLevel: 2,
            targetAudience: ['students'],
            status: 'identified'
          }
        ]
      },
      {
        category: 'Solution',
        assumptions: [
          {
            title: 'Students will use a dedicated hostel food app',
            description: 'A specialized app for hostel students will be more appealing than general food delivery apps.',
            hypothesis: 'Students will download and actively use an app designed specifically for their hostel needs',
            priority: 'high',
            confidenceLevel: 5,
            targetAudience: ['students'],
            status: 'testing'
          },
          {
            title: 'Pre-ordering feature will improve experience',
            description: 'Allowing students to schedule orders in advance will help them plan meals better.',
            hypothesis: 'At least 30% of users will use pre-ordering for breakfast and dinner',
            priority: 'medium',
            confidenceLevel: 3,
            targetAudience: ['students'],
            status: 'identified'
          }
        ]
      },
      {
        category: 'Market',
        assumptions: [
          {
            title: 'Hostel market is large enough to be viable',
            description: 'There are enough hostel students in target cities to build a sustainable business.',
            hypothesis: 'We can acquire 10,000+ active users within the first 6 months in tier-2 cities',
            priority: 'critical',
            confidenceLevel: 4,
            targetAudience: ['students', 'business'],
            status: 'testing'
          },
          {
            title: 'Students will recommend the app to friends',
            description: 'Word-of-mouth marketing will be effective in hostel communities.',
            hypothesis: 'Each satisfied user will refer at least 3 friends within 2 months',
            priority: 'high',
            confidenceLevel: 3,
            targetAudience: ['students'],
            status: 'identified'
          }
        ]
      },
      {
        category: 'Business Model',
        assumptions: [
          {
            title: 'Commission-based model will be acceptable to restaurants',
            description: 'Local restaurants near hostels will agree to our commission structure.',
            hypothesis: 'We can onboard 50+ restaurants with 15-20% commission',
            priority: 'critical',
            confidenceLevel: 4,
            targetAudience: ['business'],
            status: 'testing'
          },
          {
            title: 'Subscription model will work for frequent users',
            description: 'Students who order frequently will pay for a monthly subscription to save on delivery.',
            hypothesis: 'At least 20% of active users will convert to monthly subscription at ₹99/month',
            priority: 'high',
            confidenceLevel: 2,
            targetAudience: ['students'],
            status: 'identified'
          }
        ]
      }
    ];

    // Create assumptions for each founder
    for (const founder of founders) {
      console.log(`\n📝 Creating assumptions for founder: ${founder.email}`);
      
      let totalCreated = 0;

      for (const category of assumptionTemplates) {
        for (const assumption of category.assumptions) {
          const assumptionData = {
            founderId: founder.id,
            ...assumption,
            category: category.category,
            evidenceCollected: [],
            responseCount: 0,
            validationScore: 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };

          await db.collection('assumptions').add(assumptionData);
          totalCreated++;
        }
      }

      console.log(`✅ Created ${totalCreated} assumptions for ${founder.email}`);
    }

    console.log('\n✨ Assumptions seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding assumptions:', error);
    process.exit(1);
  }
}

seedAssumptions();
