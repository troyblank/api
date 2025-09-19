import { SHOPPING_ITEM_TYPE } from '../../constants/foodHow/shoppingListItem'
import { type ShoppingItemType } from '../../types'

export const isAShoppingItemType = (shoppingItemType: any): boolean => {
	return typeof shoppingItemType === 'string' &&
		SHOPPING_ITEM_TYPE.includes(shoppingItemType as ShoppingItemType)
}

export const isAShoppingListItem = (shoppingListItem: any): boolean => {
	return typeof shoppingListItem.amount === 'number' &&
		typeof shoppingListItem.name === 'string' &&
		isAShoppingItemType(shoppingListItem.type)
}


// export type ShoppingItemType = 'meat' | 'perishable' | 'produce' | 'frozen' | 'imperishable' | 'spice' | 'uncommon'
// export type Store =  'Jewel-Osco' | 'Pete\'s' | 'Wild Fork'

// export type ShoppingListItem = {
// 	amount: number,
// 	name: string,
// 	type: ShoppingItemType,
// 	store: Store,	
// }
