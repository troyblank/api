import { Chance } from 'chance'
import { RESPONSE_CODE_OK, RESPONSE_CODE_SERVER_ERROR } from '../../constants/responseCodes'
import { mockApiGatewayProxyEvent, mockSavedShoppingListLegendItem, mockShoppingListLegendItem } from '../../mocks'
import { getUserName } from '../utils/user'
import { saveShoppingListLegendItem } from './utils/shoppingListLegend'
import { handler } from './saveShoppingListLegendItem'

jest.mock('../utils/user')
jest.mock('./utils/shoppingListLegend')

describe('Lambda - Save Shopping List Legend Item', () => {
	const chance = new Chance()
	const userName = chance.first()

	beforeEach(() => {
		process.env.shoppingListLegendTableName = chance.word({ syllables: 4 })
		jest.mocked(getUserName).mockReturnValue(userName)
	})

	it('Should save a shopping list legend item.', async () => {
		const savedLegendItem = mockSavedShoppingListLegendItem({
			name: 'Apples',
			emoji: '🍎',
			user: userName,
		})
		jest.mocked(saveShoppingListLegendItem).mockResolvedValue({
			isError: false,
			data: savedLegendItem,
		})

		const result = await handler(mockApiGatewayProxyEvent({
			name: '  Apples  ',
			emoji: ' 🍎 ',
		}) as any)

		expect(saveShoppingListLegendItem).toHaveBeenCalledWith({
			name: 'Apples',
			emoji: '🍎',
		}, userName)
		expect(result).toStrictEqual({
			body: JSON.stringify({ legendItem: savedLegendItem }),
			headers: {
				'Access-Control-Allow-Origin': '',
				'Content-Type': 'application/json',
			},
			statusCode: RESPONSE_CODE_OK,
		})
	})

	it('Should return an error if there is a critical problem when saving a shopping list legend item.', async () => {
		const errorMessage = chance.sentence()
		jest.mocked(saveShoppingListLegendItem).mockRejectedValue(errorMessage)

		const mockedLegendItem = mockShoppingListLegendItem()
		const expectedBody = {
			errorMessage,
		}

		const result = await handler(mockApiGatewayProxyEvent(
			mockedLegendItem,
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

	it('Should return an error if there is a problem when saving a shopping list legend item.', async () => {
		const errorMessage = chance.sentence()
		jest.mocked(saveShoppingListLegendItem).mockResolvedValue({
			isError: true,
			errorMessage,
		})

		const mockedLegendItem = mockShoppingListLegendItem()
		const expectedBody = {
			errorMessage,
		}

		const result = await handler(mockApiGatewayProxyEvent(
			mockedLegendItem,
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

	it('Should return an error when the shopping list legend item is invalid.', async () => {
		jest.mocked(saveShoppingListLegendItem).mockResolvedValue({
			isError: false,
		})

		const mockedLegendItem = mockShoppingListLegendItem({
			name: '',
		})
		const expectedBody = {
			message: 'No valid legend item given to save.',
		}

		const result = await handler(mockApiGatewayProxyEvent(
			mockedLegendItem,
		) as any)

		expect(saveShoppingListLegendItem).not.toHaveBeenCalled()
		expect(result).toStrictEqual({
			body: JSON.stringify(expectedBody),
			headers: {
				'Access-Control-Allow-Origin': '',
				'Content-Type': 'application/json',
			},
			statusCode: RESPONSE_CODE_SERVER_ERROR,
		})
	})

	it('Should return an error when the emoji is not a single emoji.', async () => {
		const result = await handler(mockApiGatewayProxyEvent({
			name: chance.word(),
			emoji: chance.integer(),
		}) as any)

		expect(saveShoppingListLegendItem).not.toHaveBeenCalled()
		expect(JSON.parse(result.body).message).toBe('No valid legend item given to save.')
		expect(result.statusCode).toBe(RESPONSE_CODE_SERVER_ERROR)
	})

	it('Should return an error when saving without a body.', async () => {
		jest.mocked(saveShoppingListLegendItem).mockResolvedValue({
			isError: false,
		})

		const expectedBody = {
			message: 'No valid legend item given to save.',
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
