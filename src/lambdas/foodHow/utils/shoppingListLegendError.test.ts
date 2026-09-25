import { Chance } from 'chance'
import { mockShoppingListLegendItem } from '../../../mocks'
import { deleteShoppingListLegendItem, getShoppingListLegend, saveShoppingListLegendItem } from './shoppingListLegend'

jest.mock('@aws-sdk/client-dynamodb', () => {
	return {
		...jest.requireActual('@aws-sdk/client-dynamodb'),
		DynamoDBClient: jest.fn(() => ({
			send: jest.fn().mockRejectedValue(new Error('Something bad happened.')),
		})),
	}
})

jest.mock('@aws-sdk/lib-dynamodb', () => {
	return {
		...jest.requireActual('@aws-sdk/lib-dynamodb'),
		DynamoDBDocumentClient: {
			from: jest.fn(() => ({
				send: jest.fn().mockRejectedValue(new Error('Something bad happened.')),
			})),
		},
	}
})

describe('Shopping List Legend Util - failure', () => {
	const chance = new Chance()

	beforeEach(() => {
		process.env.shoppingListLegendTableName = chance.word({ syllables: 4 })
	})

	it('Should return an error when getting the shopping list legend fails.', async () => {
		const result = await getShoppingListLegend()

		expect(result).toStrictEqual({
			errorMessage: 'Something bad happened.',
			isError: true,
		})
	})

	it('Should return an error when saving a shopping list legend item fails.', async () => {
		const result = await saveShoppingListLegendItem(mockShoppingListLegendItem(), chance.name())

		expect(result).toStrictEqual({
			errorMessage: 'Something bad happened.',
			isError: true,
		})
	})

	it('Should return an error when deleting a shopping list legend item fails.', async () => {
		const result = await deleteShoppingListLegendItem(chance.natural())

		expect(result).toStrictEqual({
			errorMessage: 'Something bad happened.',
			isError: true,
		})
	})
})
