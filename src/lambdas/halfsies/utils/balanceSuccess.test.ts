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
			from: jest.fn(() => ({
				send: jest.fn((command) => {
					if (command.constructor.name === 'GetCommand') {
						return Promise.resolve({ Item: { balance: 532 } })
					}
					if (command.constructor.name === 'UpdateCommand') {
						return Promise.resolve({ Attributes: { balance: 624 } })
					}
					return Promise.resolve({})
				}),
			})),
		},
	}
})	

describe('Balance util - success', () => {
	const chance = new Chance()

	beforeEach(() => {
		process.env.balanceTableName = chance.word({ syllables: 4 })
	})

	it('should return a balance', async () => {
		const result = await getBalance()

		expect(result).toStrictEqual({
			data: 532,
			isError: false,
		})
	})

	it('should update a balance', async () => {
		const result = await updateBalance(chance.natural())

		expect(result).toStrictEqual({
			data: 624,
			isError: false,
		})
	})
})
