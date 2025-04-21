import { Chance } from 'chance'
import { DynamoDB } from 'aws-sdk'

const putItemMock = jest.fn().mockReturnValue({
	promise: jest.fn().mockResolvedValue({}),
})

DynamoDB.prototype.putItem = putItemMock

import { handler } from './initializeHalfsiesDatabase'
import { generateNewBalanceDbItem } from '../../utils'

describe('Lambda - Initialize Halfsies Database', () => {
	const chance = new Chance()

	it('Should not initialize the Halfises database anytime when we are not creating the database.', async () => {
		await handler({ RequestType: chance.word({ syllables: 4 }) } as any)

		expect(putItemMock).not.toHaveBeenCalled()
	})

	it('Should initialize the Halfises database with a balance of zero.', async () => {
		const tableName = chance.word()

		process.env.balanceTableName = tableName
		await handler({ RequestType: 'Create' } as any)

		expect(putItemMock).toHaveBeenCalledWith({
			TableName: tableName,
			Item: generateNewBalanceDbItem(0),
		})
	})
})
