import { Chance } from 'chance'
import { type ShoppingListItem } from '../types/lambdas/foodHow'
import { SHOPPING_ITEM_TYPE, SHOPPING_ITEM_STORE } from '../constants/foodHow/shoppingListItem'

const chance = new Chance()

export const mockShoppingListItem = (overrides: any = {}): ShoppingListItem => ({
	name: chance.word(),
	amount: chance.natural(),
	type: chance.pickone(SHOPPING_ITEM_TYPE),
	store: chance.pickone(SHOPPING_ITEM_STORE),
	...overrides,
})

export const mockShoppingListItems = (minAmount: number = 1): ShoppingListItem[] => {
	const amountOfItems: number = chance.natural({ min: minAmount, max: minAmount + 100})
	const uniqueIDs = chance.unique(chance.natural, amountOfItems)

	return Array.from(Array(amountOfItems)).map(() => mockShoppingListItem({
		id: uniqueIDs.pop(),
	}))
}
