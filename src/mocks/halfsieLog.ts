import { Chance } from 'chance'
import { type HalfsieLog } from '../types'

const chance = new Chance()

export const mockHalfsieLog = (overrides: any = {}): HalfsieLog => ({
	amount: chance.floating({ fixed: 2 }),
	user: chance.first(),
	date: chance.date().toISOString(),
	description: chance.sentence(),
	id: chance.natural(),
	...overrides,
})

export const mockHalfsieLogs = (minAmount: number = 1): HalfsieLog[] => {
	const amountOfLogs: number = chance.natural({ min: minAmount, max: minAmount + 100})
	const uniqueIDs = chance.unique(chance.natural, amountOfLogs)


	return Array.from(Array(amountOfLogs)).map(() => mockHalfsieLog({
		id: uniqueIDs.pop(),
	}))
}
