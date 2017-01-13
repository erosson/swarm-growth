import {Production} from '../../src/main';

describe('numberformat', () => {
    it('calculates linear production', () => {
        const prod = new Production({
            meat: {},
            drone: {meat: 3},
        }, {
            meat: 11,
            drone: 2,
        })
        expect(prod.countAt(0)).to.deep.equal({meat: 11, drone: 2})
        expect(prod.countAt(1)).to.deep.equal({meat: 17, drone: 2})
        expect(prod.countAt(2)).to.deep.equal({meat: 23, drone: 2})
    })
    it('calculates quadratic production', () => {
        const prod = new Production({
            meat: {},
            drone: {meat: 3},
            queen: {drone: 5},
        }, {
            meat: 11,
            drone: 2,
            queen: 4,
        })
        expect(prod.countAt(0)).to.deep.equal({meat: 11, drone: 2, queen: 4})
        expect(prod.countAt(1)).to.deep.equal({meat: 47, drone: 22, queen: 4})
        expect(prod.countAt(2)).to.deep.equal({meat: 143, drone: 42, queen: 4})
    })
    it('calculates velocity, acceleration', () => {
        const prod = new Production({
            meat: {},
            drone: {meat: 3},
            queen: {drone: 5},
        }, {
            meat: 11,
            drone: 2,
            queen: 4,
        })
        expect(prod.countAt(0)).to.deep.equal({meat: 11, drone: 2, queen: 4})
        expect(prod.velocityAt(0)).to.deep.equal({meat: 6, drone: 20, queen: 0})
        expect(prod.accelerationAt(0)).to.deep.equal({meat: 60, drone: 0, queen: 0})
        expect(prod.countAt(1)).to.deep.equal({meat: 47, drone: 22, queen: 4})
        expect(prod.velocityAt(1)).to.deep.equal({meat: 66, drone: 20, queen: 0})
        expect(prod.accelerationAt(1)).to.deep.equal({meat: 60, drone: 0, queen: 0})
        expect(prod.countAt(2)).to.deep.equal({meat: 143, drone: 42, queen: 4})
        expect(prod.velocityAt(2)).to.deep.equal({meat: 126, drone: 20, queen: 0})
        expect(prod.accelerationAt(2)).to.deep.equal({meat: 60, drone: 0, queen: 0})
    })
    it('tolerates missing keys/vals', () => {
        const prod = new Production({
            a: {},
            b: {c: 1},
            c: {},  // b won't tolerate this missing; unitTypes must define their children
            d: {e: 1},
            e: {},
        }, {
            d: 1,
            f: 1,
        })
        expect(prod.countAt(0)).to.deep.equal({a:0, b:0, c:0, d:1, e: 0})
        expect(prod.countAt(999)).to.deep.equal({a:0, b:0, c:0, d:1, e: 999})
    })
});
