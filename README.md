# swarm-production

[![Travis build status](http://img.shields.io/travis/erosson/swarm-production.svg?style=flat)](https://travis-ci.org/erosson/swarm-production)
[![Dependency Status](https://david-dm.org/erosson/swarm-production.svg)](https://david-dm.org/erosson/swarm-production)
[![devDependency Status](https://david-dm.org/erosson/swarm-production/dev-status.svg)](https://david-dm.org/erosson/swarm-production#info=devDependencies)

Based on swarmsim's unit production code, rewritten from scratch in ES6.
* https://github.com/swarmsim/swarm/blob/master/app/scripts/services/unit.coffee
* https://github.com/swarmsim/swarm/blob/master/app/scripts/services/game.coffee

Unlike many idle game simulations, we don't use discrete ticks every
n millis. Instead, `countAt(t)` calculates the number of units at
time t since the last snapshot, and snapshot whenever production values
change outside of this system (buy units or upgrade production).

Project template: https://github.com/babel/generator-babel-boilerplate

This hasn't been used in production yet, so there are probably bugs.

Basic ES6 usage:
   
    import prod from  'swarm-production'

npm should work:

    npm install swarm-production
