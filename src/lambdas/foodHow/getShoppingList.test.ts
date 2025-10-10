import { Chance } from 'chance'
import { RESPONSE_CODE_OK, RESPONSE_CODE_SERVER_ERROR } from '../../constants/responseCodes'
import { mockShoppingListItems } from '../../mocks'
import { getShoppingList } from './utils/shoppingList'
import { handler } from './getShoppingList'

jest.mock('./utils/shoppingList')

describe('Lambda - Get Shopping List', () => {
	const chance = new Chance()

	beforeEach(() => {
		process.env.shoppingListTableName = chance.word({ syllables: 4 })
	})

	it('should return a shopping list', async () => {
		const shoppingList = mockShoppingListItems()
		jest.mocked(getShoppingList).mockResolvedValue({
			data: shoppingList,
			errorMessage: undefined,
			isError: false,
		})

		const expectedBody = {
			shoppingList,
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

	it('should return an error if there is problems getting a shopping list', async () => {
		const errorMessage = chance.sentence()
		jest.mocked(getShoppingList).mockResolvedValue({
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

	it('should return an error if there is problems using the getting a shopping list util', async () => {
		const errorMessage = chance.sentence()
		jest.mocked(getShoppingList).mockRejectedValue(errorMessage)

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
