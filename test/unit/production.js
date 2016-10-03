import {Production} from '../../src/workspace';

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
});
