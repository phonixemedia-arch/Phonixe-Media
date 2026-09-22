const fs = require('fs');
const path = require('path');

const distDir = path.join(__dirname, 'dist');
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

// Entrypoint wrapper delegating to server.js
const entryContent = `const app = require('../server');

module.exports = app;
`;

fs.writeFileSync(path.join(distDir, 'index.js'), entryContent);
fs.writeFileSync(path.join(distDir, 'server.js'), entryContent);
fs.writeFileSync(path.join(distDir, 'app.js'), entryContent);

console.log('✅ Server entrypoints created in server/dist/ (index.js, server.js, app.js)');
