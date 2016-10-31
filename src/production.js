import mapValues from 'lodash/mapValues'

class ProdUnit {
  constructor(name, count, children) {
    this.name = name
    this.count = count
    // children: other units produced by this one
    this.children = {}
    for (const name of Object.keys(children || {})) {
      const p = this.children[name] = {
        each: children[name],
        total: () => { return p.each * this.count }
      }
    }
    // these are populated by Production
    this.parents = {}
    this.polynomial = [this.count]
  }
  
  degreeAt(degree0, sec) {
    // solving degree 0 of the polynomial gets the current count. This allows
    // arbitrary degrees, to solve for velocity, acceleration, etc.
    let ret = 0
    let fact = 1
    for (let degree = degree0; degree < this.polynomial.length; degree++) {
      let ddiff = degree - degree0
      // c * (t^d)/d!
      fact *= Math.max(1, ddiff)
      ret += this.polynomial[degree] * Math.pow(sec, ddiff) / fact
    }
    return ret
  }
  countAt(sec) { return this.degreeAt(0, sec) }
  velocityAt(sec) { return this.degreeAt(1, sec) }
  accelerationAt(sec) { return this.degreeAt(2, sec) }
}

class PolyPath {
  constructor(path) {
    this.path = path
  }
  
  head() {
    return this.path[0]
  }
  tail() {
    return this.path[this.path.length-1]
  }
  parent() {
    return this.tail().parent
  }
  child() {
    return this.head().child
  }
  
  degree() {
    return this.path.length
  }
  
  coefficient() {
    let coeff = this.parent().count
    for (const path of this.path) {
      coeff *= path.each
    }
    return coeff
  }
  
  // create PolyPaths for producer's producers
  nextDegree() {
    return Object.keys(this.parent().parents).map((name) => {
      const path = this.parent().parents[name]
      return new PolyPath(this.path.concat([path]))
    })
  }
}

export class Production {
  constructor(types, counts) {
    this.units = {}
    for (let name of Object.keys(types)) {
      this.units[name] = new ProdUnit(name, counts[name] || 0, types[name])
    }
    for (let name of Object.keys(counts)) {
      if (!this.units[name]) {
        console.warn("skipping prod-set-count for undefined unittype: "+name)
      }
    }
    // we know what each unit produces, reverse it to produced-by.
    // Start building the polynomial graph while we're at it.
    const polypath = []
    for (let parentName of Object.keys(this.units)) {
      let parent = this.units[parentName]
      for (let childName of Object.keys(parent.children)) {
        let child = this.units[childName]
        let path = child.parents[parentName] = parent.children[childName]
        path.parent = parent
        path.child = child
        polypath.push(new PolyPath([path]))
      }
    }
    // build the production polynomial, starting from first degree (drone->meat) and moving upward.
    while (polypath.length > 0) {
      const poly = polypath.pop()
      poly.child().polynomial[poly.degree()] = (poly.child().polynomial[poly.degree()] || 0)
      poly.child().polynomial[poly.degree()] += poly.coefficient()
      Array.prototype.push.apply(polypath, poly.nextDegree())
    }
  }
  
  unit(name) {
    return this.units[name]
  }
  
  countAt(sec) { return mapValues(this.units, unit => unit.countAt(sec)) }
  velocityAt(sec) { return mapValues(this.units, unit => unit.velocityAt(sec)) }
  accelerationAt(sec) { return mapValues(this.units, unit => unit.accelerationAt(sec)) }
  degreeAt(degree, sec) { return mapValues(this.units, unit => unit.degreeAt(degree, sec)) }
}
