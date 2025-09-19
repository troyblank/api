import { Chance } from 'chance'
import { mockShoppingListItem } from '../../mocks'
import { SHOPPING_ITEM_TYPE, SHOPPING_ITEM_STORE } from '../../constants/foodHow/shoppingListItem'
import {
	isAShoppingListItem,
	isAShoppingItemType,
	isAShoppingItemStore,
} from './shoppingListItem'

describe('Shopping List util', () => {
	const chance = new Chance()

	it('Should determine what is a shopping list item type.', async () => {
		expect(isAShoppingItemType(chance.pickone(SHOPPING_ITEM_TYPE))).toBe(true)
		expect(isAShoppingItemType(chance.word({ syllables: 5 }))).toBe(false)
	})

	it('Should determine what is a shopping list item store.', async () => {
		expect(isAShoppingItemStore(chance.pickone(SHOPPING_ITEM_STORE))).toBe(true)
		expect(isAShoppingItemStore(chance.word({ syllables: 5 }))).toBe(false)
	})

	it('Should determine what is a shopping list item.', async () => {
		expect(isAShoppingListItem(mockShoppingListItem())).toBe(true)
		expect(isAShoppingListItem(undefined)).toBe(false)
		expect(isAShoppingListItem({
			...mockShoppingListItem(),
			amount: chance.word({ syllables: 5 }),
		})).toBe(false)	
		expect(isAShoppingListItem({
			...mockShoppingListItem(),
			name: chance.integer(),
		})).toBe(false)
		expect(isAShoppingListItem({
			...mockShoppingListItem(),
			name: '',
		})).toBe(false)
		expect(isAShoppingListItem({
			...mockShoppingListItem(),
			type: chance.word({ syllables: 5 }),
		})).toBe(false)
		expect(isAShoppingListItem({
			...mockShoppingListItem(),
			store: chance.word({ syllables: 5 }),
		})).toBe(false)
	})
})
