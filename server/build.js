const fs = require('fs');
const path = require('path');

const distDir = path.join(__dirname, 'dist');
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

// Entrypoint template that explicitly imports express, creates app, and mounts the server
const entryContent = `const express = require('express');
const serverApp = require('../server');

const app = express();
app.use(serverApp);

module.exports = app;
`;

fs.writeFileSync(path.join(distDir, 'index.js'), entryContent);
fs.writeFileSync(path.join(distDir, 'server.js'), entryContent);
fs.writeFileSync(path.join(distDir, 'app.js'), entryContent);

console.log('✅ Server entrypoints created in server/dist/ (index.js, server.js, app.js with express imported)');
