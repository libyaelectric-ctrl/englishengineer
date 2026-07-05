// src/tools/generate-missing-audio.ts
import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';
import { getAudioUrl } from 'google-tts-api';
import ffmpeg from 'fluent-ffmpeg';
import ffmpegPath from 'ffmpeg-static';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataFile = path.resolve(__dirname, '../../src/features/listening/listening.data.ts');
const audioDir = path.resolve(__dirname, '../../public/audio');

async function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) {
    await fs.promises.mkdir(dir, { recursive: true });
  }
}

async function generateMissingAudio() {
  await ensureDir(audioDir);
  const raw = await fs.promises.readFile(dataFile, 'utf-8');
  const audioUrlRegex = /audioUrl:\s*'([^']+)'/g;
  const entries = Array.from(raw.matchAll(audioUrlRegex));
  for (const match of entries) {
    const relPath = match[1];
    const filename = path.basename(relPath);
    const destPath = path.join(audioDir, filename);
    if (fs.existsSync(destPath)) {
      console.log(`Exists: ${filename}`);
      continue;
    }
    const placeholder = 'This is a placeholder audio for missing listening mission.';
    try {
      const ttsUrl = await getAudioUrl(placeholder, { lang: 'en', slow: false });
      const response = await fetch(ttsUrl);
      const buffer = Buffer.from(await response.arrayBuffer());
      const tempMp3 = path.join(audioDir, `${filename}.mp3`);
      await fs.promises.writeFile(tempMp3, buffer);
      ffmpeg.setFfmpegPath(ffmpegPath as string);
      await new Promise<void>((resolve, reject) => {
        ffmpeg(tempMp3)
          .outputOptions('-ar 16000')
          .toFormat('wav')
          .save(destPath)
          .on('end', () => resolve())
          .on('error', (err: unknown) => reject(err));
      });
      await fs.promises.unlink(tempMp3);
      console.log(`Generated ${filename}`);
    } catch (e) {
      console.error(`Failed to generate ${filename}:`, e);
      await fs.promises.writeFile(destPath, Buffer.alloc(0));
    }
  }
}

generateMissingAudio().catch((err) => console.error('Unexpected error:', err));
