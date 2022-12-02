import { handler } from './getBalance'

describe('Lambda - Get Balance', () => {
    it('should return a simple example string', async () => {
        const result = await handler()

        expect(result).toStrictEqual({
            statusCode: 200,
            body: 'Hello from Lambda ts!'
        })
    })
})