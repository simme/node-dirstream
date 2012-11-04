//
// # DirStream
//
// Takes a path to a directory and streams the file names from this directory.
//
// Just uses `fs.readdir()` to scan a directory and then stream the output of
// that function. Mainly just a as convinience to easily be able to stream
// filenames to another stream that perhaps loads and parses the files.
//
// ## Dependencies
//
// Stream
var Stream  = require('stream').Stream;
// Inheritance helper.
var Inherit = require('util').inherits;
// Read dir function.
var ReadDir = require('fs').readdir;
// Stat function.
var Stat = require('fs').stat;

//
// ## DirStream
//
// **parameters**
//
// * path
//
//   Path to the directory to scan.
//
// * filter
//
//   Optional regex to filter files by. Filenames matching the filter will be
//   put through.
//
// **returns**
//
// * dirstream
//
var DirStream = function (path, filter) {
  // Call super constructor
  Stream.call(this);
  // Set readable
  this.readable = true;
  // File list
  this.files = [];
  // Total number of files
  this.total = 0;
  // Filter regex
  this.filter = filter;
  // Is currently streaming, internal
  this._streaming = false;
  // Files have been loaded
  this._filesLoaded = false;

  // Check if target directory exists
  var self = this;
  Stat(path, function (err, stats) {
    // Error stating path
    if (err) {
      self.emit('error', err);
      self.end();
      return;
    }
    // Target path not directory
    else if (!stats.isDirectory()) {
      self.emit('error', new Error('Target path is not a directory.'));
      self.end();
      return;
    }

    // Scan directory
    ReadDir(path, function (err, files) {
      self.handleFiles.apply(self, arguments);
    });
  });
};

//
// ## Inherits from Stream.
//
Inherit(DirStream, Stream);

//
// ## Handle files
//
// Handle result from read dir
//
DirStream.prototype.handleFiles = function (err, files) {
  if (err) {
    this.emit('error', err);
    this.end();
    return;
  }

  // Filter unwanted files
  var filter = this.filter;
  files.filter(function (item) {
    return !item.match(filter);
  });

  // Save total amount of files and emit the count.
  this.files = files;
  this.total = files.length;
  this._filesLoaded = true;
  this.emit('count', this.total);

  // Start streaming
  this._stream();
};

//
// ## Stream
//
// Streams the files.
//
DirStream.prototype._stream = function (hint) {
  // Emit file names while not paused and we have more files.
  this._streaming = true;
  var file;
  while (this._streaming && this.files.length) {
    file = this.files.shift();
    this.emit('data', file);
  }

  // If `shift` didn't result in a file, this is the end.
  if (!this.files.length && this._filesLoaded) {
    this.emit('end');
    this.emit('close');
  }
};

//
// ## Pause
//
// Pause streaming.
//
DirStream.prototype.pause = function () {
  this._streaming = false;
};

//
// ## Resume streaming
//
// Resumes streaming by setting _streaming to true and calling _stream().
//
DirStream.prototype.resume = function () {
  this._streaming = true;
  this._stream('resuming');
};

//
// # Exported API
//
module.exports = function (path, filter) {
  return new DirStream(path, filter);
};
module.exports.DirStream = DirStream;
