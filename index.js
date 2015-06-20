module.exports = callCallback;

var assert = require('assert');
var slice = Array.prototype.slice;

var schedule = setTimeout;

if (typeof setImmediate === 'function') {
  schedule = setImmediate;
}

if (process && ('function' === typeof process.nextTick)) {
  schedule = process.nextTick;
}

function callCallback(userCallback, ctx, args, done) {
  if (arguments.length ===  2) {
    done = ctx;
    args = [];
    ctx = null;
  }
  else if (arguments.length === 3) {
    done = args;
    args = ctx ? slice.call(ctx) : [];
    ctx = null;
  }
  else {
    assert.equal(arguments.length, 4, 'incorrect number of arguments');
    args = args ? slice.call(args) : [];
  }
  assert.equal(typeof done, 'function', 'done');

  var called = false;
  function handleCallback(err, result) {
    if (called) {
      return;
    }
    called = true;

    schedule(function() {
      done(err, result);
    });
  }

  args.push(handleCallback);

  var maybePromise = userCallback.apply(ctx, args);

  if(maybePromise && ('function' === typeof maybePromise.then)) {
    maybePromise.then(function(result) {
      handleCallback(null, result);
    },handleCallback);
  }

  return maybePromise;
}

callCallback.setScheduler = function setScheduler(newScheduler) {
  assert.equal(typeof newScheduler, 'function', 'illegal argument: newScheduler');
  var oldScheduler = schedule;
  schedule = newScheduler;
  return oldScheduler;
};
