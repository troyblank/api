import { Chance } from 'chance'
import { RESPONSE_CODE_OK, RESPONSE_CODE_SERVER_ERROR } from '../../constants/responseCodes'
import { mockApiGatewayProxyEvent } from '../../mocks/apiGatewayProxyEvent'
import { mockShoppingListItem } from '../../mocks/shoppingListItem'
// import { sortLogs } from '../../utils/halfsies/log'
import { saveShoppingListItem } from './utils/shoppingList'
import { handler } from './createShoppingListItem'

jest.mock('./utils/shoppingList')

describe('Lambda - Create Shopping List Item', () => {
	const chance = new Chance()

	beforeEach(() => {
		process.env.shoppingListTableName = chance.word({ syllables: 4 })
	})

	it('Should create a shopping list item.', async () => {
		jest.mocked(saveShoppingListItem).mockResolvedValue({
			isError: false,
		})

		const mockedShoppingListItem = mockShoppingListItem()
		const expectedBody = { newShoppingListItem: mockedShoppingListItem }

		const result = await handler(mockApiGatewayProxyEvent(
			mockedShoppingListItem,
		) as any)

		expect(result).toStrictEqual({
			body: JSON.stringify(expectedBody),
			headers: {
				'Access-Control-Allow-Origin': '',
				'Content-Type': 'application/json',
			},
			statusCode: RESPONSE_CODE_OK,
		})
	})

	it('Should return an error if there is critical problem when saving a shopping list item.', async () => {
		const errorMessage = chance.sentence()
		jest.mocked(saveShoppingListItem).mockRejectedValue(errorMessage)

		const mockedShoppingListItem = mockShoppingListItem()
		const expectedBody = {
			errorMessage,
		}

		const result = await handler(mockApiGatewayProxyEvent(
			mockedShoppingListItem,
		) as any)

		expect(result).toStrictEqual({
			body: JSON.stringify(expectedBody),
			headers: {
				'Access-Control-Allow-Origin': '',
				'Content-Type': 'application/json',
			},
			statusCode: RESPONSE_CODE_SERVER_ERROR,
		})
	})

	it('Should return an error if there is problem when saving a shopping list item.', async () => {
		const errorMessage = chance.sentence()
		jest.mocked(saveShoppingListItem).mockResolvedValue({
			isError: true,
			errorMessage,
		})

		const mockedShoppingListItem = mockShoppingListItem()
		const expectedBody = {
			errorMessage,
		}

		const result = await handler(mockApiGatewayProxyEvent(
			mockedShoppingListItem,
		) as any)

		expect(result).toStrictEqual({
			body: JSON.stringify(expectedBody),
			headers: {
				'Access-Control-Allow-Origin': '',
				'Content-Type': 'application/json',
			},
			statusCode: RESPONSE_CODE_SERVER_ERROR,
		})
	})

	it('Should return an error when saving a shopping list item if the shopping list item is invalid.', async () => {
		jest.mocked(saveShoppingListItem).mockResolvedValue({
			isError: false,
		})

		const mockedShoppingListItem = mockShoppingListItem({
			name: undefined,
		})
		const expectedBody = {
			message: 'No valid shopping list item given to create.',
		}

		const result = await handler(mockApiGatewayProxyEvent(
			mockedShoppingListItem,
		) as any)

		expect(result).toStrictEqual({
			body: JSON.stringify(expectedBody),
			headers: {
				'Access-Control-Allow-Origin': '',
				'Content-Type': 'application/json',
			},
			statusCode: RESPONSE_CODE_SERVER_ERROR,
		})
	})

	it('Should return an error when saving without a body.', async () => {
		jest.mocked(saveShoppingListItem).mockResolvedValue({
			isError: false,
		})

		const expectedBody = {
			message: 'No valid shopping list item given to create.',
		}

		const result = await handler(mockApiGatewayProxyEvent({}, {
			body: undefined,
		}) as any)

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
