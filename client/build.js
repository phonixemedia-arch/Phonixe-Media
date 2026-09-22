import { execSync } from 'child_process';

console.log('⚡ Building Vite client...');
execSync('npx vite build', { stdio: 'inherit' });
console.log('✅ Vite client built successfully!');
