import { RESPONSE_CODE_SERVER_ERROR } from '../../constants'
import { handler } from './getBalance'

jest.mock('aws-sdk', () => {
    return {
        DynamoDB: {
            DocumentClient: jest.fn(() => ({
                get: (_: any, callback: Function) => callback({ message: 'Something bad happened.' }, { Item: {} })
            }))
        }
    }
})

describe('Lambda - Get Balance', () => {

    it('should return a simple example string', async () => {
        const expectedBody = {
            errorMessage: 'Something bad happened.'
        }
        const result = await handler()

        expect(result).toStrictEqual({
            statusCode: RESPONSE_CODE_SERVER_ERROR,
            body: JSON.stringify(expectedBody)
        })
    })
})
