var namespace = require('can-util/namespace');
var canDefineStream = require('can-define-stream');
var canStreamRxjs = require('can-stream-rxjs');

module.exports = namespace.defineStreamRxjs = canDefineStream(canStreamRxjs);