const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { test } = require('node:test');
const wrapper = require('../lib/wrapper');

test('valid Less preserves imports, prepend, compression and legacy math', async () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'ss-less-valid-'));
  try {
    fs.writeFileSync(path.join(root, 'colors.less'), '@color: red;');
    const source = path.join(root, 'main.less');
    fs.writeFileSync(source, '@import "colors"; .box { width: floor(@size / 2); color: @color; }');
    const formatter = wrapper.init(root, { prepend: '@size: 11px;' });
    const result = await new Promise((resolve) => formatter.compile(source, { compress: true }, (css, error) => resolve({ css, error })));
    assert.equal(result.error, undefined);
    assert.equal(result.css, '.box{width:5px;color:red}');
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

for (const invalid of [
  { name: 'undefined variable', source: '.box { width: @missing; }', message: /@missing is undefined/ },
  { name: 'invalid syntax', source: '.box { color: (red; }', message: /Expected '\)'/ }
]) test(invalid.name + ' reports one explicit error and no CSS', async () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'ss-less-invalid-'));
  try {
    const source = path.join(root, 'main.less');
    fs.writeFileSync(source, invalid.source);
    let calls = 0;
    const result = await new Promise((resolve, reject) => {
      try {
        wrapper.init(root, {}).compile(source, {}, (css, error) => {
          calls++;
          resolve({ css, error });
        });
      } catch (error) {
        reject(error);
      }
    });
    assert.equal(result.css, null);
    assert.match(result.error.message, invalid.message);
    assert.equal(result.error.filename, source);
    assert.equal(calls, 1);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test('missing source reports a read error through the same callback', async () => {
  const formatter = wrapper.init('', {});
  const result = await new Promise((resolve) => formatter.compile('/nonexistent-ss-less-test/main.less', {}, (css, error) => resolve({ css, error })));
  assert.equal(result.css, null);
  assert.equal(result.error.code, 'ENOENT');
});
