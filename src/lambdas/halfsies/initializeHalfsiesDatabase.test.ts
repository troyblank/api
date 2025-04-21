import { Chance } from 'chance'
import { DynamoDB } from 'aws-sdk'

const putItemMock = jest.fn().mockReturnValue({
	promise: jest.fn().mockResolvedValue({}),
})

const alreadyHasDataPutItemMock = jest.fn().mockReturnValue({
	promise: jest.fn().mockRejectedValue({ code: 'ConditionalCheckFailedException' }),
})

const errorPutItemMock = jest.fn().mockReturnValue({
	promise: jest.fn().mockRejectedValue({ code: '' }),
})

import { handler } from './initializeHalfsiesDatabase'
import { generateNewBalanceDbItem } from '../../utils'

jest.mock('../../utils', () => ({
	...jest.requireActual('../../utils'),
	sendCustomResourceLambdaResponse: jest.fn(),
}))


describe('Lambda - Initialize Halfsies Database', () => {
	const chance = new Chance()

	beforeEach(() => {
		DynamoDB.prototype.putItem = putItemMock
	})

	it('Should not initialize the Halfises database anytime when we are not creating the lambda.', async () => {
		await handler({ RequestType: chance.word({ syllables: 4 }) } as any)

		expect(putItemMock).not.toHaveBeenCalled()
	})

	it('Should not initialize the Halfises database anytime when there is already data in the database.', async () => {
		DynamoDB.prototype.putItem = alreadyHasDataPutItemMock

		jest.spyOn(console, 'warn').mockImplementation(() => {})
		
		const tableName = chance.word()

		process.env.balanceTableName = tableName

		await handler({ RequestType: 'Create' } as any)

		// eslint-disable-next-line no-console
		expect(console.warn).toHaveBeenCalledWith('Halfsies balance amount already exists, skipping initialization.')
	})

	it('Should throw an error if there is any issues putting the value in the database.', async () => {
		DynamoDB.prototype.putItem = errorPutItemMock
		
		const tableName = chance.word()

		process.env.balanceTableName = tableName

		expect(async() => await handler({ RequestType: 'Create' } as any)).toThrowError()
	})

	it('Should initialize the Halfises database with a balance of zero.', async () => {
		const tableName = chance.word()

		process.env.balanceTableName = tableName
		await handler({ RequestType: 'Create' } as any)

		expect(putItemMock).toHaveBeenCalledWith({
			ConditionExpression: 'attribute_not_exists(id)',
			TableName: tableName,
			Item: generateNewBalanceDbItem(0),
		})
	})
})
