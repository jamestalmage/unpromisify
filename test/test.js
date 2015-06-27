if ('function' === typeof require) {
  var chai = require('chai');
  var sinon = require('sinon');
  chai.use(require('sinon-chai'));

  var unpromisify = require('..');
}

describe('unpromisify', function () {
  var expect = chai.expect;
  var match = sinon.match;

  var clock, done, promise, nextTick;

  beforeEach(function() {
    done = sinon.spy();
    promise = {
      then: sinon.spy()
    };
    clock = sinon.useFakeTimers();
    if('undefined' !== typeof process) {
      nextTick = process.nextTick;
      process.nextTick = setTimeout;
    }
  });

  afterEach(function() {
    clock.restore();
    if(nextTick) {
      process.nextTick = nextTick;
    }
  });

  it('users can call node style callbacks / 4 args', function () {
    var cb;
    var obj = {ctx:'blah'};
    unpromisify(function (a, b, _cb) {
      cb = _cb;
      expect(a).to.equal('a');
      expect(b).to.equal('b');
      expect(this).to.equal(obj);
    }, obj,['a','b'], done);

    expect(typeof cb).to.equal('function');

    cb(null, 'result');

    expect(done.called, 'should be async').to.equal(false);

    clock.tick();

    expect(done).to.have.been.calledOnce.and.calledWith(null, 'result');
  });

  it('users can call node style callbacks / args object', function () {
    var cb;
    var obj = {ctx:'blah'};
    unpromisify(function (a, b, _cb) {
      cb = _cb;
      expect(a).to.equal('a');
      expect(b).to.equal('b');
      expect(this).to.equal(obj);
    }, {
      ctx: obj,
      args: ['a', 'b'],
      done: done
    });

    expect(typeof cb).to.equal('function');

    cb(null, 'result');

    expect(done.called, 'should be async').to.equal(false);

    clock.tick();

    expect(done).to.have.been.calledOnce.and.calledWith(null, 'result');
  });

  it('users can return promises / 3 args', function () {
    unpromisify(function (a, b) {
      expect(a).to.equal('a');
      expect(b).to.equal('b');
      return promise;
    },['a','b'], done);

    expect(promise.then.called).to.equal(true);

    promise.then.firstCall.args[0]('result');

    expect(done.called, 'should be async').to.equal(false);

    clock.tick();

    expect(done).to.have.been.calledOnce.and.calledWith(null, 'result');
  });

  it('done will only be called once / 2 args', function() {
    var cb;
    unpromisify(function (_cb) {
      cb = _cb;
    }, done);

    cb(null, 'resultA');
    cb(null, 'resultB');

    clock.tick();

    expect(done).to.have.been.calledOnce.and.calledWith(null, 'resultA');
  });

  it('promise fail handler will call failure on callback', function () {
    unpromisify(function () {
      return promise;
    }, done);

    promise.then.firstCall.args[1]('reason');

    expect(done.called, 'should be async').to.equal(false);

    clock.tick();

    expect(done).to.have.been.calledOnce.and.calledWith('reason');
  });

  it('synchronously returning a value from the fetch function will resolve done with it', function() {
    unpromisify(function () {
      return 'hey';
    }, done);

    expect(done.called, 'should be async').to.equal(false);

    clock.tick();
    expect(done).to.have.been.calledOnce.and.calledWith(null, 'hey');
  });

  it('synchronously return behavior can be disabled with opts.syncResults', function() {
    var cb;
    unpromisify(function (_cb) {
      cb = _cb;
      return 'hey';
    }, {done:done, syncResults:false} );

    expect(done.called, 'should be async (1)').to.equal(false);
    clock.tick();
    expect(done.called, 'sync return behavior suppressed').to.equal(false);

    cb(null, 'ho');
    expect(done.called, 'should be async (2)').to.equal(false);
    clock.tick();
    expect(done).to.have.been.calledOnce.and.calledWith(null, 'ho');
  });

  it('throws if supplied incorrect arguments', function() {
    expect(function(){
      unpromisify(done);
    }).to.throw();

    expect(function(){
      unpromisify(done, 2);
    }).to.throw();

    expect(function(){
      unpromisify(done, {}, [], done, 'one too many');
    }).to.throw();

    expect(function(){
      unpromisify.setScheduler({});
    }).to.throw();
  });

  it('setScheduler returns the current scheduler', function() {
    function scheduler(){}

    var oldScheduler = unpromisify.setScheduler(scheduler);
    expect(unpromisify.setScheduler(oldScheduler)).to.equal(scheduler);
  });

  it('null args', function() {
    var spy1 = sinon.spy(function s1(){});
    var spy2 = sinon.spy(function s2(){});
    var spy3 = sinon.spy(function s3(){});

    unpromisify(spy1, {done:done, args:null});
    unpromisify(spy2, null, null, done );
    unpromisify(spy3, null, done );

    expect(spy1).to.have.been.calledWith(match.func);
    expect(spy2).to.have.been.calledWith(match.func);
    expect(spy3).to.have.been.calledWith(match.func);
  });

});
