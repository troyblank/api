import { getBalance } from './balance'

jest.mock('aws-sdk', () => {
	return {
		DynamoDB: {
			DocumentClient: jest.fn(() => ({
				get: (_: any, callback: Function) => callback(null, { Item: { balance: 532 } }),
			})),
		},
	}
})

describe('Balance util - success', () => {

	it('should return a balance', async () => {
		const result = await getBalance()

		expect(result).toStrictEqual({
			data: 532,
			errorMessage: undefined,
			isError: false,
		})
	})
})
