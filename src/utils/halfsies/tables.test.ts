import { Chance } from 'chance'
import { NewBalanceDbItemType } from '../../types'
import { generateNewBalanceDbItem } from './tables'

describe('Tables Util', () => {
    const chance = new Chance()

    it('should return a simple example string', async () => {
        const newBalance: number = chance.natural()
        const newBalanceItem: NewBalanceDbItemType = generateNewBalanceDbItem(newBalance)

        expect(newBalanceItem).toStrictEqual({
            id: { N: '0' },
            balance: { N: newBalance.toString() }
        })
    })
})