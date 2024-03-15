import { Chance } from 'chance'
import { getBalance, updateBalance } from './balance'

jest.mock('aws-sdk', () => {
	return {
		DynamoDB: {
			DocumentClient: jest.fn(() => ({
				get: (_: any, callback: Function) => callback(null, { Item: { balance: 532 } }),
				update: (_: any, callback: Function) => callback(null, { Attributes: { balance: 624 } }),
			})),
		},
	}
})

describe('Balance util - success', () => {
	const chance = new Chance()

	it('should return a balance', async () => {
		const result = await getBalance()

		expect(result).toStrictEqual({
			data: 532,
			errorMessage: undefined,
			isError: false,
		})
	})

	it('should update a balance', async () => {
		const result = await updateBalance(chance.natural())

		expect(result).toStrictEqual({
			data: 624,
			errorMessage: undefined,
			isError: false,
		})
	})
})
