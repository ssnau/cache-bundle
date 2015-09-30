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
```

`cache-bundle` will save the cache by the input file path, thus you can update the file by call the same api again.


```javascript
// react is very large and may took a second to bundle
bundler({
    file: __dirname + '/fixtures/ggg.js',
    source: 'require("react"); console.log("i am ggg");'
}).bundle().then(function(res) {
    // get result within almost 2 seconds
    done();
});

// some time later
bundler({
    file: __dirname + '/fixtures/ggg.js', // file path is not changed
    source: 'require("react"); console.log("i am policae");'  // however, content is modified
}).bundle().then(function(res) {
    // get result within 100ms
    done();
});
```

`bundler` will fetch the same session if you provide the same path.

### clean the session

#### deleteSessionByName(name)

- `name` is the file path.

#### deleteSessionByAge(age)

- `age` is a number representing how long the session should live by millionseconds. If the session is older than the provided age, than the session will be killed.


#### getSessions()

- get all the sessions.


License
----
MIT
