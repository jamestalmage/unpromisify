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
  var syncResults = true;
  if (arguments.length ===  2) {
    var opts = ctx;
    if ('function' === typeof ctx) {
      done = ctx;
      args = [];
      ctx = null;
    } else {
      done = opts.done;
      ctx = opts.ctx || null;
      args = opts.args || [];
      syncResults = opts.syncResults !== false;
    }
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
  assert.equal(typeof done, 'function', 'bad type for done or opts.done');

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

  if (maybePromise && ('function' === typeof maybePromise.then)) {
    maybePromise.then(function(result) {
      handleCallback(null, result);
    }, handleCallback);
  } else if (syncResults && ('undefined' !== typeof maybePromise)) {
    schedule(function() {
      done(null, maybePromise);
    })
  }
}

callCallback.setScheduler = function setScheduler(newScheduler) {
  assert.equal(typeof newScheduler, 'function', 'illegal argument: newScheduler');
  var oldScheduler = schedule;
  schedule = newScheduler;
  return oldScheduler;
};
