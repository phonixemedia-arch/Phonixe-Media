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
  origin: '*',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/services', servicesRoutes);
app.use('/api/case-studies', caseStudiesRoutes);
app.use('/api/testimonials', testimonialsRoutes);
app.use('/api/faqs', faqRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/leads', leadsRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date(), app: 'Phonixe Media MERN' });
});

// Multi-path static frontend discovery (works on local, Render, Heroku, Docker, or Vercel)
const candidatePaths = [
  path.join(__dirname, 'public'),
  path.join(__dirname, '..', 'dist'),
  path.join(__dirname, '..', 'client', 'dist'),
  path.join(process.cwd(), 'server', 'public'),
  path.join(process.cwd(), 'dist'),
  path.join(process.cwd(), 'client', 'dist')
];

let publicPath = candidatePaths.find(p => fs.existsSync(path.join(p, 'index.html'))) || path.join(__dirname, 'public');

// Mount static middleware for all found paths
candidatePaths.forEach(p => {
  if (fs.existsSync(p)) {
    app.use(express.static(p));
  }
});

// Fallback to React index.html for SPA client-side routing
app.get('*', (req, res) => {
  for (const p of candidatePaths) {
    const indexPath = path.join(p, 'index.html');
    if (fs.existsSync(indexPath)) {
      return res.sendFile(indexPath);
    }
  }

  res.send(`
    <!DOCTYPE html>
    <html>
    <head><title>Phonixe Media API</title></head>
    <body style="background:#0c0d11;color:#fff;font-family:sans-serif;padding:40px;text-align:center;">
      <h1 style="color:#e5a93c;">🦅 Phonixe Media Backend API is Running</h1>
      <p style="color:#9eabb8;">The React client build was not found in server/public or dist.</p>
      <p style="margin-top:20px;"><strong>Admin Credentials:</strong> ID: <code>admin</code> | Password: <code>phonixe@2026</code></p>
      <p><a href="/api/content" style="color:#ffd700;">View Live Content JSON &rarr;</a></p>
    </body>
    </html>
  `);
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
