import { type ShoppingListLegendItem } from '../../types'

const graphemeCount = (value: string): number => Array.from(
	new Intl.Segmenter(undefined, { granularity: 'grapheme' }).segment(value),
).length

const isEmoji = (value: string): boolean =>
	/\p{Extended_Pictographic}/u.test(value) || /\p{Regional_Indicator}/u.test(value)

export const isAShoppingListLegendEmoji = (emoji: any): boolean => {
	if (typeof emoji !== 'string') {
		return false
	}

	const trimmedEmoji = emoji.trim()

	return graphemeCount(trimmedEmoji) === 1 && isEmoji(trimmedEmoji)
}

export const isAShoppingListLegendItem = (legendItem: any): legendItem is ShoppingListLegendItem => {
	const { emoji, name } = legendItem || {}

	return typeof name === 'string' && name.trim().length > 0 && isAShoppingListLegendEmoji(emoji)
}
