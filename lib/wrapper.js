// Less 'CSS' wrapper for SocketStream 0.3

var fs = require('fs')
  , less = require('less');

exports.init = function(root, config) {

  return {

    name: 'Less',

    extensions: ['less'],

    assetType: 'css',

    contentType: 'text/css',

    compile: function(path, options, cb) {
      // Get dir from path to enable @include commmand
      var dir = path.split('/'); dir.pop();

      var input = fs.readFileSync(path, 'utf8');
      // check if there is LESS to prepend to input file
      if (config.prepend){
        input = config.prepend + "\n" + input;
      }

      var compress = options && options.compress;

      // Less 1.3 evaluated math everywhere. Less 4 defaults to parens-division,
      // which leaves floor(@grid-gutter-width / 2) as a non-number.
      less.render(input, { paths: [dir.join('/')], filename: path, compress: compress, math: 'always' }, function (err, output) {
        if (err) {
          console.log('! - Unable to compile Less file %s into CSS', path);
          console.log(err);
          throw err;
        }
        cb(output.css);
      });
    }
  }
}
