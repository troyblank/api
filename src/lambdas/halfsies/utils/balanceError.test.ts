import { Chance } from 'chance'
import { getBalance, updateBalance } from './balance'

jest.mock('@aws-sdk/client-dynamodb', () => ({
	...jest.requireActual('@aws-sdk/client-dynamodb'),
	DynamoDBClient: jest.fn(() => ({
		send: jest.fn(),
	})),
}))

jest.mock('@aws-sdk/lib-dynamodb', () => {
	return {
		...jest.requireActual('@aws-sdk/lib-dynamodb'),
		DynamoDBDocumentClient: {
			from: jest.fn().mockReturnValue({
				send: jest.fn().mockRejectedValue(new Error('Something bad happened.')),
			}),
		},
	}
})

describe('Balance util - failure', () => {
	const chance = new Chance()

	beforeEach(() => {
		process.env.balanceTableName = chance.word({ syllables: 4 })
	})

	it('should allow fail when getting a balance', async () => {
		const result = await getBalance()

		expect(result).toStrictEqual({
			errorMessage: 'Something bad happened.',
			isError: true,
		})
	})

	it('should allow fail when updating a balance', async () => {
		const result = await updateBalance(chance.natural())

		expect(result).toStrictEqual({
			errorMessage: 'Something bad happened.',
			isError: true,
		})
	})
})
