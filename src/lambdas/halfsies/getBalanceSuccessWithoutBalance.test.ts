import { RESPONSE_CODE_OK } from '../../constants'
import { handler } from './getBalance'

jest.mock('aws-sdk', () => {
    return {
        DynamoDB: {
            DocumentClient: jest.fn(() => ({
                get: (_: any, callback: Function) => callback(null, { Item: {} })
            }))
        }
    }
})

describe('Lambda - Get Balance', () => {

    it('should return a simple example string', async () => {
        const expectedBody = {
            errorMessage: ''
        }
        const result = await handler()

        expect(result).toStrictEqual({
            statusCode: RESPONSE_CODE_OK,
            body: JSON.stringify(expectedBody)
        })
    })
})
