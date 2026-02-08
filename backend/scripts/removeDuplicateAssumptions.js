const { admin, db } = require('../src/config/firebase');

async function removeDuplicateAssumptions() {
  try {
    console.log('🧹 Starting to remove duplicate assumptions...\n');

    // Get all assumptions
    const assumptionsSnapshot = await db.collection('assumptions').get();
    
    if (assumptionsSnapshot.empty) {
      console.log('❌ No assumptions found in database');
      return;
    }

    console.log(`📊 Total assumptions found: ${assumptionsSnapshot.size}\n`);

    // Group assumptions by startupId
    const assumptionsByStartup = {};
    
    assumptionsSnapshot.docs.forEach(doc => {
      const data = doc.data();
      const startupId = data.startupId || 'unknown';
      
      if (!assumptionsByStartup[startupId]) {
        assumptionsByStartup[startupId] = [];
      }
      
      assumptionsByStartup[startupId].push({
        id: doc.id,
        ...data
      });
    });

    let totalRemoved = 0;

    // Process each startup's assumptions
    for (const [startupId, assumptions] of Object.entries(assumptionsByStartup)) {
      console.log(`\n🏢 Processing startup: ${startupId}`);
      console.log(`   Total assumptions: ${assumptions.length}`);
      
      // Track unique assumptions by content
      const seen = new Map();
      const duplicatesToRemove = [];
      
      assumptions.forEach(assumption => {
        // Create a unique key based on content
        const key = `${assumption.hypothesis || ''}_${assumption.category || ''}_${assumption.priority || ''}`;
        
        if (seen.has(key)) {
          // This is a duplicate - keep the one with most recent createdAt
          const existing = seen.get(key);
          const existingDate = existing.createdAt?.toDate?.() || new Date(existing.createdAt || 0);
          const currentDate = assumption.createdAt?.toDate?.() || new Date(assumption.createdAt || 0);
          
          if (currentDate > existingDate) {
            // Current is newer, mark existing as duplicate
            duplicatesToRemove.push(existing.id);
            seen.set(key, assumption);
          } else {
            // Existing is newer or same, mark current as duplicate
            duplicatesToRemove.push(assumption.id);
          }
        } else {
          // First occurrence
          seen.set(key, assumption);
        }
      });
      
      // Remove duplicates
      if (duplicatesToRemove.length > 0) {
        console.log(`   🗑️  Removing ${duplicatesToRemove.length} duplicate(s)...`);
        
        for (const docId of duplicatesToRemove) {
          await db.collection('assumptions').doc(docId).delete();
          totalRemoved++;
        }
        
        console.log(`   ✅ Kept ${seen.size} unique assumption(s)`);
      } else {
        console.log(`   ✨ No duplicates found`);
      }
    }

    console.log(`\n🎉 Cleanup completed!`);
    console.log(`📊 Total duplicates removed: ${totalRemoved}`);
    console.log(`📊 Total unique assumptions remaining: ${assumptionsSnapshot.size - totalRemoved}`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error removing duplicate assumptions:', error);
    process.exit(1);
  }
}

// Run the script
removeDuplicateAssumptions();
