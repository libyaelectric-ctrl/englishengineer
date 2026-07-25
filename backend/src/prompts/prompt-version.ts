import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { createHash } from 'node:crypto';
import { logger } from '../logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

interface PromptVersion {
  version: string;
  hash: string;
  loadedAt: Date;
  content: string;
}

interface VersionManifest {
  latest: string;
  versions: Record<string, {
    hash: string;
    createdAt: string;
    description: string;
  }>;
}

/**
 * Prompt versioning system for AI prompts.
 * Supports multiple versions with hash tracking and fallback.
 */
export class PromptVersionManager {
  private versions = new Map<string, PromptVersion>();
  private manifest: VersionManifest;
  private activeVersion: string;

  constructor() {
    this.manifest = this.loadManifest();
    this.activeVersion = this.manifest.latest;
    this.preloadVersion(this.activeVersion);
  }

  private loadManifest(): VersionManifest {
    const manifestPath = join(__dirname, 'versions.json');
    if (existsSync(manifestPath)) {
      return JSON.parse(readFileSync(manifestPath, 'utf8'));
    }
    // Default manifest
    return {
      latest: 'v1',
      versions: {
        v1: {
          hash: '',
          createdAt: '2026-01-01T00:00:00Z',
          description: 'Initial prompt version',
        },
      },
    };
  }

  private preloadVersion(version: string): void {
    if (this.versions.has(version)) return;

    const versionDir = join(__dirname, version);
    if (!existsSync(versionDir)) {
      logger.w(`Prompt version ${version} directory not found`);
      return;
    }

    const files = readdirSync(versionDir).filter((f) => f.endsWith('.md'));
    for (const file of files) {
      const filePath = join(versionDir, file);
      const content = readFileSync(filePath, 'utf8').trim();
      const hash = createHash('sha256').update(content).digest('hex').slice(0, 8);

      this.versions.set(`${version}/${file}`, {
        version,
        hash,
        loadedAt: new Date(),
        content,
      });
    }
  }

  /**
   * Get a prompt by version and filename.
   * Falls back to latest version if requested version not found.
   */
  getPrompt(filename: string, version?: string): string {
    const targetVersion = version || this.activeVersion;
    const key = `${targetVersion}/${filename}`;

    // Try requested version
    if (this.versions.has(key)) {
      return this.versions.get(key)!.content;
    }

    // Try loading it
    this.preloadVersion(targetVersion);
    if (this.versions.has(key)) {
      return this.versions.get(key)!.content;
    }

    // Fallback to v1
    const fallbackKey = `v1/${filename}`;
    if (this.versions.has(fallbackKey)) {
      logger.w(`Prompt ${filename} not found in ${targetVersion}, falling back to v1`);
      return this.versions.get(fallbackKey)!.content;
    }

    throw new Error(`Prompt ${filename} not found in any version`);
  }

  /**
   * Get the hash of a prompt version.
   */
  getPromptHash(filename: string, version?: string): string {
    const targetVersion = version || this.activeVersion;
    const key = `${targetVersion}/${filename}`;

    if (this.versions.has(key)) {
      return this.versions.get(key)!.hash;
    }

    this.preloadVersion(targetVersion);
    return this.versions.get(key)?.hash || '';
  }

  /**
   * Set the active version.
   */
  setActiveVersion(version: string): void {
    if (this.manifest.versions[version]) {
      this.activeVersion = version;
      this.preloadVersion(version);
      logger.i(`Active prompt version set to ${version}`);
    } else {
      throw new Error(`Version ${version} not found in manifest`);
    }
  }

  /**
   * Get the active version.
   */
  getActiveVersion(): string {
    return this.activeVersion;
  }

  /**
   * List all available versions.
   */
  listVersions(): VersionManifest {
    return this.manifest;
  }

  /**
   * Compare two versions of a prompt.
   */
  compareVersions(filename: string, v1: string, v2: string): {
    identical: boolean;
    v1Hash: string;
    v2Hash: string;
  } {
    const v1Hash = this.getPromptHash(filename, v1);
    const v2Hash = this.getPromptHash(filename, v2);

    return {
      identical: v1Hash === v2Hash,
      v1Hash,
      v2Hash,
    };
  }
}

// Singleton instance
let instance: PromptVersionManager | null = null;

export const getPromptVersionManager = (): PromptVersionManager => {
  if (!instance) {
    instance = new PromptVersionManager();
  }
  return instance;
};
