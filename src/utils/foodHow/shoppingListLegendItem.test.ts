import { Chance } from 'chance'
import { mockShoppingListLegendItem } from '../../mocks'
import { isAShoppingListLegendEmoji, isAShoppingListLegendItem } from './shoppingListLegendItem'

describe('Shopping List Legend Item util', () => {
	const chance = new Chance()

	it('Should accept a single emoji, including multi-codepoint emoji.', () => {
		expect(isAShoppingListLegendEmoji('🍎')).toBe(true)
		expect(isAShoppingListLegendEmoji(' 👍🏽 ')).toBe(true)
		expect(isAShoppingListLegendEmoji('🇺🇸')).toBe(true)
		expect(isAShoppingListLegendEmoji('👨‍👩‍👧')).toBe(true)
	})

	it('Should reject a value that is not one emoji.', () => {
		expect(isAShoppingListLegendEmoji(chance.word())).toBe(false)
		expect(isAShoppingListLegendEmoji('A')).toBe(false)
		expect(isAShoppingListLegendEmoji('🍎🥦')).toBe(false)
		expect(isAShoppingListLegendEmoji('')).toBe(false)
		expect(isAShoppingListLegendEmoji(chance.integer())).toBe(false)
	})

	it('Should determine what is a shopping list legend item.', () => {
		expect(isAShoppingListLegendItem(mockShoppingListLegendItem())).toBe(true)
		expect(isAShoppingListLegendItem({
			...mockShoppingListLegendItem(),
			name: `  ${chance.word()}  `,
		})).toBe(true)
		expect(isAShoppingListLegendItem(undefined)).toBe(false)
		expect(isAShoppingListLegendItem({
			...mockShoppingListLegendItem(),
			name: chance.integer(),
		})).toBe(false)
		expect(isAShoppingListLegendItem({
			...mockShoppingListLegendItem(),
			name: '   ',
		})).toBe(false)
		expect(isAShoppingListLegendItem({
			...mockShoppingListLegendItem(),
			emoji: chance.word(),
		})).toBe(false)
	})
})
