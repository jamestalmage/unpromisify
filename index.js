(function(){
var slice = Array.prototype.slice;

var schedule = setTimeout;

if (typeof setImmediate === 'function') {
  schedule = setImmediate;
}

if (('undefined' !== typeof process) && process && ('function' === typeof process.nextTick)) {
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
    if (arguments.length !== 4) {
      throw new Error('incorrect number of arguments: ' + arguments.length)
    }
    args = args ? slice.call(args) : [];
  }
  if ('function' !== typeof done) {
    throw new Error('done must be of type function, got: ' + typeof done);
  }

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
  if ('function' !== typeof newScheduler) {
    throw new Error('newScheduler must be of type function, got: ' + typeof newScheduler);
  }
  var oldScheduler = schedule;
  schedule = newScheduler;
  return oldScheduler;
};

  /* istanbul ignore next */
  if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = callCallback;
  }
  else {
    if (typeof define === 'function' && define.amd) {
      define([], function() {
        return callCallback;
      });
    }
    else {
      window.unpromisify = callCallback;
    }
  }
})();