import { RESPONSE_CODE_OK } from '../../constants'
import { handler } from './createHalfsie'

jest.mock('aws-sdk', () => {
	return {
		DynamoDB: {
			DocumentClient: jest.fn(() => ({
				put: (_: any, callback: Function) => callback(null, { Item: { balance: 532 } }),
			})),
		},
	}
})

describe('Lambda - Create Halfsie', () => {

	it('should return a balance', async () => {
		const expectedBody = {}
		const result = await handler()

		expect(result).toStrictEqual({
			statusCode: RESPONSE_CODE_OK,
			body: JSON.stringify(expectedBody),
		})
	})
})
