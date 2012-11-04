//
// ## Test DirStream
//
var assert = require('assert');
var dirstream = require('../dirstream').DirStream;
var path = __dirname + '/foo';

suite('DirStream', function () {

  test('Count is correct', function (done) {
    var d = new dirstream(path);
    d.on('count', function (count) {
      assert(count, 5, 'Got count wrong.');
      done();
    });
  });

  test('Count works after filter', function (done) {
    var d = new dirstream(path, /.txt$/);
    d.on('count', function (count) {
      assert(count, 3, 'Filter not applied correctly.');
      done();
    });
  });

  test('Pause/resume works.', function (done) {
    var d = new dirstream(path);
    var count = 0;
    d.on('data', function (file) {
      count++;
      if (count == 3) {
        d.pause();
        setTimeout(function () {
          assert(count, 3, 'Pause does not work.');
          d.resume();
        }, 20);
      }
    });
    d.on('end', function () {
      done();
    });
  });

  test('Pipe works.', function (done) {
    var d = new dirstream(path);
    var piped = 0;
    var stream = new require('stream')();
    stream.writable = true;
    stream.write = function(file) {
      piped++;
    };
    stream.end = function() {
      assert(piped, 5, 'Piped count wrong.');
      done();
    };
    d.pipe(stream);
    stream.emit('drain');
    // or
    // d.resume();
  });

});

