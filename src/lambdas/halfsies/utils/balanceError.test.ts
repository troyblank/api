import { getBalance } from './balance'

jest.mock('aws-sdk', () => {
	return {
		DynamoDB: {
			DocumentClient: jest.fn(() => ({
				get: (_: any, callback: Function) => callback({ message: 'Something bad happened.' }, { Item: {} }),
			})),
		},
	}
})

describe('Balance util - failure', () => {

	it('should allow fail  when getting a balance', async () => {
		const result = await getBalance()

		expect(result).toStrictEqual({
			data: undefined,
			errorMessage: 'Something bad happened.',
			isError: true,
		})
	})
})
