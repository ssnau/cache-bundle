var browserify = require('browserify');
var run = require('run-callback');
var through = require('through2');
var xtend = require('xtend');
var sink = require('sink-transform');
var opt = {
    cache: {}, packageCache: {}
};
var changingDeps = {};
var pending = false;
var updating = false;

var sessions = {};
function x(file) {
    if (sessions[file.file]) {
        var session =  sessions[file.file];
        session.update(file);
        return session;
    }

    var b = browserify(opt);
    b.add(file);
    b.on('reset', collect);
    collect();
    b.on('reset', reset);
    reset();

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
            /*
            console.log(
             bytes + ' bytes written ('
                + (delta / 1000).toFixed(2) + ' seconds)'
            );
            */
            this.push(null);
        }
    }
    var cache = opt.cache;
    var pkgcache = opt.packageCache;

    function update (file) {
        res.utime = Date.now();
        var id = file.file;
        if (cache) delete cache[id];
        if (pkgcache) delete pkgcache[id];
        var record = b._recorded.filter(function(x) {
            return x.file = id;
        })[0];
        record.source = file.source;
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

    var res = sessions[file.file] = {
        update: update,
        bundle: bundle,
        ctime: Date.now()
    };
    return res;
}

x.deleteSessionByName = function (name) { delete sessions[name]; };
x.deleteSessionByAge = function (age) {
    var now = new Date();
    if (!age) age = 1000 * 60 * 10; // 10 min for each session
    var indices = [];
    Object.keys(sessions).forEach(function(key) {
        if (now - sessions[key].utime > age) {
            x.deleteSession[key];
        }
    });
};
x.getSessions = function () { return sessions; };


module.exports = x;
