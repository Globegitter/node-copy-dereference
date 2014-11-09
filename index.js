var fs = require('fs')
var path = require('path')

module.exports = copyDereference
function copyDereference () {
  throw new Error("This function does not exist. Use require('copy-dereference').sync")
}

module.exports.sync = copyDereferenceSync
function copyDereferenceSync (src, dest, force) {
  // We could try readdir'ing and catching ENOTDIR exceptions, but that is 3x
  // slower than stat'ing in the common case that we have a file.
  var srcStats = fs.statSync(src)
  if (srcStats.isDirectory()) {
    // We do not copy the directory mode by passing a second argument to
    // mkdirSync, because we wouldn't be able to populate read-only
    // directories. If we really wanted to preserve directory modes, we could
    // call chmodSync at the end.
    if(force === true) {
      try {
        fs.mkdirSync(dest)
      } catch(e) {
        if ( e.code != 'EEXIST' ) throw e;
      }
    } else {
      fs.mkdirSync(dest);
    }
    var entries = fs.readdirSync(src).sort()
    for (var i = 0; i < entries.length; i++) {
      copyDereferenceSync(src + path.sep + entries[i], dest + path.sep + entries[i], force)
    }
  } else if (srcStats.isFile()) {
    var contents = fs.readFileSync(src)
    if(force === true) {
      fs.writeFileSync(dest, contents, { flag: 'w', mode: srcStats.mode })
    } else {
      fs.writeFileSync(dest, contents, { flag: 'wx', mode: srcStats.mode })
    }
  } else {
    throw new Error('Unexpected file type for ' + src)
  }
  fs.utimesSync(dest, srcStats.atime, srcStats.mtime)
}
