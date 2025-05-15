// This file is for local development testing only
// It will start the server on port 5000 or the port specified in the environment

const { exec } = require('child_process');
const path = require('path');

console.log('Starting development server...');

// Run the TypeScript server using ts-node
const serverProcess = exec('npx ts-node src/index.ts', {
  cwd: __dirname,
});

serverProcess.stdout.on('data', (data) => {
  console.log(`stdout: ${data}`);
});

serverProcess.stderr.on('data', (data) => {
  console.error(`stderr: ${data}`);
});

serverProcess.on('close', (code) => {
  console.log(`Server process exited with code ${code}`);
}); 