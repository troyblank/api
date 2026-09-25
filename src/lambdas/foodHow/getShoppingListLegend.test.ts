import { Chance } from 'chance'
import { RESPONSE_CODE_OK, RESPONSE_CODE_SERVER_ERROR } from '../../constants/responseCodes'
import { mockShoppingListLegend } from '../../mocks'
import { getShoppingListLegend } from './utils/shoppingListLegend'
import { handler } from './getShoppingListLegend'

jest.mock('./utils/shoppingListLegend')

describe('Lambda - Get Shopping List Legend', () => {
	const chance = new Chance()

	beforeEach(() => {
		process.env.shoppingListLegendTableName = chance.word({ syllables: 4 })
	})

	it('Should return the shopping list legend.', async () => {
		const legend = mockShoppingListLegend()
		jest.mocked(getShoppingListLegend).mockResolvedValue({
			data: legend,
			errorMessage: undefined,
			isError: false,
		})

		const expectedBody = {
			legend,
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

	it('Should return an empty shopping list legend when nothing has been saved.', async () => {
		jest.mocked(getShoppingListLegend).mockResolvedValue({
			data: [],
			errorMessage: undefined,
			isError: false,
		})

		const result = await handler()

		expect(result).toStrictEqual({
			body: JSON.stringify({ legend: [] }),
			headers: {
				'Access-Control-Allow-Origin': '',
				'Content-Type': 'application/json',
			},
			statusCode: RESPONSE_CODE_OK,
		})
	})

	it('Should return an error if there is a problem getting the shopping list legend.', async () => {
		const errorMessage = chance.sentence()
		jest.mocked(getShoppingListLegend).mockResolvedValue({
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

	it('Should return an error if there is a critical problem getting the shopping list legend.', async () => {
		const errorMessage = chance.sentence()
		jest.mocked(getShoppingListLegend).mockRejectedValue(errorMessage)

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
