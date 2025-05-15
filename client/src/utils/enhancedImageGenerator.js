const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// Function to generate a highly realistic workspace image
async function generateEnhancedWorkspaceImage() {
  try {
    // Create a blank canvas
    const width = 1200;
    const height = 800;
    
    // Base background (rich wood desk)
    const baseImage = await sharp({
      create: {
        width,
        height,
        channels: 4,
        background: { r: 120, g: 90, b: 60, alpha: 1 }
      }
    }).png().toBuffer();
    
    // Create wood grain texture
    const woodGrainBuffer = await sharp({
      create: {
        width,
        height,
        channels: 4,
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      }
    })
    .composite([{
      input: Buffer.from(
        `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
          <filter id="wood-grain">
            <feTurbulence type="fractalNoise" baseFrequency="0.01" numOctaves="5" seed="3" />
            <feColorMatrix type="matrix" values="0 0 0 0 0, 0 0 0 0 0, 0 0 0 0 0, 0 0 0 0.15 0" />
          </filter>
          <rect width="${width}" height="${height}" filter="url(#wood-grain)" />
          ${Array.from({ length: 50 }).map((_, i) => 
            `<path d="M0 ${i * 16} H${width}" stroke="#412c1d" stroke-width="0.5" stroke-opacity="${Math.random() * 0.3}" />`
          ).join('')}
        </svg>`
      ),
      gravity: 'center'
    }])
    .png()
    .toBuffer();
    
    // Laptop with reflection
    const laptopBuffer = await sharp({
      create: {
        width: 600,
        height: 400,
        channels: 4,
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      }
    })
    .composite([{
      input: Buffer.from(
        `<svg width="600" height="400" viewBox="0 0 600 400" xmlns="http://www.w3.org/2000/svg">
          <!-- Laptop base with reflection -->
          <rect x="150" y="300" width="300" height="12" rx="2" ry="2" fill="#1a1a1a"/>
          <ellipse cx="300" cy="312" rx="150" ry="5" fill="#0d0d0d" opacity="0.6"/>
          <!-- Laptop screen -->
          <rect x="170" y="100" width="260" height="200" rx="5" ry="5" fill="#111111"/>
          <rect x="180" y="110" width="240" height="180" rx="2" ry="2" fill="#0e6efd"/>
          <!-- Screen content - code editor -->
          <rect x="190" y="120" width="220" height="20" fill="#1e1e1e" rx="2" ry="2"/>
          ${Array.from({ length: 12 }).map((_, i) => 
            `<rect x="190" y="${145 + i * 10}" width="${120 + Math.random() * 80}" height="5" fill="rgba(255,255,255,0.7)" rx="1" ry="1"/>`
          ).join('')}
          <!-- Screen reflection -->
          <rect x="180" y="110" width="240" height="180" rx="2" ry="2" fill="url(#screen-reflection)" opacity="0.1"/>
          <defs>
            <linearGradient id="screen-reflection" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="white" stop-opacity="0.5"/>
              <stop offset="100%" stop-color="white" stop-opacity="0"/>
            </linearGradient>
          </defs>
        </svg>`
      ),
      gravity: 'center'
    }])
    .png()
    .toBuffer();
    
    // Coffee cup with steam and reflection
    const coffeeBuffer = await sharp({
      create: {
        width: 300,
        height: 300,
        channels: 4,
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      }
    })
    .composite([{
      input: Buffer.from(
        `<svg width="300" height="300" viewBox="0 0 300 300" xmlns="http://www.w3.org/2000/svg">
          <!-- Saucer -->
          <ellipse cx="150" cy="230" rx="70" ry="20" fill="#ffffff"/>
          <ellipse cx="150" cy="230" rx="60" ry="15" fill="#f0f0f0"/>
          <!-- Cup -->
          <ellipse cx="150" cy="180" rx="40" ry="20" fill="#ffffff"/>
          <path d="M110 180 v40 c0 16.6 26.9 30 40 30 13.1 0 40-13.4 40-30 v-40" fill="#ffffff"/>
          <ellipse cx="150" cy="220" rx="40" ry="20" fill="#ffffff"/>
          <!-- Coffee -->
          <ellipse cx="150" cy="180" rx="35" ry="15" fill="#6f4e37"/>
          <!-- Cup rim detail -->
          <path d="M115 180 h70" stroke="#eeeeee" stroke-width="2" fill="none"/>
          <!-- Handle -->
          <path d="M190 190 c15 0 20 10 15 20 -5 10 -15 10 -15 0" fill="none" stroke="#ffffff" stroke-width="6"/>
          <!-- Steam -->
          <path d="M135 160 c0 -10 10 -10 10 -20 c0 -10 10 -10 10 0 c0 10 10 10 10 0" stroke="#ffffff" fill="none" stroke-width="2" opacity="0.6">
            <animate attributeName="opacity" values="0.3;0.7;0.3" dur="3s" repeatCount="indefinite" />
          </path>
          <path d="M150 160 c0 -15 10 -15 10 -30" stroke="#ffffff" fill="none" stroke-width="2" opacity="0.4">
            <animate attributeName="opacity" values="0.2;0.5;0.2" dur="4s" repeatCount="indefinite" />
          </path>
          <path d="M165 160 c0 -10 -5 -15 -5 -25" stroke="#ffffff" fill="none" stroke-width="2" opacity="0.5">
            <animate attributeName="opacity" values="0.4;0.6;0.4" dur="3.5s" repeatCount="indefinite" />
          </path>
          <!-- Reflection -->
          <ellipse cx="135" cy="175" rx="10" ry="5" fill="white" opacity="0.3" transform="rotate(-20, 135, 175)"/>
        </svg>`
      ),
      gravity: 'center'
    }])
    .png()
    .toBuffer();

    // Notebook with realistic pages and pen
    const notebookBuffer = await sharp({
      create: {
        width: 400,
        height: 400,
        channels: 4,
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      }
    })
    .composite([{
      input: Buffer.from(
        `<svg width="400" height="400" viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
          <!-- Notebook -->
          <rect x="50" y="100" width="300" height="230" fill="#f8f8f8" rx="5" ry="5" transform="rotate(-5, 50, 100)"/>
          <!-- Binding -->
          <rect x="50" y="100" width="20" height="230" fill="#3b5dc9" transform="rotate(-5, 50, 100)"/>
          <!-- Pages with shadow -->
          <rect x="50" y="100" width="300" height="230" fill="none" stroke="#e0e0e0" stroke-width="1" rx="5" ry="5" transform="rotate(-5, 50, 100)"/>
          <!-- Lines -->
          ${Array.from({ length: 15 }).map((_, i) => 
            `<line x1="70" y1="${120 + i * 15}" x2="340" y2="${112 + i * 15}" stroke="#d0d0d0" stroke-width="1" transform="rotate(-5, 50, 100)"/>`
          ).join('')}
          <!-- Some handwritten notes -->
          <path d="M100 135 q10 -5 20 5 q10 10 20 0 q10 -10 30 0" stroke="#333" fill="none" stroke-width="1" transform="rotate(-5, 50, 100)"/>
          <path d="M100 150 q30 0 60 0" stroke="#333" fill="none" stroke-width="1" transform="rotate(-5, 50, 100)"/>
          <path d="M100 165 q20 0 40 0" stroke="#333" fill="none" stroke-width="1" transform="rotate(-5, 50, 100)"/>
          <!-- Pen -->
          <rect x="240" y="160" width="160" height="8" rx="4" ry="4" transform="rotate(30, 240, 160)" fill="#2a2a2a"/>
          <rect x="240" y="160" width="20" height="8" rx="4" ry="4" transform="rotate(30, 240, 160)" fill="#c0c0c0"/>
          <path d="M240 164 l-20 -10" transform="rotate(30, 240, 160)" stroke="#2a2a2a" stroke-width="1" stroke-linecap="round"/>
        </svg>`
      ),
      gravity: 'center'
    }])
    .png()
    .toBuffer();
    
    // Plant with detailed leaves
    const plantBuffer = await sharp({
      create: {
        width: 300,
        height: 400,
        channels: 4,
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      }
    })
    .composite([{
      input: Buffer.from(
        `<svg width="300" height="400" viewBox="0 0 300 400" xmlns="http://www.w3.org/2000/svg">
          <!-- Pot -->
          <path d="M100 250 L80 350 H220 L200 250 Z" fill="#b25d42"/>
          <path d="M100 250 L80 350 H220 L200 250 Z" fill="none" stroke="#964b33" stroke-width="2"/>
          <ellipse cx="150" cy="250" rx="50" ry="15" fill="#b25d42"/>
          <rect x="80" y="345" width="140" height="10" rx="2" ry="2" fill="#964b33"/>
          <!-- Plant details -->
          <defs>
            <linearGradient id="leaf-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#5eb049"/>
              <stop offset="100%" stop-color="#3a7113"/>
            </linearGradient>
          </defs>
          <!-- Stems and leaves -->
          <path d="M150 250 V150" stroke="#3a7113" stroke-width="3"/>
          <path d="M150 230 L100 170" stroke="#3a7113" stroke-width="2"/>
          <path d="M150 210 L180 130" stroke="#3a7113" stroke-width="2"/>
          <path d="M150 190 L80 120" stroke="#3a7113" stroke-width="2"/>
          <path d="M150 170 L200 100" stroke="#3a7113" stroke-width="2"/>
          <!-- Leaves -->
          <path d="M100 170 Q80 150 85 130 Q105 140 100 170 Z" fill="url(#leaf-gradient)"/>
          <path d="M180 130 Q200 120 210 100 Q185 105 180 130 Z" fill="url(#leaf-gradient)"/>
          <path d="M80 120 Q50 110 40 90 Q70 100 80 120 Z" fill="url(#leaf-gradient)"/>
          <path d="M200 100 Q230 80 240 60 Q210 80 200 100 Z" fill="url(#leaf-gradient)"/>
          <path d="M150 150 Q170 130 180 90 Q155 120 150 150 Z" fill="url(#leaf-gradient)"/>
          <!-- Leaf details -->
          <path d="M95 150 Q90 140 88 135" stroke="#3a7113" fill="none" stroke-width="0.5"/>
          <path d="M195 110 Q200 100 205 95" stroke="#3a7113" fill="none" stroke-width="0.5"/>
          <path d="M60 105 Q55 100 50 92" stroke="#3a7113" fill="none" stroke-width="0.5"/>
          <path d="M220 80 Q225 70 230 65" stroke="#3a7113" fill="none" stroke-width="0.5"/>
          <path d="M165 120 Q167 110 170 100" stroke="#3a7113" fill="none" stroke-width="0.5"/>
        </svg>`
      ),
      gravity: 'center'
    }])
    .png()
    .toBuffer();
    
    // Ambient lighting and window reflection
    const lightingBuffer = await sharp({
      create: {
        width,
        height,
        channels: 4,
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      }
    })
    .composite([{
      input: Buffer.from(
        `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="window-light" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="white" stop-opacity="0.2"/>
              <stop offset="100%" stop-color="white" stop-opacity="0"/>
            </linearGradient>
            <filter id="blur-effect" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="50" />
            </filter>
          </defs>
          <!-- Ambient lighting from window -->
          <rect x="-100" y="-100" width="600" height="600" fill="url(#window-light)" filter="url(#blur-effect)"/>
          <!-- Window reflection on desk -->
          <rect x="50" y="100" width="400" height="250" fill="white" opacity="0.05" rx="10" ry="10"/>
          <rect x="80" y="130" width="340" height="190" fill="white" opacity="0.03" rx="5" ry="5"/>
          <!-- Shadow under elements -->
          <ellipse cx="500" cy="700" rx="300" ry="100" fill="black" opacity="0.1" filter="url(#blur-effect)"/>
          <ellipse cx="900" cy="600" rx="200" ry="80" fill="black" opacity="0.1" filter="url(#blur-effect)"/>
        </svg>`
      ),
      gravity: 'center'
    }])
    .png()
    .toBuffer();
    
    // Smartphone
    const phoneBuffer = await sharp({
      create: {
        width: 150,
        height: 250,
        channels: 4,
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      }
    })
    .composite([{
      input: Buffer.from(
        `<svg width="150" height="250" viewBox="0 0 150 250" xmlns="http://www.w3.org/2000/svg">
          <!-- Phone body -->
          <rect x="30" y="30" width="90" height="180" rx="10" ry="10" fill="#111111"/>
          <!-- Screen -->
          <rect x="35" y="35" width="80" height="170" rx="5" ry="5" fill="#333333"/>
          <!-- Screen content -->
          <rect x="40" y="45" width="70" height="12" fill="#ffffff" rx="2" ry="2"/>
          <rect x="40" y="65" width="70" height="70" fill="#4d7bf3" rx="2" ry="2"/>
          <rect x="40" y="145" width="30" height="8" fill="#ffffff" rx="2" ry="2"/>
          <rect x="40" y="160" width="70" height="5" fill="#ffffff" rx="1" ry="1" opacity="0.7"/>
          <rect x="40" y="170" width="50" height="5" fill="#ffffff" rx="1" ry="1" opacity="0.7"/>
          <rect x="40" y="180" width="60" height="5" fill="#ffffff" rx="1" ry="1" opacity="0.7"/>
          <!-- Phone notch -->
          <path d="M60 35 h30 v5 h-30 z" fill="#111111"/>
          <!-- Phone reflection -->
          <rect x="35" y="35" width="80" height="170" rx="5" ry="5" fill="white" opacity="0.1"/>
          <path d="M35 35 L115 205" stroke="white" stroke-width="1" opacity="0.1"/>
        </svg>`
      ),
      gravity: 'center'
    }])
    .png()
    .toBuffer();
    
    // Put all elements together with proper positioning
    const outputBuffer = await sharp(baseImage)
      .composite([
        // Base wood grain and lighting
        { input: woodGrainBuffer, gravity: 'center' },
        { input: lightingBuffer, gravity: 'center' },
        // Main elements
        { input: laptopBuffer, left: 300, top: 200 },
        { input: coffeeBuffer, left: 800, top: 250 },
        { input: notebookBuffer, left: 50, top: 250 },
        { input: plantBuffer, left: 900, top: 100 },
        { input: phoneBuffer, left: 650, top: 300 }
      ])
      // Apply photo-realistic effects
      .modulate({ brightness: 1.05, saturation: 1.2 })
      .sharpen({ sigma: 1, m1: 0.1, m2: 0.1 })
      .jpeg({ quality: 95 })
      .toBuffer();
    
    // Write the file
    const outputPath = path.join(process.cwd(), 'public', 'images', 'enhanced-workspace.jpg');
    fs.writeFileSync(outputPath, outputBuffer);
    console.log(`Enhanced image generated at ${outputPath}`);
    
    return outputPath;
  } catch (error) {
    console.error('Error generating enhanced image:', error);
    throw error;
  }
}

// Execute the function
generateEnhancedWorkspaceImage()
  .then(() => console.log('Enhanced workspace image generation complete'))
  .catch(error => console.error('Failed to generate enhanced workspace image:', error)); 