const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// Function to generate a professional workspace image
async function generateProfessionalImage() {
  try {
    // Create a high-resolution image
    const width = 1600;
    const height = 1000;
    
    // Dark desk background (similar to the reference image)
    const baseImage = await sharp({
      create: {
        width,
        height,
        channels: 4,
        background: { r: 40, g: 40, b: 40, alpha: 1 }
      }
    }).png().toBuffer();
    
    // Add a texture overlay to the dark desk
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
          <filter id="noise">
            <feTurbulence type="fractalNoise" baseFrequency="0.7" numOctaves="3" stitchTiles="stitch"/>
            <feColorMatrix type="matrix" values="0 0 0 0 0, 0 0 0 0 0, 0 0 0 0 0, 0 0 0 0.1 0"/>
          </filter>
          <rect width="${width}" height="${height}" filter="url(#noise)" opacity="0.15"/>
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
          <rect x="200" y="400" width="400" height="20" rx="2" ry="2" fill="#1a1a1a"/>
          <!-- Shadow under laptop -->
          <ellipse cx="400" cy="430" rx="350" ry="10" fill="#000" opacity="0.2"/>
          <!-- Laptop screen -->
          <rect x="230" y="200" width="340" height="200" rx="5" ry="5" fill="#111"/>
          <rect x="240" y="210" width="320" height="180" rx="2" ry="2" fill="#fff"/>
          <!-- Laptop keyboard -->
          <rect x="230" y="400" width="340" height="10" fill="#222"/>
          <!-- Keys on keyboard (simplified) -->
          ${Array.from({ length: 10 }).map((_, i) => 
            `<rect x="${250 + i * 33}" y="410" width="28" height="5" rx="1" ry="1" fill="#333"/>`
          ).join('')}
          <!-- Human hands typing -->
          <path d="M300 480 Q350 440 400 430 Q450 440 500 480" fill="#e8beac" opacity="0.7"/>
          <path d="M320 460 L350 430" stroke="#e8beac" stroke-width="15" stroke-linecap="round"/>
          <path d="M370 445 L380 425" stroke="#e8beac" stroke-width="15" stroke-linecap="round"/>
          <path d="M420 445 L410 425" stroke="#e8beac" stroke-width="15" stroke-linecap="round"/>
          <path d="M470 460 L440 430" stroke="#e8beac" stroke-width="15" stroke-linecap="round"/>
          <!-- Watch on wrist -->
          <rect x="300" y="470" width="20" height="25" rx="3" ry="3" fill="#ddd"/>
          <rect x="302" y="472" width="16" height="21" rx="2" ry="2" fill="#333"/>
        </svg>`
      ),
      gravity: 'center'
    }])
    .png()
    .toBuffer();
    
    // Coffee and croissant in wicker tray
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
          <!-- Wicker tray -->
          <rect x="200" y="150" width="300" height="200" rx="10" ry="10" fill="#8B4513"/>
          <rect x="210" y="160" width="280" height="180" rx="8" ry="8" fill="#A0522D"/>
          <!-- Wicker pattern -->
          ${Array.from({ length: 18 }).map((_, i) => 
            `<path d="M210 ${160 + i * 10} h280" stroke="#8B4513" stroke-width="1" stroke-opacity="0.5"/>`
          ).join('')}
          ${Array.from({ length: 28 }).map((_, i) => 
            `<path d="M${210 + i * 10} 160 v180" stroke="#8B4513" stroke-width="1" stroke-opacity="0.5"/>`
          ).join('')}
          
          <!-- Coffee cup - white ceramic -->
          <ellipse cx="270" cy="220" rx="40" ry="15" fill="#FFF"/>
          <path d="M230 220 v30 c0 10 20 20 40 20 s40-10 40-20 v-30" fill="#FFF"/>
          <ellipse cx="270" cy="250" rx="40" ry="15" fill="#FFF"/>
          <!-- Coffee inside cup -->
          <ellipse cx="270" cy="220" rx="35" ry="10" fill="#3A1F00"/>
          <!-- Cup handle -->
          <path d="M310 230 c10 0 15 10 10 20 c-5 5-10 0-10-5" fill="#FFF"/>
          <!-- Steam from coffee -->
          <path d="M255 200 c0-10 10-10 10-20 c0-10 10-10 10 0 c0 10 10 10 10 0" stroke="#FFF" fill="none" stroke-opacity="0.6"/>
          
          <!-- White plate -->
          <ellipse cx="400" cy="220" rx="50" ry="20" fill="#FFF"/>
          <!-- Croissant -->
          <path d="M370 220 q20-25 60 0 c-15 5-20 10-30 5 c-10-5-20 0-30-5" fill="#E8C07D"/>
          <path d="M370 220 q20-25 60 0" stroke="#C9A66B" fill="none" stroke-width="1"/>
          <path d="M380 218 h40" stroke="#C9A66B" fill="none" stroke-width="0.5"/>
          <path d="M385 214 h30" stroke="#C9A66B" fill="none" stroke-width="0.5"/>
          <path d="M390 210 h20" stroke="#C9A66B" fill="none" stroke-width="0.5"/>
        </svg>`
      ),
      gravity: 'center'
    }])
    .png()
    .toBuffer();
    
    // Plant in the background
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
          <!-- Plant pot -->
          <path d="M120 250 L100 350 H200 L180 250 Z" fill="#A75D39"/>
          <ellipse cx="150" cy="250" rx="30" ry="10" fill="#A75D39"/>
          <!-- Plant stems and leaves -->
          <path d="M150 250 V180" stroke="#228B22" stroke-width="3"/>
          <path d="M150 210 L120 170" stroke="#228B22" stroke-width="2"/>
          <path d="M150 230 L180 190" stroke="#228B22" stroke-width="2"/>
          <path d="M150 190 L130 140" stroke="#228B22" stroke-width="2"/>
          <path d="M150 170 L170 120" stroke="#228B22" stroke-width="2"/>
          
          <!-- Leaves -->
          <path d="M120 170 Q100 160 105 140 Q120 150 120 170 Z" fill="#228B22"/>
          <path d="M180 190 Q200 180 205 160 Q185 170 180 190 Z" fill="#228B22"/>
          <path d="M130 140 Q110 120 115 100 Q135 120 130 140 Z" fill="#228B22"/>
          <path d="M170 120 Q190 100 195 80 Q175 100 170 120 Z" fill="#228B22"/>
        </svg>`
      ),
      gravity: 'center'
    }])
    .png()
    .toBuffer();
    
    // Camera/accessories
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
          <!-- Leather notebook/journal -->
          <rect x="50" y="100" width="120" height="150" rx="3" ry="3" fill="#8B4513" transform="rotate(-5, 50, 100)"/>
          <rect x="55" y="105" width="110" height="140" rx="2" ry="2" fill="#A0522D" transform="rotate(-5, 50, 100)"/>
          
          <!-- Camera -->
          <rect x="200" y="120" width="130" height="80" rx="10" ry="10" fill="#222"/>
          <circle cx="265" cy="160" r="30" fill="#333"/>
          <circle cx="265" cy="160" r="25" fill="#111"/>
          <circle cx="265" cy="160" r="15" fill="#222"/>
          <rect x="220" y="120" width="30" height="10" rx="2" ry="2" fill="#444"/>
          <circle cx="300" cy="135" r="5" fill="#444"/>
          
          <!-- Glasses -->
          <path d="M50 80 h50" stroke="#333" stroke-width="2"/>
          <circle cx="40" cy="80" r="20" fill="none" stroke="#333" stroke-width="2"/>
          <circle cx="110" cy="80" r="20" fill="none" stroke="#333" stroke-width="2"/>
          <path d="M60 80 h30" stroke="#333" stroke-width="2"/>
          
          <!-- Tulips -->
          <path d="M350 200 V100" stroke="#3A913F" stroke-width="2"/>
          <path d="M350 120 C330 90 370 90 350 120" fill="#FF9999"/>
          <path d="M350 120 C330 90 370 90 350 120" fill="none" stroke="#FF7777" stroke-width="1"/>
          <path d="M343 140 L350 120" stroke="#3A913F" stroke-width="1"/>
          <path d="M357 140 L350 120" stroke="#3A913F" stroke-width="1"/>
        </svg>`
      ),
      gravity: 'center'
    }])
    .png()
    .toBuffer();
    
    // Lighting and shadow effects
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
            <radialGradient id="spotlight" cx="30%" cy="30%" r="80%" fx="30%" fy="30%">
              <stop offset="0%" stop-color="white" stop-opacity="0.2"/>
              <stop offset="100%" stop-color="white" stop-opacity="0"/>
            </radialGradient>
            <filter id="blur">
              <feGaussianBlur stdDeviation="40" />
            </filter>
          </defs>
          <rect width="${width}" height="${height}" fill="url(#spotlight)" filter="url(#blur)"/>
          
          <!-- Custom vignette effect -->
          <rect width="${width}" height="${height}" fill="transparent" stroke="black" stroke-width="400" stroke-opacity="0.4"/>
          
          <!-- Warm highlight for more emphasis on the center items -->
          <circle cx="800" cy="400" r="300" fill="#FFDAB9" opacity="0.05" filter="url(#blur)"/>
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
        
        // Final touches - overlay with slight color adjustments and vignette
        { 
          input: Buffer.from(
            `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
              <rect width="${width}" height="${height}" fill="#B08D57" opacity="0.05"/>
            </svg>`
          ), 
          gravity: 'center' 
        }
      ])
      // Apply photo-realistic effects and color tone
      .modulate({ brightness: 1.02, saturation: 1.1 })
      .sharpen({ sigma: 0.8, m1: 0.1, m2: 0.1 })
      .jpeg({ quality: 95 })
      .toBuffer();
    
    // Write the file
    const outputPath = path.join(process.cwd(), 'public', 'images', 'professional-workspace.jpg');
    fs.writeFileSync(outputPath, outputBuffer);
    console.log(`Professional image generated at ${outputPath}`);
    
    return outputPath;
  } catch (error) {
    console.error('Error generating professional image:', error);
    throw error;
  }
}

// Execute the function
generateProfessionalImage()
  .then(() => console.log('Professional workspace image generation complete'))
  .catch(error => console.error('Failed to generate professional workspace image:', error)); 