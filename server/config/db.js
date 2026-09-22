const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

const defaultDbPath = path.join(__dirname, '..', 'data', 'db.json');
const dataDir = process.env.VERCEL ? path.join('/tmp', 'data') : path.join(__dirname, '..', 'data');
const jsonDbPath = process.env.VERCEL ? path.join('/tmp', 'data', 'db.json') : defaultDbPath;

// Ensure data folder exists
if (!fs.existsSync(dataDir)) {
  try {
    fs.mkdirSync(dataDir, { recursive: true });
  } catch (e) {}
}

let isMongoConnected = false;

// In-memory cache for fast JSON operations
let jsonStore = {
  users: [],
  content: {},
  stats: [],
  services: [],
  caseStudies: [],
  testimonials: [],
  faqs: [],
  leads: []
};

// Load existing JSON DB if present
let raw = null;
if (fs.existsSync(jsonDbPath)) {
  try {
    raw = fs.readFileSync(jsonDbPath, 'utf8');
  } catch (err) {}
} else if (fs.existsSync(defaultDbPath)) {
  try {
    raw = fs.readFileSync(defaultDbPath, 'utf8');
  } catch (err) {}
}

if (raw) {
  try {
    jsonStore = { ...jsonStore, ...JSON.parse(raw) };
  } catch (err) {
    console.error('Error loading db.json:', err.message);
  }
}

const saveJsonDb = () => {
  try {
    fs.writeFileSync(jsonDbPath, JSON.stringify(jsonStore, null, 2), 'utf8');
  } catch (err) {
    console.error('Error saving local db.json:', err.message);
  }
};

const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/phonixemedia';
  try {
    // Attempt connecting to MongoDB with a short timeout
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 2000
    });
    isMongoConnected = true;
    console.log(`✅ MongoDB Connected successfully: ${mongoose.connection.host}`);
  } catch (err) {
    isMongoConnected = false;
    console.log(`⚠️  Local MongoDB not running. Using embedded JSON database (${jsonDbPath}).`);
    console.log(`💡 All features, authentication, and admin changes will work seamlessly!`);
  }
};

// Data Store Abstraction Bridge for JSON mode
const getStore = () => jsonStore;
const isConnectedToMongo = () => isMongoConnected;

module.exports = {
  connectDB,
  getStore,
  saveJsonDb,
  isConnectedToMongo
};
