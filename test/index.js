var bundler = require('../');
var assert  = require('assert');

process.on('unhandledRejection', function(a, b){
    console.error('unhandled promise rejection:', a, b);
});

it('should bundle files', function (done) {
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

it('should bundle files and update', function (done) {
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
