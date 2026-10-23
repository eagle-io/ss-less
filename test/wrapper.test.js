var assert = require('node:assert/strict');
var path = require('node:path');
var test = require('node:test');
var spawnSync = require('node:child_process').spawnSync;
var wrapper = require('../lib/wrapper');

test('compiles valid Less with the legacy math setting', function () {
  var output;
  wrapper.init('', {}).compile(path.join(__dirname, 'fixtures/valid.less'), { compress: true }, function (css) {
    output = css;
  });
  assert.equal(output, '.example{width:15px}');
});

['invalid.less', 'missing-import.less'].forEach(function (fixture) {
  test('fails the process instead of accepting empty CSS for ' + fixture, function () {
    var source = [
      'var wrapper = require(' + JSON.stringify(require.resolve('../lib/wrapper')) + ');',
      'wrapper.init("", {}).compile(' + JSON.stringify(path.join(__dirname, 'fixtures', fixture)) + ', {}, function () {',
      '  console.log("COMPILE_CALLBACK_CALLED");',
      '});'
    ].join('\n');
    var result = spawnSync(process.execPath, ['-e', source], { encoding: 'utf8' });
    assert.ifError(result.error);
    assert.notEqual(result.status, 0);
    assert.doesNotMatch(result.stdout, /COMPILE_CALLBACK_CALLED/);
    assert.match(result.stdout + result.stderr, /Unable to compile Less file/);
    assert.match(result.stdout + result.stderr, new RegExp(fixture.replace('.', '\\.')));
  });
});
