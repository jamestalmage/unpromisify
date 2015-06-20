describe('unpromisify', function () {
  var chai = require('chai');
  var expect = chai.expect;
  var sinon = require('sinon');
  chai.use(require('sinon-chai'));

  var unpromisify = require('..');

  var clock, done, promise, oldScheduler;

  beforeEach(function() {
    done = sinon.spy();
    promise = {
      then: sinon.spy()
    };
    clock = sinon.useFakeTimers();
    oldScheduler = unpromisify.setScheduler(setTimeout);
  });

  afterEach(function() {
    clock.restore();
    unpromisify.setScheduler(oldScheduler);
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

  it('promise fail argument will call failure', function () {
    unpromisify(function () {
      return promise;
    }, done);

    promise.then.firstCall.args[1]('reason');

    expect(done.called, 'should be async').to.equal(false);

    clock.tick();

    expect(done).to.have.been.calledOnce.and.calledWith('reason');
  });

});
