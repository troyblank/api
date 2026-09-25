import { Chance } from 'chance'
import { RESPONSE_CODE_OK, RESPONSE_CODE_SERVER_ERROR } from '../../constants/responseCodes'
import { mockApiGatewayProxyEvent } from '../../mocks/apiGatewayProxyEvent'
import { deleteShoppingListLegendItem } from './utils/shoppingListLegend'
import { handler } from './deleteShoppingListLegendItem'

jest.mock('./utils/shoppingListLegend')

describe('Lambda - Delete Shopping List Legend Item', () => {
	const chance = new Chance()

	beforeEach(() => {
		process.env.shoppingListLegendTableName = chance.word({ syllables: 4 })
	})

	it('Should successfully delete one shopping list legend item.', async () => {
		jest.mocked(deleteShoppingListLegendItem).mockResolvedValue({
			isError: false,
		})

		const itemId = chance.natural()
		const expectedBody = { message: 'Shopping list legend item was deleted successfully.' }

		const result = await handler(mockApiGatewayProxyEvent(itemId) as any)

		expect(deleteShoppingListLegendItem).toHaveBeenCalledWith(itemId)
		expect(result).toStrictEqual({
			body: JSON.stringify(expectedBody),
			headers: {
				'Access-Control-Allow-Origin': '',
				'Content-Type': 'application/json',
			},
			statusCode: RESPONSE_CODE_OK,
		})
	})

	it('Should return an error if there is a critical problem when deleting a shopping list legend item.', async () => {
		const errorMessage = chance.sentence()
		jest.mocked(deleteShoppingListLegendItem).mockRejectedValue(errorMessage)

		const itemId = chance.natural()
		const expectedBody = { message: errorMessage }

		const result = await handler(mockApiGatewayProxyEvent(itemId) as any)

		expect(deleteShoppingListLegendItem).toHaveBeenCalledWith(itemId)
		expect(result).toStrictEqual({
			body: JSON.stringify(expectedBody),
			headers: {
				'Access-Control-Allow-Origin': '',
				'Content-Type': 'application/json',
			},
			statusCode: RESPONSE_CODE_SERVER_ERROR,
		})
	})

	it('Should return an error if there is a problem when deleting a shopping list legend item.', async () => {
		const errorMessage = chance.sentence()
		jest.mocked(deleteShoppingListLegendItem).mockResolvedValue({
			isError: true,
			errorMessage,
		})

		const itemId = chance.natural()
		const expectedBody = { message: errorMessage }

		const result = await handler(mockApiGatewayProxyEvent(itemId) as any)

		expect(deleteShoppingListLegendItem).toHaveBeenCalledWith(itemId)
		expect(result).toStrictEqual({
			body: JSON.stringify(expectedBody),
			headers: {
				'Access-Control-Allow-Origin': '',
				'Content-Type': 'application/json',
			},
			statusCode: RESPONSE_CODE_SERVER_ERROR,
		})
	})

	it('Should return an error when the id is not an integer.', async () => {
		const result = await handler(mockApiGatewayProxyEvent(1.5) as any)

		expect(deleteShoppingListLegendItem).not.toHaveBeenCalled()
		expect(result).toStrictEqual({
			body: JSON.stringify({ message: 'No valid shopping list legend item id given to delete.' }),
			headers: {
				'Access-Control-Allow-Origin': '',
				'Content-Type': 'application/json',
			},
			statusCode: RESPONSE_CODE_SERVER_ERROR,
		})
	})

	it('Should return an error when more than one id is given.', async () => {
		const result = await handler(mockApiGatewayProxyEvent([ chance.natural(), chance.natural() ]) as any)

		expect(deleteShoppingListLegendItem).not.toHaveBeenCalled()
		expect(JSON.parse(result.body).message).toBe('No valid shopping list legend item id given to delete.')
		expect(result.statusCode).toBe(RESPONSE_CODE_SERVER_ERROR)
	})

	it('Should return an error for invalid JSON body.', async () => {
		const expectedBody = { message: 'Invalid JSON in request body.' }

		const result = await handler(mockApiGatewayProxyEvent({}, {
			body: 'invalid json',
		}) as any)

		expect(deleteShoppingListLegendItem).not.toHaveBeenCalled()
		expect(result).toStrictEqual({
			body: JSON.stringify(expectedBody),
			headers: {
				'Access-Control-Allow-Origin': '',
				'Content-Type': 'application/json',
			},
			statusCode: RESPONSE_CODE_SERVER_ERROR,
		})
	})

	it('Should return an error when the body is missing.', async () => {
		const result = await handler(mockApiGatewayProxyEvent({}, {
			body: undefined,
		}) as any)

		expect(deleteShoppingListLegendItem).not.toHaveBeenCalled()
		expect(JSON.parse(result.body).message).toBe('Invalid JSON in request body.')
		expect(result.statusCode).toBe(RESPONSE_CODE_SERVER_ERROR)
	})
})
