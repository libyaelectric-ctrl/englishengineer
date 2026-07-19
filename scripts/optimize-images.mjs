import sharp from 'sharp';
import { readdirSync, statSync } from 'fs';
import { join, extname } from 'path';

const optimizeImage = async (inputPath, outputPath, quality = 80) => {
  try {
    const inputSize = statSync(inputPath).size;

    await sharp(inputPath)
      .resize({
        width: 1920,
        height: 1920,
        fit: 'inside',
        withoutEnlargement: true,
      })
      .jpeg({ quality, progressive: true })
      .toFile(outputPath);

    const outputSize = statSync(outputPath).size;
    const reduction = ((1 - outputSize / inputSize) * 100).toFixed(1);

    console.log(
      `${inputPath.split('/').pop()} -> ${outputPath.split('/').pop()}`
    );
    console.log(
      `  ${(inputSize / 1024).toFixed(1)} KB -> ${(outputSize / 1024).toFixed(1)} KB (${reduction}% reduction)`
    );

    return { inputSize, outputSize, reduction: parseFloat(reduction) };
  } catch (err) {
    console.error(`Error processing ${inputPath}:`, err.message);
    return null;
  }
};

const optimizeDirectory = async (dir, quality = 75) => {
  const files = readdirSync(dir);
  const results = [];

  for (const file of files) {
    const ext = extname(file).toLowerCase();
    if (ext === '.png') {
      const inputPath = join(dir, file);
      const outputPath = join(dir, file.replace('.png', '.jpg'));
      const result = await optimizeImage(inputPath, outputPath, quality);
      if (result) results.push({ file, ...result });
    }
  }

  return results;
};

// Optimize brand images
console.log('=== Brand Images ===');
const brandResults = await optimizeDirectory('public/brand', 75);

// Optimize agentic images
console.log('\n=== Agentic Images ===');
const agenticResults = await optimizeDirectory('public/agentic', 75);

// Summary
const allResults = [...brandResults, ...agenticResults];
const totalInput = allResults.reduce((sum, r) => sum + r.inputSize, 0);
const totalOutput = allResults.reduce((sum, r) => sum + r.outputSize, 0);
const avgReduction =
  allResults.reduce((sum, r) => sum + r.reduction, 0) / allResults.length;

console.log(`\n=== Ozet ===`);
console.log(`Toplam: ${allResults.length} gorsel optimize edildi`);
console.log(`Onceki: ${(totalInput / 1024 / 1024).toFixed(1)} MB`);
console.log(`Sonra: ${(totalOutput / 1024 / 1024).toFixed(1)} MB`);
console.log(`Ortalama dusus: ${avgReduction.toFixed(1)}%`);
