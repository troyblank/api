import { Chance } from 'chance'
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb'
import { mockShoppingListLegendItem } from '../../../mocks'
import { deleteShoppingListLegendItem, getShoppingListLegend, saveShoppingListLegendItem } from './shoppingListLegend'

jest.mock('@aws-sdk/client-dynamodb', () => ({
	...jest.requireActual('@aws-sdk/client-dynamodb'),
	DynamoDBClient: jest.fn(() => ({})),
}))

jest.mock('@aws-sdk/lib-dynamodb', () => {
	return {
		...jest.requireActual('@aws-sdk/lib-dynamodb'),
		DynamoDBDocumentClient: {
			from: jest.fn(() => ({
				send: jest.fn().mockResolvedValue({ Items: [] }),
			})),
		},
	}
})

describe('Shopping List Legend Util - success', () => {
	const chance = new Chance()

	beforeEach(() => {
		process.env.shoppingListLegendTableName = chance.word({ syllables: 4 })
	})

	it('Should get the shopping list legend.', async () => {
		const result = await getShoppingListLegend()

		expect(result).toStrictEqual({
			data: [],
			isError: false,
		})
	})

	it('Should get an empty shopping list legend when the table has no items.', async () => {
		jest.mocked(DynamoDBDocumentClient.from).mockReturnValue({
			send: jest.fn().mockResolvedValue({}),
		} as any)

		const result = await getShoppingListLegend()

		expect(result).toStrictEqual({
			data: [],
			isError: false,
		})
	})

	it('Should save a shopping list legend item.', async () => {
		expect(async () => await saveShoppingListLegendItem(mockShoppingListLegendItem(), chance.name())).not.toThrow()
	})

	it('Should delete one shopping list legend item.', async () => {
		expect(async () => await deleteShoppingListLegendItem(chance.natural())).not.toThrow()
	})
})
