import { Chance } from 'chance'
import { mockApiGatewayProxyEvent, mockNewLog } from '../../mocks'
import { RESPONSE_CODE_OK, RESPONSE_CODE_SERVER_ERROR } from '../../constants'
import { saveLog } from './utils'
import { handler } from './createHalfsie'

jest.mock('./utils')

describe('Lambda - Create Halfsie', () => {
	const chance = new Chance()

	it('should create a halfsie', async () => {
		jest.mocked(saveLog).mockResolvedValue({
			errorMessage: undefined,
			isError: false,
		})

		const result = await handler(mockApiGatewayProxyEvent(
			JSON.stringify(mockNewLog()),
		) as any)

		expect(result).toStrictEqual({
			statusCode: RESPONSE_CODE_OK,
			body: '{}',
		})
	})

	it('should return an error if there is a problem creating a halfsie', async () => {
		const errorMessage = chance.sentence()

		jest.mocked(saveLog).mockResolvedValue({
			errorMessage,
			isError: true,
		})

		const result = await handler(mockApiGatewayProxyEvent(
			undefined,
		) as any)

		expect(result).toStrictEqual({
			statusCode: RESPONSE_CODE_SERVER_ERROR,
			body: JSON.stringify({ message: errorMessage }),
		})
	})

	it('should return an error if there is a problem using the save log util', async () => {
		const errorMessage = chance.sentence()

		jest.mocked(saveLog).mockRejectedValue(errorMessage)

		const result = await handler(mockApiGatewayProxyEvent(
			JSON.stringify(mockNewLog()),
		) as any)

		expect(result).toStrictEqual({
			statusCode: RESPONSE_CODE_SERVER_ERROR,
			body: JSON.stringify({ message: errorMessage }),
		})
	})
})
