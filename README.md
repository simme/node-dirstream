# DirStream

Simple stream wrapper for `fs.readdir()`. Takes a path and streams the
contents of the target directory.

# Installation

Install with NPM:

`npm install dirstream`

# Usage

To get a stream of file names from a target directory just do:

    var path  = 'path/to/folder/to/scan';
    var files = require('dirstream')(path);
    files.on('data', function (file) {
      console.log(file);
    });
    files.on('end', function () {
      console.log('All files logged! Fish: ><(( v ) ">');
    });

To get a stream of only the files that match a given pattern do:

    var path  = 'path/to/folder/to/scan';
    var pattern = /\.jpg$/; // Only give me jpgs
    var files = require('dirstream')(path, pattern);
    files.on('data', function (jpgname) {
      console.log(jpgname);
    });
    files.on('count', function (count) {
      console.log('Hang on for a stream of ' + count + ' files!');
    });

If you want absolute paths instead of only the file name from the `data`
events you can pass a boolean flag to the constructor. Like so:

    var path = ...;
    var files = require('dirstream')(path, true);

    // Works with filters too
    var files = require('dirstream')(path, true, /.\.log$/);

# Events

## count

`DirStream` will emit a `count` event after the results from `fs.readdir()`
has been counted. Files excluded by filter will _not_ be included in this
count.

## data

The `data` event is emitted once for every file in the target directory.

## end

The `end` event will be emitted once all files have been emitted.

## error

If `DirStream` encounters an error, the `error` event will be emitted.


# Pause/Resume

`DirStream` has full support for pausing and resuming. If for example you need
to load and parse the files emitted but only want to do process a few files
at a time. You could implement an internal counter and pause the stream using
the `.pause()` function on the stream once you're processing `x` number of
files. Then call `.resume()` once a file has completed parsing. Or something.

# License

See LICENSE.

