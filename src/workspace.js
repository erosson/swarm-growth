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
  
  countAt(sec) {
    // solve the polynomial
    let ret = 0
    let fact = 1
    for (let degree=0; degree < this.polynomial.length; degree++) {
      // c * (t^d)/d!
      fact *= Math.max(1, degree)
      ret += this.polynomial[degree] * Math.pow(sec, degree) / fact
    }
    return ret
  }
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
    for (const name of Object.keys(counts)) {
      this.units[name] = new ProdUnit(name, counts[name], types[name])
    }
    // we know what each unit produces, reverse it to produced-by.
    // Start building the polynomial graph while we're at it.
    const polypath = []
    for (const parentName of Object.keys(this.units)) {
      const parent = this.units[parentName]
      for (const childName of Object.keys(parent.children)) {
        const child = this.units[childName]
        const path = child.parents[parentName] = parent.children[childName]
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
  
  countAt(sec) {
    return mapValues(this.units, (unit) => {
      return unit.countAt(sec)
    })
  }
}