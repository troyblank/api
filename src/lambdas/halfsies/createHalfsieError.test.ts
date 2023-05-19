import { RESPONSE_CODE_SERVER_ERROR } from '../../constants'
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
			errorMessage: 'Something bad happened.',
		}
		const result = await handler()

		expect(result).toStrictEqual({
			statusCode: RESPONSE_CODE_SERVER_ERROR,
			body: JSON.stringify(expectedBody),
		})
	})
})
