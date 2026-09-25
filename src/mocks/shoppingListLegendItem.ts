import { Chance } from 'chance'
import { type SavedShoppingListLegendItem, type ShoppingListLegendItem } from '../types/lambdas/foodHow'

const chance = new Chance()
const LEGEND_EMOJI = [ '🍎', '🥦', '🥩', '🧂', '🧊', '🇺🇸' ]

export const mockShoppingListLegendItem = (overrides: Partial<ShoppingListLegendItem> = {}): ShoppingListLegendItem => ({
	name: chance.word(),
	emoji: chance.pickone(LEGEND_EMOJI),
	...overrides,
})

export const mockSavedShoppingListLegendItem = (overrides: Partial<SavedShoppingListLegendItem> = {}): SavedShoppingListLegendItem => ({
	...mockShoppingListLegendItem(),
	id: chance.natural(),
	user: chance.first(),
	...overrides,
})

export const mockShoppingListLegend = (minAmount: number = 1): SavedShoppingListLegendItem[] => {
	const amountOfItems: number = chance.natural({ min: minAmount, max: minAmount + 10 })
	const uniqueIDs = chance.unique(chance.natural, amountOfItems)

	return Array.from(Array(amountOfItems)).map(() => mockSavedShoppingListLegendItem({
		id: uniqueIDs.pop(),
	}))
}
