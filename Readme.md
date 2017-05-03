# can-define-stream-rxjs

[![Build Status](https://travis-ci.org/web-mech/can-define-stream-rxjs.svg?branch=master)](https://travis-ci.org/web-mech/can-define-stream-rxjs)

Define properties with streams on can-define types.

## Syntax

```
canDefineStreamRxjs([DefineMap])
```

### Example

```
var canDefineStreamRx = require('can-define-stream-rxjs');

var MyMap = DefineMap.extend({
	foo: 'string',
	bar: { type: 'string', value: 'bar' },
	baz: {
	  type: 'string',
	    stream: function( stream ) {
	      var fooStream = this.stream('.foo');
	      var barStream = this.stream('.bar');
	      return stream.merge(fooStream).merge(barStream);
	    }
	}
});

canDefineStreamRx(MyMap);
```

### Testing

```
npm test
```

