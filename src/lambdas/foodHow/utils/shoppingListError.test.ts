import { Chance } from 'chance'
import { mockShoppingListItem } from '../../../mocks'
import { saveShoppingListItem } from './shoppingList'

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

describe('Shopping List Util - failure', () => {
	const chance = new Chance()

	beforeEach(() => {
		process.env.shoppingListTableName = chance.word({ syllables: 4 })
	})

	it('Should allow fail when saving a shopping list item.', async () => {
		const result = await saveShoppingListItem(mockShoppingListItem(), chance.name())

		expect(result).toStrictEqual({
			errorMessage: 'Something bad happened.',
			isError: true,
		})
	})
})
