import { Chance } from 'chance'
import { RESPONSE_CODE_OK, RESPONSE_CODE_SERVER_ERROR } from '../../constants/responseCodes'
import { mockApiGatewayProxyEvent } from '../../mocks/apiGatewayProxyEvent'
import { deleteShoppingListItems } from './utils/shoppingList'
import { handler } from './deleteShoppingListItems'

jest.mock('./utils/shoppingList')

describe('Lambda - Delete Shopping List Items', () => {
	const chance = new Chance()

	beforeEach(() => {
		process.env.shoppingListTableName = chance.word({ syllables: 4 })
	})

	it('Should successfully delete shopping list items.', async () => {
		jest.mocked(deleteShoppingListItems).mockResolvedValue({
			isError: false,
		})

		const itemIdsToDelete = [123, 456, 789]
		const expectedBody = { message: 'Items were deleted successfully.' }

		const result = await handler(mockApiGatewayProxyEvent(itemIdsToDelete) as any)

		expect(deleteShoppingListItems).toHaveBeenCalledWith(itemIdsToDelete)
		expect(result).toStrictEqual({
			body: JSON.stringify(expectedBody),
			headers: {
				'Access-Control-Allow-Origin': '',
				'Content-Type': 'application/json',
			},
			statusCode: RESPONSE_CODE_OK,
		})
	})

	it('Should handle deletion of empty array.', async () => {
		jest.mocked(deleteShoppingListItems).mockResolvedValue({
			isError: false,
		})

		const itemIdsToDelete: number[] = []
		const expectedBody = { message: 'Items were deleted successfully.' }

		const result = await handler(mockApiGatewayProxyEvent(itemIdsToDelete) as any)

		expect(deleteShoppingListItems).toHaveBeenCalledWith(itemIdsToDelete)
		expect(result).toStrictEqual({
			body: JSON.stringify(expectedBody),
			headers: {
				'Access-Control-Allow-Origin': '',
				'Content-Type': 'application/json',
			},
			statusCode: RESPONSE_CODE_OK,
		})
	})

	it('Should return an error if there is a critical problem when deleting shopping list items.', async () => {
		const errorMessage = chance.sentence()
		jest.mocked(deleteShoppingListItems).mockRejectedValue(errorMessage)

		const itemIdsToDelete = [123, 456]
		const expectedBody = { message: errorMessage }

		const result = await handler(mockApiGatewayProxyEvent(itemIdsToDelete) as any)

		expect(deleteShoppingListItems).toHaveBeenCalledWith(itemIdsToDelete)
		expect(result).toStrictEqual({
			body: JSON.stringify(expectedBody),
			headers: {
				'Access-Control-Allow-Origin': '',
				'Content-Type': 'application/json',
			},
			statusCode: RESPONSE_CODE_SERVER_ERROR,
		})
	})

	it('Should return an error if there is a problem when deleting shopping list items.', async () => {
		const errorMessage = chance.sentence()
		jest.mocked(deleteShoppingListItems).mockResolvedValue({
			isError: true,
			errorMessage,
		})

		const itemIdsToDelete = [123, 456]
		const expectedBody = { message: errorMessage }

		const result = await handler(mockApiGatewayProxyEvent(itemIdsToDelete) as any)

		expect(deleteShoppingListItems).toHaveBeenCalledWith(itemIdsToDelete)
		expect(result).toStrictEqual({
			body: JSON.stringify(expectedBody),
			headers: {
				'Access-Control-Allow-Origin': '',
				'Content-Type': 'application/json',
			},
			statusCode: RESPONSE_CODE_SERVER_ERROR,
		})
	})

	it('Should handle missing body by defaulting to empty array.', async () => {
		jest.mocked(deleteShoppingListItems).mockResolvedValue({
			isError: false,
		})

		const expectedBody = { message: 'Items were deleted successfully.' }

		const result = await handler(mockApiGatewayProxyEvent({}, {
			body: undefined,
		}) as any)

		expect(deleteShoppingListItems).toHaveBeenCalledWith([])
		expect(result).toStrictEqual({
			body: JSON.stringify(expectedBody),
			headers: {
				'Access-Control-Allow-Origin': '',
				'Content-Type': 'application/json',
			},
			statusCode: RESPONSE_CODE_OK,
		})
	})

	it('Should return an error for invalid JSON body.', async () => {
		const expectedBody = { message: 'Invalid JSON in request body.' }

		const result = await handler(mockApiGatewayProxyEvent({}, {
			body: 'invalid json',
		}) as any)

		expect(deleteShoppingListItems).not.toHaveBeenCalled()
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
