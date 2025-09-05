import { Chance } from 'chance'
import { ConditionalCheckFailedException, DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { sendCustomResourceLambdaResponse } from '../../utils/lambdas'
import { handler } from './initializeHalfsiesDatabase'
import { generateNewBalanceDbItem} from '../../utils/halfsies'

jest.mock('@aws-sdk/client-dynamodb', () => ({
	...jest.requireActual('@aws-sdk/client-dynamodb'),
	DynamoDBClient: jest.fn(() => ({
		send: jest.fn(),
	})),
}))

jest.mock('../../utils/lambdas', () => ({
	...jest.requireActual('../../utils/lambdas'),
	sendCustomResourceLambdaResponse: jest.fn(),
}))


describe('Lambda - Initialize Halfsies Database', () => {
	const chance = new Chance()

	it('Should not initialize the Halfises database anytime when we are not creating the lambda.', async () => {
		const putItemMock = jest.fn().mockReturnValue({
			promise: jest.fn().mockResolvedValue({}),
		})

		await handler({ RequestType: chance.word({ syllables: 4 }) } as any)

		expect(putItemMock).not.toHaveBeenCalled()
	})

	it('Should not initialize the Halfises database anytime when there is already data in the database.', async () => {
		const tableName = chance.word()
		const send = jest.fn().mockRejectedValue(new ConditionalCheckFailedException({} as any))

		jest.mocked(DynamoDBClient).mockImplementation(() => ({
			send,
		}) as any)

		jest.spyOn(console, 'warn').mockImplementation(() => {})

		process.env.balanceTableName = tableName

		await handler({ RequestType: 'Create' } as any)

		// eslint-disable-next-line no-console
		expect(console.warn).toHaveBeenCalledWith(
			'Halfsies balance amount already exists, skipping initialization.',
		)
	})

	it('Should throw an error if there are any issues putting the value in the database.', async () => {
		const tableName = chance.word()
		const error = chance.sentence()
		const send = jest.fn().mockRejectedValue(new Error(error))

		jest.mocked(DynamoDBClient).mockImplementation(() => ({
			send,
		}) as any)

		process.env.balanceTableName = tableName

		await expect(handler({ RequestType: 'Create' } as any))
			.rejects.toThrow(error)
	})

	it('Should initialize the Halfises database with a balance of zero.', async () => {
		const tableName = chance.word()
		const send = jest.fn()

		const event = {
			RequestType: 'Create',
		}

		jest.mocked(DynamoDBClient).mockImplementation(() => ({
			send,
		}) as any)

		process.env.balanceTableName = tableName
		await handler({
			...event,
		} as any)

		expect(send).toHaveBeenCalledWith(expect.objectContaining({
			input: expect.objectContaining({
				TableName: tableName,
				Item: generateNewBalanceDbItem(0),
				ConditionExpression: 'attribute_not_exists(id)',
			}),
		}))
		expect(sendCustomResourceLambdaResponse).toHaveBeenCalledWith(event, true)
	})
})
