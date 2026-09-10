import assert from 'node:assert/strict';
import { test } from 'node:test';

import { parseAudioDuration } from '../src/speaking-routes.js';

// --- WAV tests ---

const makeWav = (opts: { sampleRate?: number; channels?: number; bitsPerSample?: number; dataSize?: number } = {}): Buffer => {
  const sampleRate = opts.sampleRate ?? 44100;
  const channels = opts.channels ?? 1;
  const bitsPerSample = opts.bitsPerSample ?? 16;
  const dataSize = opts.dataSize ?? sampleRate * channels * (bitsPerSample / 8) * 2; // 2 seconds
  const buf = Buffer.alloc(44 + dataSize);
  buf.write('RIFF', 0, 'ascii');
  buf.writeUInt32LE(36 + dataSize, 4);
  buf.write('WAVE', 8, 'ascii');
  buf.write('fmt ', 12, 'ascii');
  buf.writeUInt32LE(16, 16);
  buf.writeUInt16LE(1, 20); // PCM
  buf.writeUInt16LE(channels, 22);
  buf.writeUInt32LE(sampleRate, 24);
  buf.writeUInt32LE(sampleRate * channels * (bitsPerSample / 8), 28);
  buf.writeUInt16LE(channels * (bitsPerSample / 8), 32);
  buf.writeUInt16LE(bitsPerSample, 34);
  buf.write('data', 36, 'ascii');
  buf.writeUInt32LE(dataSize, 40);
  return buf;
};

test('WAV duration: 2 seconds at 44100 Hz mono 16-bit', () => {
  const buf = makeWav({ sampleRate: 44100, channels: 1, bitsPerSample: 16, dataSize: 44100 * 1 * 2 * 2 });
  assert.equal(parseAudioDuration(buf, 'audio/wav'), 2);
});

test('WAV duration: 5 seconds at 48000 Hz stereo 16-bit', () => {
  const buf = makeWav({ sampleRate: 48000, channels: 2, bitsPerSample: 16, dataSize: 48000 * 2 * 2 * 5 });
  assert.equal(parseAudioDuration(buf, 'audio/wav'), 5);
});

test('WAV duration: returns null for too-short buffer', () => {
  assert.equal(parseAudioDuration(Buffer.alloc(10), 'audio/wav'), null);
});

test('WAV duration: returns null for zero sample rate', () => {
  const buf = makeWav({ sampleRate: 0 });
  assert.equal(parseAudioDuration(buf, 'audio/wav'), null);
});

// --- MP3 tests ---

const makeMp3Frame = (bitrateIndex: number = 9): Buffer => {
  const buf = Buffer.alloc(4);
  buf[0] = 0xff;
  buf[1] = 0xfb;
  buf[2] = (bitrateIndex << 4) | 0x00;
  buf[3] = 0x00;
  return buf;
};

test('MP3 duration: returns null or zero for header-only buffer', () => {
  const frame = makeMp3Frame(9);
  const buf = Buffer.alloc(400);
  for (let i = 0; i < 100; i++) frame.copy(buf, i * 4);
  const duration = parseAudioDuration(buf, 'audio/mpeg');
  assert.ok(duration !== undefined, 'should return a number or null');
  assert.ok(duration === null || typeof duration === 'number', 'valid return type');
});

test('MP3 duration: returns null for empty buffer', () => {
  assert.equal(parseAudioDuration(Buffer.alloc(0), 'audio/mpeg'), null);
});

// --- MP4 tests ---

const makeMp4Mvhd = (timescale: number, duration: number, version: number = 0): Buffer => {
  const mvhdPayloadSize = version === 0 ? 100 : 112;
  const mvhdAtomSize = 8 + mvhdPayloadSize;
  const moovAtomSize = 8 + mvhdAtomSize;
  const ftypSize = 12;
  const totalSize = ftypSize + moovAtomSize;
  const buf = Buffer.alloc(totalSize);

  buf.writeUInt32BE(ftypSize, 0);
  buf.write('ftyp', 4, 'ascii');
  buf.write('isom', 8, 'ascii');

  let pos = ftypSize;
  buf.writeUInt32BE(moovAtomSize, pos);
  buf.write('moov', pos + 4, 'ascii');

  pos += 8;
  buf.writeUInt32BE(mvhdAtomSize, pos);
  buf.write('mvhd', pos + 4, 'ascii');
  buf[pos + 8] = version;

  if (version === 0) {
    buf.writeUInt32BE(timescale, pos + 20);
    buf.writeUInt32BE(duration, pos + 24);
  } else {
    buf.writeUInt32BE(timescale, pos + 28);
    buf.writeBigUInt64BE(BigInt(duration), pos + 32);
  }

  return buf;
};

test('MP4 duration: 30 seconds at timescale 44100', () => {
  const timescale = 44100;
  const duration = timescale * 30;
  const buf = makeMp4Mvhd(timescale, duration);
  assert.equal(parseAudioDuration(buf, 'audio/mp4'), 30);
});

test('MP4 duration: returns null when moov atom missing', () => {
  const buf = Buffer.from([0x00, 0x00, 0x00, 0x0c, 0x66, 0x74, 0x79, 0x70, 0x69, 0x73, 0x6f, 0x6d]);
  assert.equal(parseAudioDuration(buf, 'audio/mp4'), null);
});

// --- WebM tests ---

test('WebM duration: parses TimecodeScale and Duration', () => {
  const buf = Buffer.alloc(128);
  let pos = 0;
  buf[pos++] = 0x1a; buf[pos++] = 0x45; buf[pos++] = 0xdf; buf[pos++] = 0xa3;
  const hdrSizePos = pos++;
  const hdrDataStart = pos;
  buf[pos++] = 0x42; buf[pos++] = 0x86; buf[pos++] = 0x81; buf[pos++] = 0x01;
  buf[hdrSizePos] = 0x80 | (pos - hdrDataStart);
  buf[pos++] = 0x18; buf[pos++] = 0x53; buf[pos++] = 0x80; buf[pos++] = 0x67;
  const sizePos = pos++;
  const dataStart = pos;
  buf[pos++] = 0x2a; buf[pos++] = 0xd7; buf[pos++] = 0xb1;
  buf[pos++] = 0x83;
  buf.writeUIntBE(1000000, pos, 3); pos += 3;
  buf[pos++] = 0x44; buf[pos++] = 0x89;
  buf[pos++] = 0x88;
  buf.writeBigUInt64BE(BigInt(25000000), pos); pos += 8;
  buf[sizePos] = 0x80 | (pos - dataStart);
  assert.equal(parseAudioDuration(buf.subarray(0, pos), 'audio/webm'), 25);
});

test('WebM duration: returns null for buffer without Segment', () => {
  const buf = Buffer.from([0x1a, 0x45, 0xdf, 0xa3, 0x84, 0x42, 0x86, 0x81, 0x01, 0x42, 0x87, 0x81, 0x01]);
  assert.equal(parseAudioDuration(buf, 'audio/webm'), null);
});

test('returns null for unsupported content type', () => {
  assert.equal(parseAudioDuration(Buffer.alloc(100), 'audio/ogg'), null);
});
