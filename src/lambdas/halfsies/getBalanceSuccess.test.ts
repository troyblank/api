import { RESPONSE_CODE_OK } from '../../constants'
import { handler } from './getBalance'

jest.mock('aws-sdk', () => {
	return {
		DynamoDB: {
			DocumentClient: jest.fn(() => ({
				get: (_: any, callback: Function) => callback(null, { Item: { balance: 532 } }),
			})),
		},
	}
})

describe('Lambda - Get Balance', () => {

	it('should return a balance', async () => {
		const expectedBody = {
			balance: 532,
		}
		const result = await handler()

		expect(result).toStrictEqual({
			statusCode: RESPONSE_CODE_OK,
			body: JSON.stringify(expectedBody),
		})
	})
})
