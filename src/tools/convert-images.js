// convert-png-to-jpg.js
// Recursively converts PNG files to JPEG format, resizes to 512x512
// Optionally overwrites the original PNGs

import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

// Settings
const rootDir = './src/assets/images/cards'; // starting folder
const overwriteOriginals = true; // true = replace PNGs with JPGs
const targetWidth = 512; // desired width
const targetHeight = 512; // desired height

async function processImage(inputPath) {
  const ext = path.extname(inputPath).toLowerCase();
  if (!['.png', '.jpg', '.jpeg'].includes(ext)) return;

  let outputPath;
  if (overwriteOriginals) {
    // Use a temporary file to avoid "same file" error
    outputPath = inputPath + '.tmp.jpg';
  } else {
    outputPath = inputPath.replace(/\.(png|jpg|jpeg)$/i, '.jpg');
  }

  try {
    await sharp(inputPath)
      .resize(targetWidth, targetHeight, {
        fit: 'cover',
        position: 'centre',
      })
      .jpeg({ quality: 90 })
      .toFile(outputPath);

    if (overwriteOriginals) {
      const finalOutputPath = inputPath.replace(/\.(png|jpg|jpeg)$/i, '.jpg');
      fs.renameSync(outputPath, finalOutputPath);

      // Delete the original PNG file after successful conversion
      if (ext === '.png') {
        fs.unlinkSync(inputPath);
        console.log(`🗑️ Deleted original PNG: ${inputPath}`);
      }
    }

    console.log(`✅ Processed: ${inputPath}`);
  } catch (err) {
    console.error(`❌ Error processing ${inputPath}:`, err);
    if (fs.existsSync(outputPath) && overwriteOriginals) {
      fs.unlinkSync(outputPath); // cleanup failed temp file
    }
  }
}

function walkDir(dir) {
  fs.readdirSync(dir, { withFileTypes: true }).forEach((entry) => {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walkDir(fullPath);
    } else {
      processImage(fullPath);
    }
  });
}

walkDir(rootDir);
