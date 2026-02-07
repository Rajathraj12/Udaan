const { db, auth } = require('../config/firebase');

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split('Bearer ')[1];
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    // Verify Firebase ID token using Firebase Admin SDK
    const decodedToken = await auth.verifyIdToken(token);
    
    // Console log for debugging
    console.log('Verified Firebase user:', { uid: decodedToken.uid, email: decodedToken.email });
    
    // Fetch user profile from Firestore to get role and startupId
    const userDoc = await db.collection('users').doc(decodedToken.uid).get();
    let userProfile = {};
    
    if (userDoc.exists) {
      userProfile = userDoc.data();
      console.log('User profile:', { role: userProfile.role, startupId: userProfile.startupId });
    }
    
    // Attach user data to request
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      role: userProfile.role || 'team_member',
      startupId: userProfile.startupId || null,
    };
    
    next();
  } catch (error) {
    console.error('Auth middleware error:', error.message);
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

module.exports = authMiddleware;
