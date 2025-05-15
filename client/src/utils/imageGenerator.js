const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// Function to generate a realistic workspace image
async function generateWorkspaceImage() {
  try {
    // Create a blank canvas
    const width = 800;
    const height = 600;
    
    // Base background (light wood desk)
    const baseImage = await sharp({
      create: {
        width,
        height,
        channels: 4,
        background: { r: 240, g: 230, b: 210, alpha: 1 }
      }
    }).png().toBuffer();
    
    // Create the composite image with various elements
    const outputBuffer = await sharp(baseImage)
      // Add wood grain texture
      .composite([
        {
          input: Buffer.from(
            `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
              <filter id="noise" x="0%" y="0%" width="100%" height="100%">
                <feTurbulence type="fractalNoise" baseFrequency="0.01" numOctaves="3" result="noise"/>
                <feDisplacementMap in="SourceGraphic" in2="noise" scale="5" xChannelSelector="R" yChannelSelector="G"/>
              </filter>
              <rect width="${width}" height="${height}" fill="none" filter="url(#noise)"/>
              ${Array.from({ length: 20 }).map((_, i) => 
                `<path d="M0 ${i * 30} H${width}" stroke="#d7c6a5" stroke-width="0.5" stroke-opacity="0.3" />`
              ).join('')}
            </svg>`
          ),
          gravity: 'center'
        },
        // Laptop
        {
          input: Buffer.from(
            `<svg width="400" height="300" viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg">
              <!-- Laptop base -->
              <rect x="150" y="220" width="240" height="15" rx="2" ry="2" fill="#333333"/>
              <!-- Laptop screen -->
              <rect x="160" y="60" width="220" height="160" rx="5" ry="5" fill="#333333"/>
              <rect x="170" y="70" width="200" height="140" rx="2" ry="2" fill="#1e90ff"/>
              <!-- Screen content -->
              <rect x="180" y="90" width="80" height="10" fill="white" rx="2" ry="2"/>
              <rect x="180" y="110" width="180" height="5" fill="white" rx="1" ry="1"/>
              <rect x="180" y="125" width="160" height="5" fill="white" rx="1" ry="1"/>
              <rect x="180" y="140" width="140" height="5" fill="white" rx="1" ry="1"/>
              <rect x="180" y="155" width="120" height="5" fill="white" rx="1" ry="1"/>
              <rect x="180" y="170" width="100" height="5" fill="white" rx="1" ry="1"/>
            </svg>`
          ),
          top: 100,
          left: 200
        },
        // Coffee cup
        {
          input: Buffer.from(
            `<svg width="120" height="150" viewBox="0 0 120 150" xmlns="http://www.w3.org/2000/svg">
              <!-- Cup -->
              <ellipse cx="60" cy="60" rx="40" ry="20" fill="#ffffff"/>
              <path d="M20 60 v60 c0 16.6 26.9 30 40 30 13.1 0 40-13.4 40-30 v-60" fill="#ffffff"/>
              <ellipse cx="60" cy="120" rx="40" ry="20" fill="#ffffff"/>
              <!-- Coffee -->
              <ellipse cx="60" cy="60" rx="35" ry="15" fill="#6f4e37"/>
              <!-- Handle -->
              <path d="M100 70 c15 0 20 10 15 20 -5 10 -15 10 -15 0" fill="none" stroke="#ffffff" stroke-width="5"/>
              <!-- Steam -->
              <path d="M50 40 c0 -10 10 -10 10 -20 c0 -10 10 -10 10 0 c0 10 10 10 10 0" stroke="#dddddd" fill="none" stroke-width="2"/>
            </svg>`
          ),
          top: 150,
          left: 550
        },
        // Notebook and pen
        {
          input: Buffer.from(
            `<svg width="200" height="250" viewBox="0 0 200 250" xmlns="http://www.w3.org/2000/svg">
              <!-- Notebook -->
              <rect x="20" y="50" width="150" height="200" fill="#f5f5f5" rx="3" ry="3"/>
              <rect x="20" y="50" width="10" height="200" fill="#4169e1"/>
              <line x1="20" y1="80" x2="170" y2="80" stroke="#dddddd" stroke-width="1"/>
              <line x1="20" y1="110" x2="170" y2="110" stroke="#dddddd" stroke-width="1"/>
              <line x1="20" y1="140" x2="170" y2="140" stroke="#dddddd" stroke-width="1"/>
              <line x1="20" y1="170" x2="170" y2="170" stroke="#dddddd" stroke-width="1"/>
              <line x1="20" y1="200" x2="170" y2="200" stroke="#dddddd" stroke-width="1"/>
              <line x1="40" y1="50" x2="40" y2="250" stroke="#dddddd" stroke-width="0.5"/>
              <!-- Pen -->
              <rect x="100" y="30" width="5" height="160" rx="2" ry="2" transform="rotate(15, 100, 30)" fill="#333333"/>
            </svg>`
          ),
          top: 200,
          left: 50
        },
        // Plant
        {
          input: Buffer.from(
            `<svg width="150" height="200" viewBox="0 0 150 200" xmlns="http://www.w3.org/2000/svg">
              <!-- Pot -->
              <path d="M50 120 L40 180 H110 L100 120 Z" fill="#d2691e"/>
              <!-- Plant stems and leaves -->
              <path d="M75 120 C75 90 50 80 40 90 C60 85 70 100 75 120" fill="#228b22"/>
              <path d="M75 120 C75 95 100 85 110 95 C90 90 80 100 75 120" fill="#228b22"/>
              <path d="M75 120 C75 80 95 60 110 70 C90 65 75 90 75 120" fill="#228b22"/>
              <path d="M75 120 C75 70 55 50 40 60 C65 55 75 90 75 120" fill="#228b22"/>
              <path d="M75 120 V150" stroke="#228b22" stroke-width="3"/>
            </svg>`
          ),
          top: 50,
          left: 650
        },
        // Ambient light/shadow
        {
          input: Buffer.from(
            `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <radialGradient id="shadow" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
                  <stop offset="0%" stop-color="black" stop-opacity="0.2"/>
                  <stop offset="100%" stop-color="black" stop-opacity="0"/>
                </radialGradient>
              </defs>
              <rect width="${width}" height="${height}" fill="url(#shadow)" opacity="0.7"/>
              <rect x="0" y="0" width="${width}" height="100" fill="white" opacity="0.1"/>
            </svg>`
          ),
          gravity: 'center'
        }
      ])
      .jpeg({ quality: 95 })
      .toBuffer();
    
    // Write the file
    const outputPath = path.join(process.cwd(), 'public', 'images', 'realistic-workspace.jpg');
    fs.writeFileSync(outputPath, outputBuffer);
    console.log(`Image generated at ${outputPath}`);
    
    return outputPath;
  } catch (error) {
    console.error('Error generating image:', error);
    throw error;
  }
}

// Execute the function
generateWorkspaceImage()
  .then(() => console.log('Workspace image generation complete'))
  .catch(error => console.error('Failed to generate workspace image:', error)); 