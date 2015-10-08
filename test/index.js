var bundler = require('../');
var assert  = require('assert');

process.on('unhandledRejection', function(a, b){
    console.error('unhandled promise rejection:', a, b);
});

xit('should bundle files', function (done) {
    bundler({
        file: __dirname + '/fixtures/ggg.js',
        source: 'require("./a"); console.log("i am ggg");'
    }).bundle().then(function(res) {
        assert.ok(/i am a/.test(res.out))
        assert.ok(/i am b/.test(res.out))
        assert.ok(typeof res.bytes === 'number')
        assert.ok(typeof res.duration === 'number')
        done();
    });
});

xit('should bundle files and update', function (done) {
    bundler({
        file: __dirname + '/fixtures/ggg.js',
        source: 'require("react"); console.log("i am ggg");'
    }).bundle().then(function(res) {
        var oldtime = res.duration;
        var oldbytes = res.bytes;
        assert.ok(/i am ggg/.test(res.out));

        bundler({
            file: __dirname + '/fixtures/ggg.js',
            source: 'require("react"); console.log("i am policeman");'
        }).bundle().then(function(res) {
            var time = res.duration;
            assert.ok(/i am policeman/.test(res.out));
            assert.ok(res.bytes > oldbytes);
            assert.ok(time < oldtime); // new time will be far less than the old time
            done();
        });

    });
});

it('should bundle es6 files', function (done) {
    bundler({
        file: __dirname + '/fixtures/abc.js',
        source: 'require("./es6"); console.log("i am ggg");'
    }, {
        before: function (b) {
            return b.transform(require('babelify'));
        }
    }).bundle().then(function(res) {
        var oldtime = res.duration;
        var oldbytes = res.bytes;
        assert.ok(/i am ggg/.test(res.out));
        done();
    });
});

it('should bundle with css files', function (done) {
    bundler({
        file: __dirname + '/fixtures/pp.js',
        source: 'require("./a.css"); console.log("i am ggg");'
    }, {
        before: function (b) {
            return b.transform(require('cssnextify'), {global: true});
        }
    }).bundle().then(function(res) {
        var oldtime = res.duration;
        var oldbytes = res.bytes;
        assert.ok(/red/.test(res.out));
        done();
    });
});
