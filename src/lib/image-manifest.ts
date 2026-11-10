import fs from 'fs';
import path from 'path';

export function getPublicImagesDir(): string {
  return path.join(process.cwd(), 'public', 'Images');
}

export function getPublicImagesManifest(): Record<string, string> {
  const dir = getPublicImagesDir();
  const manifest: Record<string, string> = {};

  try {
    if (!fs.existsSync(dir)) {
      return manifest;
    }
    const entries = fs.readdirSync(dir);
    for (const entry of entries) {
      const fullPath = path.join(dir, entry);
      try {
        const stat = fs.statSync(fullPath);
        if (stat.isFile()) {
          const version = `${Math.floor(stat.mtimeMs)}-${stat.size}`;
          manifest[entry] = version;
          manifest[entry.toLowerCase()] = version;
        }
      } catch {
        // Ignore transient file stat errors while user is replacing a file
      }
    }
  } catch {
    // Ignore directory read errors
  }

  return manifest;
}

export function resolvePublicImageFile(requestedName: string): {
  filePath: string;
  contentType: string;
  buffer: Buffer;
  version: string;
} | null {
  const dir = getPublicImagesDir();
  if (!fs.existsSync(dir)) return null;

  const cleanRequested = path.basename(requestedName);
  const entries = fs.readdirSync(dir);

  // 1. Exact match
  let matchedEntry = entries.find((e) => e === cleanRequested);

  // 2. Case-insensitive match
  if (!matchedEntry) {
    matchedEntry = entries.find(
      (e) => e.toLowerCase() === cleanRequested.toLowerCase()
    );
  }

  // 3. Basename match without extension (in case user uploaded Logo.jpg instead of Logo.png)
  if (!matchedEntry) {
    const reqBase = path.parse(cleanRequested).name.toLowerCase();
    matchedEntry = entries.find(
      (e) => path.parse(e).name.toLowerCase() === reqBase
    );
  }

  if (!matchedEntry) return null;

  const filePath = path.join(dir, matchedEntry);
  const stat = fs.statSync(filePath);
  if (!stat.isFile()) return null;

  const buffer = fs.readFileSync(filePath);
  const version = `${Math.floor(stat.mtimeMs)}-${stat.size}`;

  // Detect real MIME type from magic bytes first so renamed files still render properly
  let contentType = 'image/png';
  if (
    buffer.length >= 4 &&
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47
  ) {
    contentType = 'image/png';
  } else if (
    buffer.length >= 3 &&
    buffer[0] === 0xff &&
    buffer[1] === 0xd8 &&
    buffer[2] === 0xff
  ) {
    contentType = 'image/jpeg';
  } else if (
    buffer.length >= 12 &&
    buffer.subarray(0, 4).toString('ascii') === 'RIFF' &&
    buffer.subarray(8, 12).toString('ascii') === 'WEBP'
  ) {
    contentType = 'image/webp';
  } else if (
    buffer.length >= 4 &&
    buffer[0] === 0x47 &&
    buffer[1] === 0x49 &&
    buffer[2] === 0x46
  ) {
    contentType = 'image/gif';
  } else {
    const ext = path.extname(matchedEntry).toLowerCase();
    if (ext === '.jpg' || ext === '.jpeg') contentType = 'image/jpeg';
    else if (ext === '.webp') contentType = 'image/webp';
    else if (ext === '.svg') contentType = 'image/svg+xml';
    else if (ext === '.gif') contentType = 'image/gif';
  }

  return {
    filePath,
    contentType,
    buffer,
    version,
  };
}
