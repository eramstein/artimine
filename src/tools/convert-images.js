// convert-png-to-jpg.js
// Recursively converts PNG files to JPEG format, resizes to 512x512
// Only processes images that are either not JPG or are too large (> 150KB)
// Optionally overwrites the original PNGs

import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

// Settings
const rootDirs = [
  './public/assets/images/cards', // cards folder
  './public/assets/images/lands', // lands folder
]; // starting folders
const overwriteOriginals = true; // true = replace PNGs with JPGs
const targetWidth = 512; // desired width
const targetHeight = 512; // desired height
const maxFileSizeKB = 150; // maximum file size in KB before processing

async function processImage(inputPath) {
  const ext = path.extname(inputPath).toLowerCase();
  if (!['.png', '.jpg', '.jpeg'].includes(ext)) return;

  // Get file stats to check size
  const stats = fs.statSync(inputPath);
  const fileSizeKB = stats.size / 1024;

  // Skip if it's already a JPG and under the size limit
  if (['.jpg', '.jpeg'].includes(ext) && fileSizeKB <= maxFileSizeKB) {
    console.log(`⏭️ Skipping (already optimized): ${inputPath} (${fileSizeKB.toFixed(1)}KB)`);
    return;
  }

  // Process ALL PNG files regardless of size

  console.log(`🔄 Processing: ${inputPath} (${fileSizeKB.toFixed(1)}KB)`);

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

    // Get the size of the new file
    const newStats = fs.statSync(
      overwriteOriginals ? inputPath.replace(/\.(png|jpg|jpeg)$/i, '.jpg') : outputPath
    );
    const newFileSizeKB = newStats.size / 1024;

    console.log(`✅ Processed: ${inputPath} -> ${newFileSizeKB.toFixed(1)}KB`);
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

// Process each directory
rootDirs.forEach((dir) => {
  console.log(`\n🔄 Processing directory: ${dir}`);
  if (fs.existsSync(dir)) {
    walkDir(dir);
  } else {
    console.log(`⚠️ Directory not found: ${dir}`);
  }
});
