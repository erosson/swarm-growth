import _ from 'lodash'

export class Cost {
    constructor(costs) {
        this.costs = costs
    }
    
    // TODO scaling costs
    howMuch(targets) {
        let ret = {}
        for (let target of Object.keys(targets)) {
            let count = targets[target]
            let costs = _.mapValues(this.costs[target], (cost) => cost * count)
            ret = _.mergeWith(ret, costs, (total, cost) => (total || 0) + cost)
        }
        return ret
    }
    
    maxBuyablePerCurrency(banks, targetType) {
        const costs = this.costs[targetType]
        return _.mapValues(costs, (val, costType) => {
            if (val === 0) throw new Error('zero cost?!: '+costType)
            return Math.floor((banks[costType] || 0) / val)
        })
    }
    maxBuyable(banks, targetType) {
        const vals = _.values(this.maxBuyablePerCurrency(banks, targetType))
        if (!vals.length) {
            return null
        }
        return Math.min.apply(Math, vals)
    }
    
    // TODO return an error code
    /**
     * @return true if we can afford the target units using the bank.
     */
    isBuyable(banks, targets) {
        let costs = this.howMuch(targets)
        let ckeys = Object.keys(costs)
        let tkeys = Object.keys(targets)
        // units with no cost at all aren't buyable
        if (ckeys.length == 0 || tkeys.length == 0) {
            return false
        }
        // we have enough of every currency
        for (let type of ckeys) {
            if (costs[type] > (banks[type] || 0)) {
                return false
            }
        }
        // nonnegative buy counts
        for (let type of tkeys) {
            if (targets[type] <= 0) {
                return false
            }
        }
        return costs
    }
    
    /**
     * Buy some target units using banked money.
     * @return a copy of banks with costs deducted and purchased-targets added. Original is not modified.
     */
    buy(banks, targets) {
        banks = Object.assign({}, banks)
        let costs = this.isBuyable(banks, targets)
        if (!costs) {
            throw new Error('target units are not buyable', banks, targets)
        }
        banks = _.mergeWith(banks, costs, (bank, cost) => bank - cost)
        banks = _.mergeWith(banks, targets, (bank, target) => (bank || 0) + target)
        return banks
    }
}