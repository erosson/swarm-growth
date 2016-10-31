import {Cost} from '../../src/cost'

describe('cost', () => {
    it('calcs howMuch', () => {
        const cost = new Cost({
            meat: {},
            larva: {},
            drone: {meat:10, larva:1},
            nest: {drone:10, larva:1},
        })
        expect(cost.howMuch({drone: 1})).to.eql({meat:10, larva: 1})
        expect(cost.howMuch({drone: 1, nest: 1})).to.eql({meat:10, drone: 10, larva: 2})
        expect(cost.howMuch({drone: 5})).to.eql({meat:50, larva: 5})
        expect(cost.howMuch({drone: 2, nest: 3})).to.eql({meat:20, drone: 30, larva: 5})
    })
    
    it('isBuyable or not', () => {
        const cost = new Cost({
            meat: {},
            larva: {},
            drone: {meat:10, larva:1},
            nest: {drone:10, larva:1},
        })
        const bank = {
            larva: 10,
            meat: 90,
        }
        expect(cost.isBuyable(bank, {drone: 1})).to.be.ok
        expect(cost.isBuyable(bank, {drone: 9})).to.be.ok
        expect(cost.isBuyable(bank, {drone: 10})).to.not.be.ok
        expect(cost.isBuyable(bank, {nest: 1})).to.not.be.ok
        // errors return false, not throw
        expect(cost.isBuyable(bank, {meat: 1})).to.not.be.ok
        expect(cost.isBuyable(bank, {nest: -1})).to.not.be.ok
        expect(cost.isBuyable(bank, {drone: 0})).to.not.be.ok
        expect(cost.isBuyable(bank, {})).to.not.be.ok
    })
    
    it('calcs max cost', () => {
        const cost = new Cost({
            meat: {},
            larva: {},
            drone: {meat:10, larva:1},
            nest: {drone:10, larva:1},
        })
        const bank = {
            larva: 10,
            meat: 99,
        }
        expect(cost.maxBuyable(bank, 'meat')).to.be.null
        expect(cost.maxBuyable(bank, 'drone')).to.equal(9.9)
        expect(cost.maxBuyable(bank, 'nest')).to.equal(0)
    })
    
    it('buys', () => {
        const cost = new Cost({
            meat: {},
            larva: {},
            drone: {meat:10, larva:1},
            nest: {drone:10, larva:1},
        })
        const bank = {
            meat: 90,
            larva: 10,
        }
        expect(cost.buy(bank, {drone: 1})).to.eql({larva:9, meat: 80, drone: 1})
        expect(cost.buy(bank, {drone: 3})).to.eql({larva:7, meat: 60, drone: 3})
        expect(cost.buy(bank, {drone: 9})).to.eql({larva:1, meat: 0, drone: 9})
        // can't afford
        expect(() => cost.buy(bank, {drone: 10})).to.throw(Error)
        expect(() => cost.buy(bank, {nest: 1})).to.throw(Error)
        // errors
        expect(() => cost.buy(bank, {meat: 1})).to.throw(Error)
        expect(() => cost.buy(bank, {drone: -1})).to.throw(Error)
        expect(() => cost.buy(bank, {drone: 0})).to.throw(Error)
        expect(() => cost.buy(bank, {})).to.throw(Error)
    })
})