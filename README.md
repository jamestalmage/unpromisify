# unpromisify

automatically adapt callbacks whether they are node style or promise returning

[![Build Status](https://travis-ci.org/jamestalmage/unpromisify.svg)](https://travis-ci.org/jamestalmage/unpromisify)
[![Coverage Status](https://coveralls.io/repos/jamestalmage/unpromisify/badge.svg)](https://coveralls.io/r/jamestalmage/unpromisify)
[![Code Climate](https://codeclimate.com/github/jamestalmage/unpromisify/badges/gpa.svg)](https://codeclimate.com/github/jamestalmage/unpromisify)
[![Dependency Status](https://david-dm.org/jamestalmage/unpromisify.svg)](https://david-dm.org/jamestalmage/unpromisify)
[![devDependency Status](https://david-dm.org/jamestalmage/unpromisify/dev-status.svg)](https://david-dm.org/jamestalmage/unpromisify#info=devDependencies)

[![NPM](https://nodei.co/npm/unpromisify.png)](https://www.npmjs.com/package/unpromisify/)

# usage

**unpromisify(userCallback, ctx, args, done);**  
**unpromisify(userCallback, args, done);**  
**unpromisify(userCallback, done);**  
**unpromisify(userCallback, opts);**

  * `userCallback`: a user supplied callback that performs some async task.  It may call a node style callback, 
        or return a promise.
                    
  * `done` or `opts.done`: your callback, which will be called after user supplied async task completes.
  
  * `args` or `opts.arg`: *(optional)* array of arguments to call `userCallback` with. A callback handler will automatically be
        appended as the last argument.
  
  * `ctx` or `opts.ctx`: call the user supplied callback with this context
  
# advantages

  * Allows you to write your code using standard node style callbacks, without forcing it on users who prefer
    to return promises.
    
  * Guarantees your callback will be called async. Preventing the 
    [release of Zalgo](http://blog.izs.me/post/59142742143/designing-apis-for-asynchrony).  

  * Guarantees your callback will only called once. A major benefit of promises is the guarantee that they can only 
    be resolved once, and that your `then` handlers will only be called once. This prevents a common bug in node 
    style callbacks where someone else's bad code might try to call your callback twice.
    `unpromisify` provides the same "only resolve once" guarantee, regardless which method your user chooses.

# releasing
  
Use the [cut-release](https://www.npmjs.com/package/cut-release) cli utility.
   
  1. `npm install -g cut-release`
  
  2. `cut-release`
  
  3. follow the prompts
  