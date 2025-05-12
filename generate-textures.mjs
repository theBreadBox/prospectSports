import { createCanvas } from 'canvas';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create directory if it doesn't exist
const assetsDir = path.join(__dirname, 'public', 'assets');
if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir, { recursive: true });
}

// Function to create a texture with a number
function createNumberTexture(number, outputPath) {
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

  // Draw number
  ctx.font = 'bold 400px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  // Draw outline
  ctx.strokeStyle = 'black';
  ctx.lineWidth = 10;
  ctx.strokeText(number.toString(), 400, 400);
  
  // Fill with white
  ctx.fillStyle = 'white';
  ctx.fillText(number.toString(), 400, 400);

  // Save to file
  const buffer = canvas.toBuffer('image/jpeg');
  fs.writeFileSync(outputPath, buffer);
  console.log(`Created texture: ${outputPath}`);
}

// Generate 6 textures
for (let i = 1; i <= 6; i++) {
  const outputPath = path.join(assetsDir, `page${i}_texture.jpg`);
  createNumberTexture(i, outputPath);
}

console.log('All textures generated successfully!'); 