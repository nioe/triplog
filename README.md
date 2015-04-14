# grunt-workshop

## Requirements

- Start node server 
- Execute tests
- Restart server on file changes, reload browser page
- Execute tests, jslint on js file changes
- create production build: minify, uglify js and css files. copy to own directory (/dist)
- clean production directory before building. File Structure: dist/index.html, dist/

dist directory struture:
```javascript
    dist/
      index.html
      style/
          all.min.css
      js/
          all.min.js
```

## Installation
You only need to have node.js and bower installed.

Installing node.js:

See http://nodejs.org/download/

Install bower:
```sh
$ npm install -g bower
```
Install node modules:
```sh
$ npm install
```

Install frontend dependencies:
```sh
$ bower install
```

Execute mocha tests:
```sh
$ node_modules\.bin\mocha test\unit
```


Execute jasmine tests:
```sh
$ node_modules\.bin\jasmine-node test\integration
```

Production files should go to /dist



