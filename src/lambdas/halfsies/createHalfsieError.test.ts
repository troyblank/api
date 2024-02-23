import { type APIGatewayProxyEvent } from 'aws-lambda'
import { RESPONSE_CODE_SERVER_ERROR } from '../../constants'
import { mockApiGatewayProxyEvent, mockNewLog } from '../../mocks'
import { handler } from './createHalfsie'

jest.mock('aws-sdk', () => {
	return {
		DynamoDB: {
			DocumentClient: jest.fn(() => ({
				put: (_: any, callback: Function) => callback({ message: 'Something bad happened.' }, { Item: {} }),
			})),
		},
	}
})

describe('Lambda - Create Halfsie', () => {

	it('should return an error if something went wrong', async () => {
		const expectedBody = {
			message: 'Something bad happened.',
		}
		const result = await handler(mockApiGatewayProxyEvent(mockNewLog()) as APIGatewayProxyEvent)

		expect(result).toStrictEqual({
			statusCode: RESPONSE_CODE_SERVER_ERROR,
			body: JSON.stringify(expectedBody),
		})
	})

	it('should error out if there is no body', async () => {
		// This will result in an internal error
		// SyntaxError: Unexpected end of JSON input
		expect(async() => handler(mockApiGatewayProxyEvent(
			mockNewLog(),
			{ body: undefined },
		) as APIGatewayProxyEvent)).rejects.toThrow()
	})
})
