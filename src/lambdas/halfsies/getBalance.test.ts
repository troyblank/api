import { Chance } from 'chance'
import { RESPONSE_CODE_OK, RESPONSE_CODE_SERVER_ERROR } from '../../constants'
import { getBalance } from './utils'
import { handler } from './getBalance'

jest.mock('./utils')

describe('Lambda - Get Balance', () => {
	const chance = new Chance()

	it('should return a balance', async () => {
		const balance = chance.integer()
		jest.mocked(getBalance).mockResolvedValue({
			data: balance,
			errorMessage: undefined,
			isError: false,
		})

		const expectedBody = {
			balance,
		}
		const result = await handler()

		expect(result).toStrictEqual({
			statusCode: RESPONSE_CODE_OK,
			body: JSON.stringify(expectedBody),
		})
	})

	it('should return an error if there is problems getting a balance', async () => {
		const errorMessage = chance.sentence()
		jest.mocked(getBalance).mockResolvedValue({
			data: undefined,
			errorMessage: errorMessage,
			isError: true,
		})

		const expectedBody = {
			message: errorMessage,
		}
		const result = await handler()

		expect(result).toStrictEqual({
			statusCode: RESPONSE_CODE_SERVER_ERROR,
			body: JSON.stringify(expectedBody),
		})
	})

	it('should return an error if there is problems using the getting a balance util', async () => {
		const errorMessage = chance.sentence()
		jest.mocked(getBalance).mockRejectedValue(errorMessage)

		const expectedBody = {
			message: errorMessage,
		}
		const result = await handler()

		expect(result).toStrictEqual({
			statusCode: RESPONSE_CODE_SERVER_ERROR,
			body: JSON.stringify(expectedBody),
		})
	})
})
