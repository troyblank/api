import { Chance } from 'chance'
import { RESPONSE_CODE_OK, RESPONSE_CODE_SERVER_ERROR } from '../../constants'
import { mockHalfsieLog } from '../../mocks'
import { getLog } from './utils'
import { handler } from './getLog'

jest.mock('./utils')

describe('Lambda - Get Log', () => {
	const chance = new Chance()

	it('should return a log', async () => {
		const log = [
			mockHalfsieLog(),
			mockHalfsieLog(),
			mockHalfsieLog(),
		]
		jest.mocked(getLog).mockResolvedValue({
			data: log,
			errorMessage: undefined,
			isError: false,
		})

		const expectedBody = {
			log,
		}
		const result = await handler()

		expect(result).toStrictEqual({
			body: JSON.stringify(expectedBody),
			headers: {
				'Access-Control-Allow-Origin': '',
				'Content-Type': 'application/json',
			},
			statusCode: RESPONSE_CODE_OK,
		})
	})

	it('should return an error if there is problems getting a log', async () => {
		const errorMessage = chance.sentence()
		jest.mocked(getLog).mockResolvedValue({
			data: undefined,
			errorMessage: errorMessage,
			isError: true,
		})

		const expectedBody = {
			message: errorMessage,
		}
		const result = await handler()

		expect(result).toStrictEqual({
			body: JSON.stringify(expectedBody),
			headers: {
				'Access-Control-Allow-Origin': '',
				'Content-Type': 'application/json',
			},
			statusCode: RESPONSE_CODE_SERVER_ERROR,
		})
	})

	it('should return an error if there is problems using the getting a log util', async () => {
		const errorMessage = chance.sentence()
		jest.mocked(getLog).mockRejectedValue(errorMessage)

		const expectedBody = {
			message: errorMessage,
		}
		const result = await handler()

		expect(result).toStrictEqual({
			body: JSON.stringify(expectedBody),
			headers: {
				'Access-Control-Allow-Origin': '',
				'Content-Type': 'application/json',
			},
			statusCode: RESPONSE_CODE_SERVER_ERROR,
		})
	})
})
