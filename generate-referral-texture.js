const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

// Create directory if it doesn't exist
const assetsDir = path.join(__dirname, 'public', 'assets');
if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir, { recursive: true });
}

// Create the referral tracker texture
function createReferralTexture() {
  // Create a canvas (800x800)
  const canvas = createCanvas(800, 800);
  const ctx = canvas.getContext('2d');

  // Fill background with a gradient
  const gradient = ctx.createLinearGradient(0, 0, 800, 800);
  gradient.addColorStop(0, '#013538');
  gradient.addColorStop(1, '#000000');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 800, 800);

  // Add grid pattern
  ctx.strokeStyle = 'rgba(15, 15, 15, 0.5)';
  ctx.lineWidth = 1;
  
  // Draw vertical lines
  for (let x = 0; x < 800; x += 50) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, 800);
    ctx.stroke();
  }
  
  // Draw horizontal lines
  for (let y = 0; y < 800; y += 50) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(800, y);
    ctx.stroke();
  }

  // Draw title
  ctx.font = 'bold 60px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  // Draw outline
  ctx.strokeStyle = 'black';
  ctx.lineWidth = 5;
  ctx.strokeText("REFERRAL", 400, 350);
  ctx.strokeText("TRACKER", 400, 450);
  
  // Fill with gradient text
  const textGradient = ctx.createLinearGradient(200, 0, 600, 0);
  textGradient.addColorStop(0, '#4ae5fb');  // Light blue
  textGradient.addColorStop(1, '#00ff00');  // Green
  ctx.fillStyle = textGradient;
  ctx.fillText("REFERRAL", 400, 350);
  ctx.fillText("TRACKER", 400, 450);

  // Save to file
  const outputPath = path.join(assetsDir, 'referralTracker.png');
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(outputPath, buffer);
  console.log(`Created texture: ${outputPath}`);
}

// Generate the texture
createReferralTexture(); 