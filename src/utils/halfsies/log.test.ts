import { Chance } from 'chance'
import { isALog } from './log'

describe('Log util', () => {
	const chance = new Chance()

	it('should determine what is a log', async () => {
		expect(isALog({
			amount: chance.natural(),
			description: chance.sentence(),
		})).toBe(true)
	
		expect(isALog({
			amount: chance.word(),
			description: chance.sentence(),
		})).toBe(false)
	
		expect(isALog(chance.word())).toBe(false)
	})
})
