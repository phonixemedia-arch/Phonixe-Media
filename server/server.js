require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { connectDB } = require('./config/db');
const seedData = require('./seed');

// Import routes
const authRoutes = require('./routes/authRoutes');
const contentRoutes = require('./routes/contentRoutes');
const servicesRoutes = require('./routes/servicesRoutes');
const caseStudiesRoutes = require('./routes/caseStudiesRoutes');
const testimonialsRoutes = require('./routes/testimonialsRoutes');
const faqRoutes = require('./routes/faqRoutes');
const statsRoutes = require('./routes/statsRoutes');
const leadsRoutes = require('./routes/leadsRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Connect Database & Seed initial data
(async () => {
  await connectDB();
  await seedData();
})();

// Middleware
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Register API Routes for both /api and root prefix (serverless compatibility)
const registerRoutes = (prefix = '') => {
  app.use(`${prefix}/auth`, authRoutes);
  app.use(`${prefix}/content`, contentRoutes);
  app.use(`${prefix}/services`, servicesRoutes);
  app.use(`${prefix}/case-studies`, caseStudiesRoutes);
  app.use(`${prefix}/testimonials`, testimonialsRoutes);
  app.use(`${prefix}/faqs`, faqRoutes);
  app.use(`${prefix}/stats`, statsRoutes);
  app.use(`${prefix}/leads`, leadsRoutes);
  app.get(`${prefix}/health`, (req, res) => {
    res.json({ status: 'healthy', timestamp: new Date(), app: 'Phonixe Media MERN' });
  });
};

registerRoutes('/api');
registerRoutes('');

// Status endpoints: Show "Phonixe Media Backend Server is working"
app.get('/', (req, res) => {
  res.send('Phonixe Media Backend Server is working');
});

app.get('/api', (req, res) => {
  res.send('Phonixe Media Backend Server is working');
});

// Fallback for any unknown route
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found', message: 'Phonixe Media Backend Server is working' });
});

if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log('====================================================');
    console.log(`🚀 Phonixe Media Server listening on port ${PORT}`);
    console.log(`🌐 Landing Page / API: http://localhost:${PORT}`);
    console.log(`🛡️ Admin API:         http://localhost:${PORT}/api/auth/login`);
    console.log(`📦 Health check:       http://localhost:${PORT}/api/health`);
    console.log('====================================================');
  });
}

module.exports = app;
