import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const distEssays = path.join(root, 'dist/essays');

function stripScripts(html) {
  return html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/g, '');
}

function imgTags(html) {
  return [...stripScripts(html).matchAll(/<img\b[^>]*>/g)].map((match) => match[0]);
}

function attr(tag, name) {
  const match = tag.match(new RegExp(`\\s${name}="([^"]*)"`));
  return match ? match[1] : null;
}

test('built essays emit one bundled URL per inline figure and no src rewrite script', () => {
  assert.ok(fs.existsSync(distEssays), 'run npm run build before this test');
  const postsDir = path.join(root, 'src/content/posts');
  const assetNames = new Set(
    fs.readdirSync(path.join(root, 'src/assets/posts')).map((name) => name.toLowerCase())
  );
  let inlineCount = 0;

  for (const file of fs.readdirSync(postsDir).filter((name) => name.endsWith('.md'))) {
    const slug = file.replace(/\.md$/, '');
    const markdown = fs.readFileSync(path.join(postsDir, file), 'utf8');
    const htmlPath = path.join(distEssays, slug, 'index.html');
    assert.ok(fs.existsSync(htmlPath), slug);
    const html = fs.readFileSync(htmlPath, 'utf8');
    assert.equal(html.includes('data-urlmap'), false, slug);
    assert.equal(html.includes('img[src^="/posts/"]'), false, slug);

    const figures = [...markdown.matchAll(/!\[[^\]]*\]\(([^)\s]+)\)/g)].map((match) => match[1]);
    const tags = imgTags(html).filter((tag) => attr(tag, 'loading') === 'lazy');
    assert.equal(tags.length, figures.length, `${slug} figure count`);
    for (const [index, src] of figures.entries()) {
      const name = src.split('?')[0].split('/').pop().toLowerCase();
      const emitted = attr(tags[index], 'src');
      assert.equal(attr(tags[index], 'fetchpriority'), 'auto', name);
      assert.match(attr(tags[index], 'width') || '', /^[1-9]\d*$/, name);
      assert.match(attr(tags[index], 'height') || '', /^[1-9]\d*$/, name);
      assert.ok(fs.existsSync(path.join(root, 'dist', emitted)), emitted);
      if (assetNames.has(name)) {
        assert.ok(emitted.startsWith('/_astro/'), `${name} -> ${emitted}`);
        assert.equal(emitted.startsWith('/posts/'), false, emitted);
      } else if (/^https?:\/\//i.test(src)) {
        assert.equal(emitted, src, name);
      } else {
        assert.equal(emitted, src, name);
      }
      inlineCount += 1;
    }
  }

  assert.ok(inlineCount >= 11, `expected the committed inline figures, saw ${inlineCount}`);
  const structural = fs.readFileSync(
    path.join(distEssays, 'structural-patterns-in-product-management/index.html'),
    'utf8'
  );
  assert.match(
    structural,
    /property="og:image" content="https:\/\/ntemposd\.me\/posts\/structural-patterns-in-product-management\.jpg"/
  );
  assert.match(structural, /width="1724" height="1876"/);
  assert.match(structural, /width="1724" height="1888"/);
  const caption = imgTags(fs.readFileSync(path.join(distEssays, 'another-gpt-wrapper/index.html'), 'utf8'))
    .find((tag) => (attr(tag, 'alt') || '').includes('Easyscout architecture'));
  assert.ok(caption, 'captioned figure kept its alt text');
  assert.ok(attr(caption, 'src').startsWith('/_astro/'));
});
