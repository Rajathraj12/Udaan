const express = require('express');
const router = express.Router();
const { db, auth } = require('../config/firebase');
const authMiddleware = require('../middleware/auth');
const jwt = require('jsonwebtoken');
const axios = require('axios');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Signup endpoint
router.post('/signup', async (req, res) => {
  try {
    const { email, password, role, startupName } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    if (!role || !['founder', 'team_member'].includes(role)) {
      return res.status(400).json({ error: 'Valid role is required (founder or team_member)' });
    }

    if (role === 'founder' && !startupName) {
      return res.status(400).json({ error: 'Startup name is required for founders' });
    }

    // Create Firebase user
    const userRecord = await auth.createUser({
      email,
      password,
      emailVerified: false,
    });

    // Create startup document if founder
    let startupId = null;
    if (role === 'founder') {
      const startupRef = await db.collection('startups').add({
        name: startupName,
        founderId: userRecord.uid,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      startupId = startupRef.id;
    }

    // Create user document
    const userData = {
      uid: userRecord.uid,
      email,
      role,
      startupId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await db.collection('users').doc(userRecord.uid).set(userData);

    // Generate JWT token with startupId
    const token = jwt.sign({ 
      uid: userRecord.uid, 
      email, 
      role,
      startupId 
    }, JWT_SECRET, { expiresIn: '30d' });

    res.status(201).json({
      message: 'User created successfully',
      token,
      user: userData,
    });
  } catch (error) {
    console.error('Signup error:', error);
    if (error.code === 'auth/email-already-exists') {
      return res.status(400).json({ error: 'Email already exists' });
    }
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// Login endpoint
router.post('/login', async (req, res) => {
  try {
    console.log('Login attempt received:', req.body.email);
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      console.log('Missing email or password');
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Verify password using Firebase REST API
    const firebaseApiKey = process.env.FIREBASE_WEB_API_KEY || 'AIzaSyBXM-ca43AJDnSvtiyysUMD3xsbqoLk8y8';
    
    console.log('Verifying with Firebase...');
    let firebaseUser;
    try {
      const authResponse = await axios.post(
        `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${firebaseApiKey}`,
        {
          email,
          password,
          returnSecureToken: true
        }
      );
      firebaseUser = authResponse.data;
      console.log('Firebase auth successful');
    } catch (firebaseError) {
      console.error('Firebase auth error:', firebaseError.response?.data || firebaseError.message);
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Get user data from Firestore
    console.log('Fetching user from Firestore...');
    const userDoc = await db.collection('users').doc(firebaseUser.localId).get();

    if (!userDoc.exists) {
      console.log('User profile not found');
      return res.status(404).json({ error: 'User profile not found' });
    }

    const userData = userDoc.data();
    console.log('User found:', userData.email);

    // Generate JWT token with startupId
    const token = jwt.sign({ 
      uid: firebaseUser.localId, 
      email: userData.email, 
      role: userData.role,
      startupId: userData.startupId 
    }, JWT_SECRET, { expiresIn: '30d' });

    console.log('Login successful for:', email);
    res.json({
      message: 'Login successful',
      token,
      user: userData,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Get current user profile
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const userDoc = await db.collection('users').doc(req.user.uid).get();
    
    if (!userDoc.exists) {
      return res.status(404).json({ error: 'User profile not found' });
    }

    res.json(userDoc.data());
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to fetch user profile' });
  }
});

// Update user profile
router.put('/profile', authMiddleware, async (req, res) => {
  try {
    const { displayName, role } = req.body;
    
    await db.collection('users').doc(req.user.uid).update({
      displayName,
      role,
      updatedAt: new Date().toISOString(),
    });

    res.json({ message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

module.exports = router;
