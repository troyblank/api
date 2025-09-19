import { SHOPPING_ITEM_TYPE } from '../../constants/foodHow/shoppingListItem'

export type ShoppingItemType = typeof SHOPPING_ITEM_TYPE[number];
export type Store =  'Jewel-Osco' | 'Pete\'s' | 'Wild Fork'

export type ShoppingListItem = {
	amount: number,
	name: string,
	type: ShoppingItemType,
	store: Store,	
}
