require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
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

// Serve static build from public folder if present
const publicPath = path.join(__dirname, 'public');
app.use(express.static(publicPath));

// Fallback to React index.html for SPA client-side routing
app.get('*', (req, res) => {
  const indexPath = path.join(publicPath, 'index.html');
  if (require('fs').existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.send(`
      <!DOCTYPE html>
      <html>
      <head><title>Phonixe Media API</title></head>
      <body style="background:#0c0d11;color:#fff;font-family:sans-serif;padding:40px;text-align:center;">
        <h1 style="color:#e5a93c;">🦅 Phonixe Media Backend API is Running</h1>
        <p style="color:#9eabb8;">The React client is running on <a href="http://localhost:3000" style="color:#ffd700;">http://localhost:3000</a> (Vite Dev Server) or run <code>npm run build</code> to serve from this port.</p>
        <p style="margin-top:20px;"><strong>Admin Credentials:</strong> ID: <code>admin</code> | Password: <code>phonixe@2026</code></p>
        <p><a href="/api/content" style="color:#ffd700;">View Live Content JSON &rarr;</a></p>
      </body>
      </html>
    `);
  }
});

app.listen(PORT, () => {
  console.log('====================================================');
  console.log(`🚀 Phonixe Media Server listening on port ${PORT}`);
  console.log(`🌐 Landing Page / API: http://localhost:${PORT}`);
  console.log(`🛡️ Admin API:         http://localhost:${PORT}/api/auth/login`);
  console.log(`📦 Health check:       http://localhost:${PORT}/api/health`);
  console.log('====================================================');
});
