cache-bundle
------

a simple script bundle tool based on browserify. With `cache-bundle`, you can bundle your script whenever you want and it is smart enough to cache your history.

install
----
```
npm install cache-bundle
```

usage
----

```javascript
// a.js
// ------
// require("./b"); log('i am a');
// b.js
// ------
// log('i am b');

var Bundle = require('cache-bundle');
var bundler = new Bundle();
budnler.bundle({
    file: __dirname + '/fixtures/ggg.js',
    source: 'require("./a"); console.log("i am ggg");'
}).then(function(res) {
    assert.ok(/i am a/.test(res.out))
    assert.ok(/i am b/.test(res.out))
    assert.ok(typeof res.bytes === 'number')
    assert.ok(typeof res.duration === 'number')
    done();
});
```

`cache-bundle` and get the cached setting for your next round bundling.


```javascript
// react is very large and may took a second to bundle
var Bundle = require('cache-bundle');
var bundler = new Bundle();
budnler.bundle({
    file: __dirname + '/fixtures/ggg.js',
    source: 'require("react"); console.log("i am ggg");'
}).then(function(res) {
    // get result within almost 2 seconds
    done();
});

// some time later
var b2 = new Bundle(bundler.getOpt());
b2.bundle({
    file: __dirname + '/fixtures/ggg.js', // file path is not changed
    source: 'require("react"); console.log("i am policae");'  // however, content is modified
}).bundle().then(function(res) {
    // get result within 100ms
    done();
});
```

## work with transform

use `setTransform` api to bind browserify transform for your bundling.

```javascript
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
```

License
----
MIT
