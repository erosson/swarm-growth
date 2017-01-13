import {Production, LinearProductionEstimator} from '../src/main.js'

function bench(runner, label, {runs, stepMillis}) {
  console.time(label)
  let ret = null
  for (let i=0; i < runs; i++) {
    let t = i * stepMillis
    ret = runner.countAt(t)
  }
  console.timeEnd(label)
  //console.log(ret)
  return ret
}
function main() {
  const tiers = 20
  const unitTypes = {}
  const bank = {}
  for (let i=0; i < tiers; i++) {
    let t0 = 't'+i
    let t1 = 't'+(i+1)
    bank[t0] = bank[t1] = 1
    unitTypes[t0] = {
      [t1]: 2,
    }
    unitTypes[t1] = unitTypes[t1] || {}
  }
  const exact = new Production(unitTypes, bank)
  const estimate = new LinearProductionEstimator(exact, 2)
  const config = {runs: 40000, stepMillis: 0.1}

  bench(exact, 'exact', config)
  bench(estimate, 'estimate', config)
}
main()
