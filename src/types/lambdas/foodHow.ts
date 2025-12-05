import { SHOPPING_ITEM_TYPE, SHOPPING_ITEM_STORE } from '../../constants/foodHow/shoppingListItem'

export type ShoppingItemType = typeof SHOPPING_ITEM_TYPE[number];
export type ShoppingItemStore = typeof SHOPPING_ITEM_STORE[number];

export type ShoppingListItem = {
	amount: number,
	name: string,
	store: ShoppingItemStore,
	recipe?: string,
	type: ShoppingItemType,
}
