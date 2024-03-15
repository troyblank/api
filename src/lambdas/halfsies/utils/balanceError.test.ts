import { Chance } from 'chance'
import { getBalance, updateBalance } from './balance'

jest.mock('aws-sdk', () => {
	return {
		DynamoDB: {
			DocumentClient: jest.fn(() => ({
				get: (_: any, callback: Function) => callback({ message: 'Something bad happened.' }, { Item: {} }),
				update: (_: any, callback: Function) => callback({ message: 'Something bad happened.' }, { Item: {} }),
			})),
		},
	}
})

describe('Balance util - failure', () => {
	const chance = new Chance()

	it('should allow fail when getting a balance', async () => {
		const result = await getBalance()

		expect(result).toStrictEqual({
			data: undefined,
			errorMessage: 'Something bad happened.',
			isError: true,
		})
	})

	it('should allow fail when updating a balance', async () => {
		const result = await updateBalance(chance.natural())

		expect(result).toStrictEqual({
			data: undefined,
			errorMessage: 'Something bad happened.',
			isError: true,
		})
	})
})
