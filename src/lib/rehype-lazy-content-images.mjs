import fs from 'node:fs';
import path from 'node:path';

function readU24LE(buf, offset) {
  return buf[offset] | (buf[offset + 1] << 8) | (buf[offset + 2] << 16);
}

function jpegSize(buf) {
  if (buf.length < 4 || buf[0] !== 0xff || buf[1] !== 0xd8) return null;
  let offset = 2;
  while (offset + 9 < buf.length) {
    if (buf[offset] !== 0xff) return null;
    const marker = buf[offset + 1];
    if (marker === 0xd8 || marker === 0xd9) {
      offset += 2;
      continue;
    }
    if (offset + 4 > buf.length) return null;
    const length = buf.readUInt16BE(offset + 2);
    if (length < 2) return null;
    const isStartOfFrame =
      marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc;
    if (isStartOfFrame) {
      return {
        height: buf.readUInt16BE(offset + 5),
        width: buf.readUInt16BE(offset + 7),
      };
    }
    offset += 2 + length;
  }
  return null;
}

function webpSize(buf) {
  if (buf.length < 30 || buf.toString('ascii', 0, 4) !== 'RIFF') return null;
  if (buf.toString('ascii', 8, 12) !== 'WEBP') return null;
  const chunk = buf.toString('ascii', 12, 16);
  if (chunk === 'VP8X') {
    return {
      width: readU24LE(buf, 24) + 1,
      height: readU24LE(buf, 27) + 1,
    };
  }
  if (chunk === 'VP8 ' && buf.length > 30) {
    return {
      width: buf.readUInt16LE(26) & 0x3fff,
      height: buf.readUInt16LE(28) & 0x3fff,
    };
  }
  if (chunk === 'VP8L' && buf.length > 25) {
    const bits = buf.readUInt32LE(21);
    return {
      width: (bits & 0x3fff) + 1,
      height: ((bits >> 14) & 0x3fff) + 1,
    };
  }
  return null;
}

export function readImageSize(file) {
  let buf;
  try {
    buf = fs.readFileSync(file);
  } catch {
    return null;
  }
  if (buf.length >= 24 && buf.toString('ascii', 1, 4) === 'PNG') {
    return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
  }
  if (buf.length >= 10 && buf.toString('ascii', 0, 3) === 'GIF') {
    return { width: buf.readUInt16LE(6), height: buf.readUInt16LE(8) };
  }
  if (buf.length >= 12 && buf.toString('ascii', 0, 4) === 'RIFF') return webpSize(buf);
  if (buf[0] === 0xff && buf[1] === 0xd8) return jpegSize(buf);
  return null;
}

function localImageFile(src, root) {
  if (typeof src !== 'string' || !src.startsWith('/posts/')) return null;
  const name = src.split('?')[0].split('/').pop();
  if (!name) return null;
  const candidates = [
    path.join(root, 'public', 'posts', name),
    path.join(root, 'src', 'assets', 'posts', name),
  ];
  return candidates.find((file) => fs.existsSync(file)) ?? null;
}

function walk(node, root) {
  if (!node || typeof node !== 'object') return;
  if (node.type === 'element' && node.tagName === 'img') {
    const props = node.properties ?? (node.properties = {});
    if (!props.loading) {
      props.loading = 'lazy';
      if (!props.fetchpriority) props.fetchpriority = 'auto';
    }
    if (!props.width || !props.height) {
      const file = localImageFile(props.src, root);
      const size = file ? readImageSize(file) : null;
      if (size?.width && size?.height) {
        props.width = size.width;
        props.height = size.height;
      }
    }
  }
  for (const child of node.children ?? []) walk(child, root);
}

export function applyLazyContentImages(tree, root = process.cwd()) {
  walk(tree, root);
  return tree;
}

export function rehypeLazyContentImages(options = {}) {
  const root = options.root ?? process.cwd();
  return (tree) => {
    applyLazyContentImages(tree, root);
  };
}
