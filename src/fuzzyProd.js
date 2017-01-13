import {createSelector} from 'reselect'
import _ from 'lodash'

function offsetPct(sec, intervalMillis) {
  return (sec % intervalMillis) / intervalMillis
}

function atExact(production, fn) {
  return sec => {
    //console.log('atExact', sec)
    return fn.call(production, sec)
  }
}
function atBounds(atExact) {
  return (tLower, tUpper) => {
    const lower = atExact(tLower)
    const upper = atExact(tUpper)
    const keys = Object.keys(lower)
    const diff = _.zipObject(keys, keys.map(key => upper[key] - lower[key]))
    return {lower, upper, diff}
  }
}

function atTime(fn, sec, intervalSecs) {
  const {lower, diff} = fn(sec)
  const pct = offsetPct(sec, intervalSecs)
  const keys = Object.keys(diff)
  return _.zipObject(keys, keys.map(key => pct * diff[key] + lower[key]))
}

/**
 * Fast, but less accurate, production data estimates. Calulate the exact value
 * for two relatively distant time points, then linearly interpolate everything
 * in between.
 * 
 * Problem: it doesn't actually work. All the object juggling is more expensive
 * than an exact recomputation. Don't use this in prod! It may be worthwhile
 * once we add decimal.js support though, with its much slower calculations...
 */
export class LinearProductionEstimator {
  constructor(production, intervalMillis = 2 * 1000) {
    this.production = production
    this.intervalMillis = intervalMillis
    this.miss = 0
    this.hit = 0

    const b = this._boundsFns()
    this._exactCount = createSelector(t=>t, atExact(this.production, this.production.countAt))
    this._countAtBounds = createSelector(b.lower, b.upper, atBounds(this._exactCount))
    //this._velocityAtBounds = createSelector(b.lower, b.upper, atBounds(
    //  this.production, this.production.velocityAt))
    //this._accelerationAtBounds = createSelector(b.lower, b.upper, atBounds(
    //  this.production, this.production.accelerationAt))
  }

  _boundsFns() {
    const lower = sec => Math.floor(sec / this.intervalMillis) * this.intervalMillis
    return {
      lower,
      upper: sec => lower(sec) + this.intervalMillis
    }
  }

  countAt(sec) {
    return atTime(this._countAtBounds, sec, this.intervalMillis)
  }
}
