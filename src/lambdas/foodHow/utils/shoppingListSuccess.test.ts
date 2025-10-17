import { Chance } from 'chance'
import { mockShoppingListItem } from '../../../mocks'
import { deleteShoppingListItems, getShoppingList, saveShoppingListItem } from './shoppingList'

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

describe('Shopping List Util - success', () => {
	const chance = new Chance()

	beforeEach(() => {
		process.env.shoppingListTableName = chance.word({ syllables: 4 })
	})

	it('Should get the shopping list.', async () => {
		const result = await getShoppingList()

		expect(result).toStrictEqual({
			data: [],
			isError: false,
		})
	})

	it('Should save a shopping list item.', async () => {
		expect(async () => await saveShoppingListItem(mockShoppingListItem(), chance.name())).not.toThrow()
	})

	it('Should delete a list of shopping list items.', async () => {
		const keys = chance.unique(chance.integer, chance.integer({ min: 1, max: 100 }))

		expect(async () => await deleteShoppingListItems(keys)).not.toThrow()
	})
})