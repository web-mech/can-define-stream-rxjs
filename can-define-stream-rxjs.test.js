import test from 'ava';

import compute from 'can-compute';

import canDefineStreamRx from '.';

import DefineList from 'can-define/list/list';

import DefineMap from 'can-define/map/map';

test('Stream behavior on multiple properties with merge', function(t) {

  var expectedNewVal,
    expectedOldVal,
    caseName;

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

  var map = new MyMap();

  map.foo = 'foo-1';

  t.is( map.baz, undefined, "read value before binding");

  map.on("baz", function(ev, newVal, oldVal){
    t.is(newVal, expectedNewVal, caseName+ " newVal");
    t.is(oldVal, expectedOldVal, caseName+ " oldVal");
  });

  t.is( map.baz, 'bar', "read value immediately after binding");

  caseName = "setting foo";
  expectedOldVal = 'bar';
  expectedNewVal = 'foo-2';
  map.foo = 'foo-2';

  caseName = "setting bar";
  expectedOldVal = expectedNewVal;
  expectedNewVal = 'new bar';
  map.bar = 'new bar';

  caseName = "setting baz setter";
  expectedOldVal = expectedNewVal;
  expectedNewVal = 'new baz';
  map.baz = 'new baz';
});

test('Test if streams are memory safe', function(t) {

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
  var map = new MyMap();

  t.is(map.__bindEvents._lifecycleBindings, undefined, 'Should have no bindings');

  var handler = function(ev, newVal, oldVal){
    console.log("newVal", newVal); //->output: obaid
  };
  map.on("baz", handler);

  map.foo = "obaid";

  t.is(map.__bindEvents._lifecycleBindings, 3, 'Should have 3 bindings');

  map.off('baz',handler);

  t.is(map.__bindEvents._lifecycleBindings, 0, 'Should reset the bindings');
});

test('Keep track of change counts on stream', function(t){

  var count;

  var Person = DefineMap.extend({
      first: "string",
      last: "string",
      fullName: {
      get: function() {
        return this.first + " " + this.last;
      }
    },
      fullNameChangeCount: {
          stream: function(setStream) {
              return this.stream(".fullName").scan(function(last){ return last + 1;}, 0);
          }
      }
    });
  canDefineStreamRx(Person);
    var me = new Person({first: 'Justin', last: 'Meyer'});

  //this increases the count.. should it?
    me.on("fullNameChangeCount", function(ev, newVal){
    t.is(newVal, count, "Count should be " + count);
    });

  count = 2;
    me.first = "Obaid"; //outputs: 2 instead of 1

  count = 3;
    me.last = "Ahmed"; //outputs: 3 instead of 2

});


test('Update map property based on stream value', function(t) {
  var expected;
  var Person = DefineMap.extend({
    name: "string",
    lastValidName: {
        stream: function(){
        return this.stream(".name").filter(function(name){
              return name.indexOf(" ") >= 0;
        });
        }
    }
  });
  canDefineStreamRx(Person);
  var me = new Person({name: "James"});

  me.on("lastValidName", function(lastValid){
    t.is(lastValid.target.name, expected, "Updated name to " + expected);
  });

  me.name = "JamesAtherton";

  expected = "James Atherton";
  me.name = "James Atherton";

  me.name = "JustinMeyer";

  expected = "Justin Meyer";
  me.name = "Justin Meyer";

});

test('Stream on DefineList', function(t) {
  var expectedLength;

  var People = DefineList.extend({});

  canDefineStreamRx(People);

  var people = new People([
    { first: "Justin", last: "Meyer" },
    { first: "Paula", last: "Strozak" }
  ]);

  var stream = people.stream('length');

  stream.subscribe(function(event) {
    t.is(event.args[0], expectedLength, 'List size changed');
  });

  expectedLength = 3;
  people.push({
    first: 'Obaid',
    last: 'Ahmed'
  });

  expectedLength = 2;
  people.pop();
});


test('Can instantiate define-map instances with properties that have stream definitions.', function(t) {
  var Locator = DefineMap.extend({
    state: "string",
    city: {
       stream: function(setStream) {
           return this.stream(".state").map(function(){
               return null;
           }).merge(setStream);
       }
    }
  });
  canDefineStreamRx(Locator);

  var locator = new Locator({
      state: 'IL',
      city: 'Chitown'
  });

  t.is(locator.state, 'IL', 'State in tact, no errors');
  t.is(typeof locator.city, 'undefined', 'Derived value ignored until bound.');

  locator.on("city", function(){});

  t.is(locator.city, "Chitown", "can still get initial value");

  locator.state = 'FL';
  t.is(locator.city, null, 'Derived value set.');
});
