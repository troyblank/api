import { SHOPPING_ITEM_TYPE, SHOPPING_ITEM_STORE } from '../../constants/foodHow/shoppingListItem'
import { type ShoppingItemType, type ShoppingItemStore } from '../../types'

export const isAShoppingItemType = (shoppingItemType: any): boolean => {
	return typeof shoppingItemType === 'string' &&
		SHOPPING_ITEM_TYPE.includes(shoppingItemType as ShoppingItemType)
}

export const isAShoppingItemStore = (shoppingItemStore: any): boolean => {
	return typeof shoppingItemStore === 'string' &&
		SHOPPING_ITEM_STORE.includes(shoppingItemStore as ShoppingItemStore)
}

export const isAShoppingListItem = (shoppingListItem: any): boolean => {
	const { amount, name, recipe, type, store } = shoppingListItem || {}

	return (
		typeof amount === 'number' &&
		typeof name === 'string' && name.length > 0 &&
		(recipe === undefined || typeof recipe === 'string') &&
		isAShoppingItemType(type) &&
		isAShoppingItemStore(store)
	)
}
