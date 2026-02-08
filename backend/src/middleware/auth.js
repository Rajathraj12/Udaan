const { db, auth } = require('../config/firebase');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split('Bearer ')[1];
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    let decodedToken;
    let isFirebaseToken = false;

    // Try Firebase ID token verification first (for web app)
    try {
      decodedToken = await auth.verifyIdToken(token);
      isFirebaseToken = true;
      console.log('Verified Firebase ID token:', { uid: decodedToken.uid, email: decodedToken.email });
    } catch (firebaseError) {
      // If Firebase verification fails, try JWT verification (for mobile app)
      try {
        decodedToken = jwt.verify(token, JWT_SECRET);
        console.log('Verified JWT token:', { uid: decodedToken.uid, email: decodedToken.email });
      } catch (jwtError) {
        console.error('Token verification failed:', jwtError.message);
        return res.status(401).json({ error: 'Invalid or expired token' });
      }
    }

    // If Firebase token, fetch user data from Firestore
    if (isFirebaseToken) {
      const userDoc = await db.collection('users').doc(decodedToken.uid).get();
      
      if (!userDoc.exists) {
        return res.status(401).json({ error: 'User not found in database' });
      }
      
      const userData = userDoc.data();
      
      req.user = {
        uid: decodedToken.uid,
        email: decodedToken.email,
        role: userData.role || 'team_member',
        startupId: userData.startupId || null,
      };
    } else {
      // JWT token already has all the data
      req.user = {
        uid: decodedToken.uid,
        email: decodedToken.email,
        role: decodedToken.role || 'team_member',
        startupId: decodedToken.startupId || null,
      };
    }
    
    next();
  } catch (error) {
    console.error('Auth middleware error:', error.message);
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

module.exports = authMiddleware;
