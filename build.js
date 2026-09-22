const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('📦 Starting Phonixe Media build...');

// 1. Install & build client
const clientDir = path.join(__dirname, 'client');
console.log('⚡ Installing client dependencies & compiling Vite frontend...');
execSync('npm install', { cwd: clientDir, stdio: 'inherit' });
execSync('npm run build', { cwd: clientDir, stdio: 'inherit' });

// 2. Mirror client/dist to root ./dist for hosting compatibility
const clientDist = path.join(clientDir, 'dist');
const rootDist = path.join(__dirname, 'dist');

if (fs.existsSync(clientDist)) {
  fs.cpSync(clientDist, rootDist, { recursive: true });
  console.log('✅ Mirrored frontend build to ./dist');
}

console.log('🚀 Phonixe Media build completed successfully!');
