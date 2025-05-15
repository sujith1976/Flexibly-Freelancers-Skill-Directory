const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// Function to generate a clean, simple workspace image
async function generateSimpleWorkspaceImage() {
  try {
    // Create a high-resolution image
    const width = 1600;
    const height = 1000;
    
    // Light, clean background
    const baseImage = await sharp({
      create: {
        width,
        height,
        channels: 4,
        background: { r: 248, g: 250, b: 252, alpha: 1 } // Light gray/off-white background
      }
    }).png().toBuffer();
    
    // Add a subtle texture to the background
    const textureOverlay = await sharp({
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
          <filter id="subtle-noise">
            <feTurbulence type="fractalNoise" baseFrequency="0.5" numOctaves="2" stitchTiles="stitch"/>
            <feColorMatrix type="matrix" values="0 0 0 0 0, 0 0 0 0 0, 0 0 0 0 0, 0 0 0 0.03 0"/>
          </filter>
          <rect width="${width}" height="${height}" filter="url(#subtle-noise)" opacity="0.08"/>
        </svg>`
      ),
      gravity: 'center'
    }])
    .png()
    .toBuffer();
    
    // Laptop with hands typing
    const laptopBuffer = await sharp({
      create: {
        width: 800,
        height: 600,
        channels: 4,
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      }
    })
    .composite([{
      input: Buffer.from(
        `<svg width="800" height="600" viewBox="0 0 800 600" xmlns="http://www.w3.org/2000/svg">
          <!-- Laptop base -->
          <rect x="200" y="400" width="400" height="20" rx="2" ry="2" fill="#d1d5db"/>
          <!-- Shadow under laptop -->
          <ellipse cx="400" cy="430" rx="350" ry="10" fill="#e5e7eb" opacity="0.6"/>
          <!-- Laptop screen -->
          <rect x="230" y="200" width="340" height="200" rx="5" ry="5" fill="#f3f4f6"/>
          <rect x="240" y="210" width="320" height="180" rx="2" ry="2" fill="#ffffff"/>
          <!-- Screen content - simplified UI -->
          <rect x="250" y="220" width="140" height="20" fill="#e5e7eb" rx="2" ry="2"/>
          <rect x="250" y="250" width="300" height="5" fill="#e5e7eb" rx="1" ry="1"/>
          <rect x="250" y="265" width="280" height="5" fill="#e5e7eb" rx="1" ry="1"/>
          <rect x="250" y="280" width="260" height="5" fill="#e5e7eb" rx="1" ry="1"/>
          <rect x="250" y="295" width="300" height="5" fill="#e5e7eb" rx="1" ry="1"/>
          <rect x="250" y="310" width="200" height="5" fill="#e5e7eb" rx="1" ry="1"/>
          <rect x="250" y="325" width="280" height="5" fill="#e5e7eb" rx="1" ry="1"/>
          <rect x="250" y="340" width="260" height="5" fill="#e5e7eb" rx="1" ry="1"/>
          <rect x="250" y="355" width="180" height="5" fill="#e5e7eb" rx="1" ry="1"/>
          
          <!-- Laptop keyboard -->
          <rect x="230" y="400" width="340" height="10" fill="#f3f4f6"/>
          <!-- Keys on keyboard (simplified) -->
          ${Array.from({ length: 10 }).map((_, i) => 
            `<rect x="${250 + i * 33}" y="407" width="28" height="3" rx="1" ry="1" fill="#d1d5db"/>`
          ).join('')}
          
          <!-- Human hands typing -->
          <path d="M300 480 Q350 440 400 430 Q450 440 500 480" fill="#e8beac" opacity="0.7"/>
          <path d="M320 460 L350 430" stroke="#e8beac" stroke-width="15" stroke-linecap="round"/>
          <path d="M370 445 L380 425" stroke="#e8beac" stroke-width="15" stroke-linecap="round"/>
          <path d="M420 445 L410 425" stroke="#e8beac" stroke-width="15" stroke-linecap="round"/>
          <path d="M470 460 L440 430" stroke="#e8beac" stroke-width="15" stroke-linecap="round"/>
          <!-- Watch on wrist -->
          <rect x="300" y="470" width="20" height="25" rx="3" ry="3" fill="#f3f4f6"/>
          <rect x="302" y="472" width="16" height="21" rx="2" ry="2" fill="#6b7280"/>
        </svg>`
      ),
      gravity: 'center'
    }])
    .png()
    .toBuffer();
    
    // Coffee and croissant on a simple white plate/tray
    const foodBuffer = await sharp({
      create: {
        width: 700,
        height: 400,
        channels: 4,
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      }
    })
    .composite([{
      input: Buffer.from(
        `<svg width="700" height="400" viewBox="0 0 700 400" xmlns="http://www.w3.org/2000/svg">
          <!-- Simple white tray -->
          <rect x="210" y="160" width="280" height="180" rx="8" ry="8" fill="#ffffff" stroke="#f3f4f6" stroke-width="2"/>
          
          <!-- Coffee cup - white ceramic -->
          <ellipse cx="270" cy="220" rx="40" ry="15" fill="#ffffff" stroke="#f3f4f6" stroke-width="1"/>
          <path d="M230 220 v30 c0 10 20 20 40 20 s40-10 40-20 v-30" fill="#ffffff" stroke="#f3f4f6" stroke-width="1"/>
          <ellipse cx="270" cy="250" rx="40" ry="15" fill="#ffffff" stroke="#f3f4f6" stroke-width="1"/>
          <!-- Coffee inside cup -->
          <ellipse cx="270" cy="220" rx="35" ry="10" fill="#6b4f3b"/>
          <!-- Cup handle -->
          <path d="M310 230 c10 0 15 10 10 20 c-5 5-10 0-10-5" fill="none" stroke="#f3f4f6" stroke-width="4"/>
          <!-- Steam from coffee -->
          <path d="M255 200 c0-10 10-10 10-20 c0-10 10-10 10 0 c0 10 10 10 10 0" stroke="#e5e7eb" fill="none" stroke-opacity="0.7"/>
          
          <!-- White plate -->
          <ellipse cx="400" cy="220" rx="50" ry="20" fill="#ffffff" stroke="#f3f4f6" stroke-width="1"/>
          <!-- Croissant -->
          <path d="M370 220 q20-25 60 0 c-15 5-20 10-30 5 c-10-5-20 0-30-5" fill="#f0c886"/>
          <path d="M370 220 q20-25 60 0" stroke="#e7b973" fill="none" stroke-width="1"/>
          <path d="M380 218 h40" stroke="#e7b973" fill="none" stroke-width="0.5"/>
          <path d="M385 214 h30" stroke="#e7b973" fill="none" stroke-width="0.5"/>
          <path d="M390 210 h20" stroke="#e7b973" fill="none" stroke-width="0.5"/>
        </svg>`
      ),
      gravity: 'center'
    }])
    .png()
    .toBuffer();
    
    // Elegant plant with simple styling
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
          <!-- Minimalist plant pot -->
          <rect x="110" y="250" width="80" height="100" rx="5" ry="5" fill="#f3f4f6" stroke="#e5e7eb" stroke-width="1"/>
          
          <!-- Simple plant stems and leaves -->
          <path d="M150 250 V180" stroke="#68a963" stroke-width="2"/>
          <path d="M150 210 L120 170" stroke="#68a963" stroke-width="1"/>
          <path d="M150 230 L180 190" stroke="#68a963" stroke-width="1"/>
          <path d="M150 190 L130 140" stroke="#68a963" stroke-width="1"/>
          <path d="M150 170 L170 120" stroke="#68a963" stroke-width="1"/>
          
          <!-- Simple leaves -->
          <path d="M120 170 Q100 160 105 140 Q120 150 120 170 Z" fill="#7eb77a"/>
          <path d="M180 190 Q200 180 205 160 Q185 170 180 190 Z" fill="#7eb77a"/>
          <path d="M130 140 Q110 120 115 100 Q135 120 130 140 Z" fill="#7eb77a"/>
          <path d="M170 120 Q190 100 195 80 Q175 100 170 120 Z" fill="#7eb77a"/>
        </svg>`
      ),
      gravity: 'center'
    }])
    .png()
    .toBuffer();
    
    // Simple, minimalist accessories
    const accessoriesBuffer = await sharp({
      create: {
        width: 400,
        height: 300,
        channels: 4,
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      }
    })
    .composite([{
      input: Buffer.from(
        `<svg width="400" height="300" viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg">
          <!-- Simple notebook -->
          <rect x="50" y="100" width="120" height="150" rx="3" ry="3" fill="#f9fafb" stroke="#e5e7eb" stroke-width="1" transform="rotate(-5, 50, 100)"/>
          <line x1="55" y1="120" x2="165" y2="112" stroke="#e5e7eb" stroke-width="1" transform="rotate(-5, 50, 100)"/>
          <line x1="55" y1="140" x2="165" y2="132" stroke="#e5e7eb" stroke-width="1" transform="rotate(-5, 50, 100)"/>
          <line x1="55" y1="160" x2="165" y2="152" stroke="#e5e7eb" stroke-width="1" transform="rotate(-5, 50, 100)"/>
          <line x1="55" y1="180" x2="165" y2="172" stroke="#e5e7eb" stroke-width="1" transform="rotate(-5, 50, 100)"/>
          <line x1="55" y1="200" x2="165" y2="192" stroke="#e5e7eb" stroke-width="1" transform="rotate(-5, 50, 100)"/>
          <line x1="55" y1="220" x2="165" y2="212" stroke="#e5e7eb" stroke-width="1" transform="rotate(-5, 50, 100)"/>
          
          <!-- Pen -->
          <rect x="130" y="90" width="4" height="100" rx="2" ry="2" transform="rotate(20, 130, 90)" fill="#6b7280"/>
          
          <!-- Minimalist tulips -->
          <path d="M350 200 V100" stroke="#68a963" stroke-width="2"/>
          <path d="M350 120 C330 90 370 90 350 120" fill="#f9a8d4"/>
          <path d="M350 120 C330 90 370 90 350 120" fill="none" stroke="#f472b6" stroke-width="1"/>
          <path d="M343 140 L350 120" stroke="#68a963" stroke-width="1"/>
          <path d="M357 140 L350 120" stroke="#68a963" stroke-width="1"/>
        </svg>`
      ),
      gravity: 'center'
    }])
    .png()
    .toBuffer();
    
    // Soft lighting effect
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
            <linearGradient id="soft-light" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#f9fafb" stop-opacity="0.1"/>
              <stop offset="100%" stop-color="#f3f4f6" stop-opacity="0"/>
            </linearGradient>
            <filter id="light-blur">
              <feGaussianBlur stdDeviation="30" />
            </filter>
          </defs>
          <rect width="${width}" height="${height}" fill="url(#soft-light)" filter="url(#light-blur)"/>
          
          <!-- Very subtle vignette -->
          <rect width="${width}" height="${height}" fill="transparent" stroke="#e5e7eb" stroke-width="300" stroke-opacity="0.2"/>
        </svg>`
      ),
      gravity: 'center'
    }])
    .png()
    .toBuffer();
    
    // Combine all layers into the final image
    const outputBuffer = await sharp(baseImage)
      .composite([
        // Background texture and lighting effects
        { input: textureOverlay, gravity: 'center' },
        { input: lightingBuffer, gravity: 'center' },
        
        // Main elements
        { input: laptopBuffer, left: 400, top: 300 },
        { input: foodBuffer, left: 800, top: 300 },
        { input: plantBuffer, left: 200, top: 150 },
        { input: accessoriesBuffer, left: 250, top: 480 },
      ])
      // Apply subtle photo effects
      .modulate({ brightness: 1.02, saturation: 1.05 })
      .sharpen({ sigma: 0.5, m1: 0.1, m2: 0.1 })
      .jpeg({ quality: 95 })
      .toBuffer();
    
    // Write the file
    const outputPath = path.join(process.cwd(), 'public', 'images', 'simple-workspace.jpg');
    fs.writeFileSync(outputPath, outputBuffer);
    console.log(`Simple workspace image generated at ${outputPath}`);
    
    return outputPath;
  } catch (error) {
    console.error('Error generating simple workspace image:', error);
    throw error;
  }
}

// Execute the function
generateSimpleWorkspaceImage()
  .then(() => console.log('Simple workspace image generation complete'))
  .catch(error => console.error('Failed to generate simple workspace image:', error)); 