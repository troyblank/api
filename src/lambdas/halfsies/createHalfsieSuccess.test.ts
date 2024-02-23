import { type APIGatewayProxyEvent } from 'aws-lambda'
import { RESPONSE_CODE_OK } from '../../constants'
import { mockApiGatewayProxyEvent, mockNewLog } from '../../mocks'
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

	it('should return a success', async () => {
		const expectedBody = { message: 'Successfully created a halfsie.'}
		const result = await handler(mockApiGatewayProxyEvent(mockNewLog()) as APIGatewayProxyEvent)

		expect(result).toStrictEqual({
			statusCode: RESPONSE_CODE_OK,
			body: JSON.stringify(expectedBody),
		})
	})
})
