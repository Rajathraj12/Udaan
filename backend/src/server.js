const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',') : '*',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/tasks', require('./routes/tasks'));
app.use('/api/milestones', require('./routes/milestones'));
app.use('/api/feedback', require('./routes/feedback'));
app.use('/api/feedback-forms', require('./routes/feedbackForms'));
app.use('/api/startups', require('./routes/startups'));
app.use('/api/analytics', require('./routes/analytics'));

// New Feature Routes
app.use('/api/health', require('./routes/health'));
app.use('/api/investor-readiness', require('./routes/investorReadiness'));
app.use('/api/decisions', require('./routes/decisions'));
app.use('/api/assumptions', require('./routes/assumptions'));
app.use('/api/suggestions', require('./routes/suggestions'));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start server
// Listen on 0.0.0.0 to allow connections from physical devices on the same network
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 Server accessible at:`);
  console.log(`   - Local: http://localhost:${PORT}`);
  console.log(`   - Network: http://10.211.18.24:${PORT} (or your computer's IP)`);
});

module.exports = app;
