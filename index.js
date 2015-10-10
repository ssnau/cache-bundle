var path = require('path');
var browserify = require('browserify');
var run = require('run-callback');
var through = require('through2');
var xtend = require('xtend');
var sink = require('sink-transform');

function safe (fn) {
  try {
    return fn();
  } catch (e) {
    return void 0;
  }
}

function Bundle(opt) {
    this.opt = opt || {
        cache: {}, packageCache: {}
    };
}
Bundle.prototype.setOpt = function(opt) {
    this.opt = opt;
};
Bundle.prototype.getOpt = function(opt) {
    return this.opt;
};
Bundle.prototype.setTransform = function (transform) {
    this.transform = transform;
};
Bundle.prototype.bundle = function(file) {
    var b = browserify(this.opt);
    this.b = b;
    var opt = this.opt;
    b.add(file);
    if (this.transform) b = this.transform(b) || b;
    b.on('reset', collect);
    collect();
    b.on('reset', reset);
    reset();
    
    // clear input file cache and pkgcache
    var id = file.file;
    if (opt.cache) delete opt.cache[id];
    if (opt.pkgcache) delete opt.pkgcache[id];

    function collect () {
        var cache = opt.cache;
        b.pipeline.get('deps').push(through.obj(function(row, enc, next) {
            var file = row.expose ? b._expose[row.id] : row.file;
            cache[file] = {
                source: row.source,
                deps: xtend({}, row.deps)
            };
            this.push(row);
            next();
        }));
    }

    var bytes, time, delta;
    function reset () {
        time = null;
        bytes = 0;
        b.pipeline.get('record').on('end', function () {
            time = Date.now();
        });
        
        // 统计时间
        b.pipeline.get('wrap').push(through(write, end));
        function write (buf, enc, next) {
            bytes += buf.length;
            this.push(buf);
            next();
        }
        function end () {
            delta = Date.now() - time;
            this.push(null);
        }
    }

    function bundle() {
        return new Promise(function(resolve, reject) {
            var r = b.bundle();
            r.pipe(sink.str(function (out, done) {
                resolve({
                    out: out,
                    bytes: bytes,
                    duration: delta
                });
                done();
            }));
            r.once('error', function(e) {
                delete e.stream;
                reject(e);
            });
        });
    }

    return bundle();
};

module.exports = Bundle;
