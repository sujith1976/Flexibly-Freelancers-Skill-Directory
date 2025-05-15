const https = require('https');
const fs = require('fs');
const path = require('path');

const url = 'https://images.unsplash.com/photo-1661415550010-6b85aef7d7cc';
const outputPath = path.join(process.cwd(), 'public', 'images', 'freelancer-woman.jpg');

// Ensure directory exists
const dir = path.dirname(outputPath);
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

console.log(`Downloading image from ${url}`);
console.log(`Saving to ${outputPath}`);

https.get(`${url}?ixlib=rb-4.0.3&q=85&fm=jpg&crop=entropy&cs=srgb&w=1200`, (res) => {
  if (res.statusCode === 302 || res.statusCode === 301) {
    // Handle redirects
    console.log(`Following redirect to ${res.headers.location}`);
    https.get(res.headers.location, (redirectRes) => {
      const fileStream = fs.createWriteStream(outputPath);
      redirectRes.pipe(fileStream);
      
      fileStream.on('finish', () => {
        fileStream.close();
        console.log('Image download completed');
      });
    }).on('error', (err) => {
      console.error(`Error following redirect: ${err.message}`);
    });
    return;
  }
  
  if (res.statusCode !== 200) {
    console.error(`Failed to download image: ${res.statusCode} ${res.statusMessage}`);
    return;
  }
  
  const fileStream = fs.createWriteStream(outputPath);
  res.pipe(fileStream);
  
  fileStream.on('finish', () => {
    fileStream.close();
    console.log('Image download completed');
  });
}).on('error', (err) => {
  console.error(`Error downloading image: ${err.message}`);
}); 