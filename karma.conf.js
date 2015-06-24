module.exports = function(karma) {
  karma.set({
    frameworks:['mocha'],
    files:[
      'node_modules/chai/chai.js',
      'node_modules/sinon/pkg/sinon-1.15.3.js',
      'node_modules/sinon-chai/lib/sinon-chai.js',
      'index.js',
      'test/*.js'
    ],
    preprocessors: {
      'index.js': ['coverage']
    },
    browsers: ['PhantomJS', 'Firefox'],
    reporters: ['mocha', 'coverage'],
    singleRun: true,
    autoWatch: false,
    coverageReporter: {
      dir : 'coverage/browser',
      reporters: [
        {type:'json'}
      ]
    }
  })
};