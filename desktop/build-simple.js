const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Building Todo Calendar Desktop App (Simple)...\n');

// Colors for console output
const colors = {
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

function log(message, color = 'green') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function error(message) {
  console.log(`${colors.red}❌ ${message}${colors.reset}`);
}

function success(message) {
  console.log(`${colors.green}✅ ${message}${colors.reset}`);
}

function info(message) {
  console.log(`${colors.blue}ℹ️  ${message}${colors.reset}`);
}

try {
  // Step 1: Build frontend
  log('Step 1: Building frontend...', 'blue');
  const frontendPath = path.join(__dirname, '..', 'frontend');
  
  if (!fs.existsSync(frontendPath)) {
    throw new Error('Frontend directory not found');
  }

  // Install frontend dependencies if needed
  const nodeModulesPath = path.join(frontendPath, 'node_modules');
  if (!fs.existsSync(nodeModulesPath)) {
    info('Installing frontend dependencies...');
    execSync('npm install', { cwd: frontendPath, stdio: 'inherit' });
  }

  // Build frontend
  info('Building frontend for production...');
  try {
    execSync('npm run build', { cwd: frontendPath, stdio: 'inherit' });
    success('Frontend built successfully');
  } catch (buildError) {
    error('Vite build failed, using simple React approach...');
    
    // Use simple React build
    info('Creating simple React build...');
    execSync('node build-react-simple.js', { cwd: frontendPath, stdio: 'inherit' });
    success('Simple React build completed');
  }

  // Step 2: Prepare backend
  log('Step 2: Preparing backend...', 'blue');
  const backendPath = path.join(__dirname, '..', 'backend');
  
  if (!fs.existsSync(backendPath)) {
    throw new Error('Backend directory not found');
  }

  // Check if virtual environment exists
  const venvPath = path.join(backendPath, 'venv');
  if (!fs.existsSync(venvPath)) {
    info('Creating Python virtual environment...');
    execSync('python -m venv venv', { cwd: backendPath, stdio: 'inherit' });
  }

  // Install backend dependencies
  info('Installing backend dependencies...');
  const pipPath = process.platform === 'win32' 
    ? path.join(venvPath, 'Scripts', 'pip.exe')
    : path.join(venvPath, 'bin', 'pip');
  
  execSync(`${pipPath} install -r requirements.txt`, { 
    cwd: backendPath, 
    stdio: 'inherit' 
  });
  success('Backend prepared successfully');

  // Step 3: Copy backend to desktop directory for embedding
  log('Step 3: Preparing backend for embedding...', 'blue');
  const desktopBackendPath = path.join(__dirname, 'backend');
  
  // Remove existing backend directory if it exists
  if (fs.existsSync(desktopBackendPath)) {
    fs.rmSync(desktopBackendPath, { recursive: true, force: true });
  }

  // Copy backend to desktop directory
  function copyDir(src, dest) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    
    const entries = fs.readdirSync(src, { withFileTypes: true });
    
    for (const entry of entries) {
      const srcPath = path.join(src, entry.name);
      const destPath = path.join(dest, entry.name);
      
      if (entry.isDirectory()) {
        copyDir(srcPath, destPath);
      } else {
        fs.copyFileSync(srcPath, destPath);
      }
    }
  }

  copyDir(backendPath, desktopBackendPath);
  success('Backend copied to desktop directory');

  // Step 4: Copy frontend dist to desktop directory
  log('Step 4: Preparing frontend for embedding...', 'blue');
  const frontendDistPath = path.join(frontendPath, 'dist');
  const desktopFrontendPath = path.join(__dirname, 'frontend', 'dist');
  
  if (!fs.existsSync(frontendDistPath)) {
    throw new Error('Frontend dist directory not found. Build failed.');
  }

  // Remove existing frontend directory if it exists
  if (fs.existsSync(path.join(__dirname, 'frontend'))) {
    fs.rmSync(path.join(__dirname, 'frontend'), { recursive: true, force: true });
  }

  // Copy frontend dist to desktop directory
  copyDir(frontendDistPath, desktopFrontendPath);
  success('Frontend copied to desktop directory');

  // Step 5: Build desktop app (portable only)
  log('Step 5: Building portable desktop executable...', 'blue');
  info('This may take a few minutes...');
  
  // Use electron-builder directly for portable build
  execSync('npx electron-builder --win --publish=never', { 
    cwd: __dirname, 
    stdio: 'inherit' 
  });
  success('Desktop executable built successfully!');

  log('\n🎉 Build completed successfully!', 'green');
  log('📁 Check the dist/ directory for your executable files.', 'blue');
  log('📦 You can now distribute the .exe file to users.', 'blue');

} catch (err) {
  error(`Build failed: ${err.message}`);
  console.error(err);
  process.exit(1);
} 