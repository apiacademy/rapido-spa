/* global require, module */

var EmberApp = require('ember-cli/lib/broccoli/ember-app');

var app = new EmberApp();

// Use `app.import` to add additional libraries to the generated
// output files.
//
// If you need to use different assets in different
// environments, specify an object as the first parameter. That
// object's keys should be the environment name and the values
// should be the asset to use in that environment.
//
// If the library that you are including contains AMD or ES6
// modules that you would like to import into your application
// please specify an object with the list of modules as keys
// along with the exports of each module as its value.

app.import('bower_components/bootstrap/dist/css/bootstrap.css');
app.import('bower_components/bootstrap/dist/css/bootstrap.css.map');
app.import('bower_components/bootstrap/dist/js/bootstrap.min.js');
app.import('bower_components/d3/d3.min.js');
app.import('bower_components/typeahead.js/dist/typeahead.bundle.min.js');
app.import('bower_components/ace-builds/src-noconflict/ace.js');
app.import('bower_components/ace-builds/src-min-noconflict/mode-json.js');
app.import('bower_components/ace-builds/src-min-noconflict/worker-json.js');
app.import('bower_components/ace-builds/src-min-noconflict/mode-xml.js');
app.import('bower_components/ace-builds/src-min-noconflict/mode-markdown.js');
app.import('bower_components/ace-builds/src-min-noconflict/mode-yaml.js');
app.import('bower_components/ace-builds/src-min-noconflict/theme-cobalt.js');

app.import('vendor/rapido/tree.js');
app.import('vendor/rapido/typeahead.js');

module.exports = app.toTree();

