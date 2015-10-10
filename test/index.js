var Bundle = require('../');
var assert  = require('assert');

process.on('unhandledRejection', function(a, b){
    console.error('unhandled promise rejection:', a, b);
});

it('should bundle files', function (done) {
    var b = new Bundle();
    b.bundle({
        file: __dirname + '/fixtures/ggg.js',
        source: 'require("./a"); console.log("i am ggg");'
    }).then(function(res) {
        assert.ok(/i am a/.test(res.out))
        assert.ok(/i am b/.test(res.out))
        assert.ok(typeof res.bytes === 'number')
        assert.ok(typeof res.duration === 'number')
        done();
    });
});

it('should bundle files and update', function (done) {
    var b = new Bundle();
    b.bundle({
        file: __dirname + '/fixtures/ggg.js',
        source: 'require("react"); console.log("i am ggg");'
    }).then(function(res) {
        var oldtime = res.duration;
        var oldbytes = res.bytes;
        assert.ok(/i am ggg/.test(res.out));
        return {
            oldtime: res.duration,
            oldbytes: res.bytes,
            opt: b.getOpt()
        };
    }).then(function(data) {
        var b2 = new Bundle(data.opt);
       return b2.bundle({
            file: __dirname + '/fixtures/ggg.js',
            source: 'require("react"); console.log("i am policeman");'
        }).then(function(res) {
            var time = res.duration;
            assert.ok(/i am policeman/.test(res.out));
            assert.ok(res.bytes > data.oldbytes);
            assert.ok(time < data.oldtime - 300); // new time will be far less than the old time
            done();
        });
    }).catch(function(e) {
        console.log(e.stack);
    });
});

it('should bundle es6 files', function (done) {
    var b = new Bundle();
    b.setTransform(function (b) {
        return b.transform(require('babelify'));
    });
    b.bundle({
        file: __dirname + '/fixtures/abc.js',
        source: 'require("./es6"); console.log("i am ggg");'
    }).then(function(res) {
        var oldtime = res.duration;
        var oldbytes = res.bytes;
        assert.ok(/i am ggg/.test(res.out));
        done();
    });
});

it('should bundle with css files', function (done) {
    var b = new Bundle();
    b.setTransform(function (b) {
        return b.transform(require('cssnextify'), {global: true});
    });
    b.bundle({
        file: __dirname + '/fixtures/pp.js',
        source: 'require("./a.css"); console.log("i am ggg");'
    }).then(function(res) {
        var oldtime = res.duration;
        var oldbytes = res.bytes;
        assert.ok(/red/.test(res.out));
        done();
    });
});
