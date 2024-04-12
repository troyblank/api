import { Chance } from 'chance'
import { MAIN_USER_NAME } from '../../../config'
import { HalfsieLog } from '../../types'
import { mockApiGatewayProxyEvent, mockHalfsieLogs, mockNewLog } from '../../mocks'
import { RESPONSE_CODE_OK, RESPONSE_CODE_SERVER_ERROR } from '../../constants'
import * as utils from '../../utils'
import {
	getBalance,
	getUserName,
	saveLog,
	updateBalance,
} from './utils'
import { handler } from './createHalfsie'

jest.mock('../../utils', () => {
	return {
		__esModule: true,
		...jest.requireActual('../../utils'),
	}
})
jest.mock('./utils')

describe('Lambda - Create Halfsie', () => {
	const chance = new Chance()
	const currentBalance = chance.integer({ min: -500, max: 500 })
	const newLogs: HalfsieLog[] = mockHalfsieLogs()

	beforeEach(() => {
		jest.mocked(getBalance).mockResolvedValue({
			data: currentBalance,
			isError: false,
			errorMessage: undefined,
		})

		jest.mocked(saveLog).mockResolvedValue({
			errorMessage: undefined,
			isError: false,
		})

		jest.mocked(updateBalance).mockResolvedValue({
			data: new Chance(),
			isError: false,
			errorMessage: undefined,
		})

		jest.spyOn(utils, 'pruneLogs').mockResolvedValue({
			data: newLogs,
			isError: false,
			errorMessage: undefined,
		})

		jest.mocked(getUserName).mockReturnValue(chance.word({ length: 10 }))
	})

	it('should create a halfsie as a main user', async () => {
		jest.mocked(getUserName).mockReturnValue(MAIN_USER_NAME)

		const newLog = mockNewLog()
		const newBalance = chance.integer({ min: -500, max: 500 })

		jest.mocked(updateBalance).mockResolvedValue({
			data: newBalance,
			isError: false,
			errorMessage: undefined,
		})

		const result = await handler(mockApiGatewayProxyEvent(
			newLog,
		) as any)

		expect(updateBalance).toHaveBeenCalledWith(currentBalance + newLog.amount)
		expect(result).toStrictEqual({
			body: JSON.stringify(
				{
					newBalance,
					newLog,
					newLogs,
				},
			),
			headers: {
				'Access-Control-Allow-Origin': '',
				'Content-Type': 'application/json',
			},
			statusCode: RESPONSE_CODE_OK,
		})
	})

	it('should create a halfsie not as the main user', async () => {
		jest.mocked(getUserName).mockReturnValue(MAIN_USER_NAME)

		const newLog = mockNewLog()
		const newBalance = chance.integer({ min: -500, max: 500 })

		jest.mocked(updateBalance).mockResolvedValue({
			data: newBalance,
			isError: false,
			errorMessage: undefined,
		})

		const result = await handler(mockApiGatewayProxyEvent(
			newLog,
		) as any)

		expect(updateBalance).toHaveBeenCalledWith(currentBalance + newLog.amount)
		expect(result).toStrictEqual({
			body: JSON.stringify(
				{
					newBalance,
					newLog,
					newLogs,
				},
			),
			headers: {
				'Access-Control-Allow-Origin': '',
				'Content-Type': 'application/json',
			},
			statusCode: RESPONSE_CODE_OK,
		})
	})

	it('should return an error if there is no log passed in', async () => {
		const errorMessage = chance.sentence()

		jest.mocked(saveLog).mockResolvedValue({
			errorMessage,
			isError: true,
		})

		const result = await handler(mockApiGatewayProxyEvent(
			undefined,
		) as any)

		expect(result).toStrictEqual({
			body: JSON.stringify({ message: 'No log given to create.' }),
			headers: {
				'Access-Control-Allow-Origin': '',
				'Content-Type': 'application/json',
			},
			statusCode: RESPONSE_CODE_SERVER_ERROR,
		})
	})

	it('should return an error if there is a problem getting the balance', async () => {
		const errorMessage = chance.sentence()

		jest.mocked(getBalance).mockRejectedValue(errorMessage)

		const result = await handler(mockApiGatewayProxyEvent(
			mockNewLog(),
		) as any)

		expect(result).toStrictEqual({
			body: JSON.stringify({ message: errorMessage }),
			headers: {
				'Access-Control-Allow-Origin': '',
				'Content-Type': 'application/json',
			},
			statusCode: RESPONSE_CODE_SERVER_ERROR,
		})
	})

	it('should return an error if there is a problem using the saving a log util', async () => {
		const errorMessage = chance.sentence()

		jest.mocked(saveLog).mockRejectedValue(errorMessage)

		const result = await handler(mockApiGatewayProxyEvent(
			mockNewLog(),
		) as any)

		expect(result).toStrictEqual({
			body: JSON.stringify({ message: errorMessage }),
			headers: {
				'Access-Control-Allow-Origin': '',
				'Content-Type': 'application/json',
			},
			statusCode: RESPONSE_CODE_SERVER_ERROR,
		})
	})

	it('should return an error if there is a problem saving a log', async () => {
		const errorMessage = chance.sentence()

		jest.mocked(saveLog).mockResolvedValue({
			errorMessage,
			isError: true,
		})

		const result = await handler(mockApiGatewayProxyEvent(
			mockNewLog(),
		) as any)

		expect(result).toStrictEqual({
			body: JSON.stringify({ message: errorMessage }),
			headers: {
				'Access-Control-Allow-Origin': '',
				'Content-Type': 'application/json',
			},
			statusCode: RESPONSE_CODE_SERVER_ERROR,
		})
	})

	it('should return an error if there is a problem using the update balance util', async () => {
		const errorMessage = chance.sentence()

		jest.mocked(updateBalance).mockRejectedValue(errorMessage)

		const result = await handler(mockApiGatewayProxyEvent(
			mockNewLog(),
		) as any)

		expect(result).toStrictEqual({
			body: JSON.stringify({ message: errorMessage }),
			headers: {
				'Access-Control-Allow-Origin': '',
				'Content-Type': 'application/json',
			},
			statusCode: RESPONSE_CODE_SERVER_ERROR,
		})
	})

	it('should return an error if there is a problem updating the balance', async () => {
		const errorMessage = chance.sentence()

		jest.mocked(updateBalance).mockResolvedValue({
			errorMessage,
			isError: true,
		})

		const result = await handler(mockApiGatewayProxyEvent(
			mockNewLog(),
		) as any)

		expect(result).toStrictEqual({
			body: JSON.stringify({ message: errorMessage }),
			headers: {
				'Access-Control-Allow-Origin': '',
				'Content-Type': 'application/json',
			},
			statusCode: RESPONSE_CODE_SERVER_ERROR,
		})
	})

	it('should return an error if there is a problem using the prune logs util', async () => {
		const errorMessage = chance.sentence()

		jest.spyOn(utils, 'pruneLogs').mockRejectedValue(errorMessage)

		const result = await handler(mockApiGatewayProxyEvent(
			mockNewLog(),
		) as any)

		expect(result).toStrictEqual({
			body: JSON.stringify({ message: errorMessage }),
			headers: {
				'Access-Control-Allow-Origin': '',
				'Content-Type': 'application/json',
			},
			statusCode: RESPONSE_CODE_SERVER_ERROR,
		})
	})

	it('should return an error if there is a problem pruning the logs', async () => {
		const errorMessage = chance.sentence()

		jest.spyOn(utils, 'pruneLogs').mockResolvedValue({
			errorMessage,
			isError: true,
		})

		const result = await handler(mockApiGatewayProxyEvent(
			mockNewLog(),
		) as any)

		expect(result).toStrictEqual({
			body: JSON.stringify({ message: errorMessage }),
			headers: {
				'Access-Control-Allow-Origin': '',
				'Content-Type': 'application/json',
			},
			statusCode: RESPONSE_CODE_SERVER_ERROR,
		})
	})
})
