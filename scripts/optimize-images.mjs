import sharp from 'sharp';
import { readdirSync, statSync } from 'fs';
import { join, extname } from 'path';

const CHECK_MODE = process.argv.includes('--check');
const MAX_DIMENSION = 1920;
const QUALITY = 75;

const optimizeImage = async (inputPath, quality = QUALITY) => {
  try {
    const inputSize = statSync(inputPath).size;

    const buffer = await sharp(inputPath)
      .resize({
        width: MAX_DIMENSION,
        height: MAX_DIMENSION,
        fit: 'inside',
        withoutEnlargement: true,
      })
      .webp({ quality })
      .toBuffer();

    const outputSize = buffer.length;
    const reduction = ((1 - outputSize / inputSize) * 100).toFixed(1);

    if (CHECK_MODE) {
      // Only report images that could be meaningfully re-optimized.
      if (outputSize < inputSize) {
        console.log(
          `${inputPath}: ${(inputSize / 1024).toFixed(1)} KB -> ${(outputSize / 1024).toFixed(1)} KB (${reduction}% potential reduction)`
        );
      }
    } else {
      await sharp(inputPath)
        .resize({
          width: MAX_DIMENSION,
          height: MAX_DIMENSION,
          fit: 'inside',
          withoutEnlargement: true,
        })
        .webp({ quality })
        .toFile(inputPath + '.tmp');
      const { renameSync } = await import('fs');
      renameSync(inputPath + '.tmp', inputPath);

      console.log(
        `${inputPath.split('/').pop()}: ${(inputSize / 1024).toFixed(1)} KB -> ${(outputSize / 1024).toFixed(1)} KB (${reduction}% reduction)`
      );
    }

    return { inputSize, outputSize, reduction: parseFloat(reduction) };
  } catch (err) {
    console.error(`Error processing ${inputPath}:`, err.message);
    return null;
  }
};

const optimizeDirectory = async (dir, quality = QUALITY) => {
  const files = readdirSync(dir);
  const results = [];

  for (const file of files) {
    const ext = extname(file).toLowerCase();
    if (ext === '.webp' || ext === '.png' || ext === '.jpg' || ext === '.jpeg') {
      const inputPath = join(dir, file);
      const result = await optimizeImage(inputPath, quality);
      if (result) results.push({ file, ...result });
    }
  }

  return results;
};

const TARGET_DIRS = ['public/brand', 'public/agentic'];

console.log(
  CHECK_MODE
    ? '=== Checking image optimization (no files will be modified) ==='
    : '=== Optimizing Images ==='
);

const allResults = [];
for (const dir of TARGET_DIRS) {
  console.log(`\n--- ${dir} ---`);
  const results = await optimizeDirectory(dir);
  allResults.push(...results);
}

const totalInput = allResults.reduce((sum, r) => sum + r.inputSize, 0);
const totalOutput = allResults.reduce((sum, r) => sum + r.outputSize, 0);
const avgReduction = allResults.length
  ? allResults.reduce((sum, r) => sum + r.reduction, 0) / allResults.length
  : 0;

console.log(`\n=== Ozet ===`);
console.log(`Toplam: ${allResults.length} gorsel islendi`);
console.log(`Onceki: ${(totalInput / 1024 / 1024).toFixed(2)} MB`);
console.log(`Sonra: ${(totalOutput / 1024 / 1024).toFixed(2)} MB`);
console.log(`Ortalama degisim: ${avgReduction.toFixed(1)}%`);

if (CHECK_MODE) {
  const regressions = allResults.filter((r) => r.outputSize > r.inputSize * 1.05);
  if (regressions.length > 0) {
    console.error(
      `\nFAIL: ${regressions.length} image(s) are significantly larger than an optimized re-encode would produce.`
    );
    process.exit(1);
  }
  console.log('\nOK: all images are within expected optimization bounds.');
}
