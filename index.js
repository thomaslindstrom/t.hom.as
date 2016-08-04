// ---------------------------------------------------------------------------
//  index.js
// ---------------------------------------------------------------------------

    var packageJSON = require('./package.json');

    process.env.NODE_PATH = __dirname;
    require('module').Module._initPaths();

    process.env.VERSION = packageJSON.version;

    require('babel-polyfill');
    require('babel-register');

    require('./server');
