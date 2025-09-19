import { StackProps } from 'aws-cdk-lib'
import { UserPool } from 'aws-cdk-lib/aws-cognito'

// export type ShoppingItemType = 'meat' | 'perishable' | 'produce' | 'frozen' | 'imperishable' | 'spice' | 'uncommon'
// export type Store =  'Jewel-Osco' | 'Pete\'s' | 'Wild Fork'

// export type ShoppingListItem = {
// 	amount: number,
// 	date: string,
// 	id: number,
// 	name: string,
// 	type: ShoppingItemType,
// 	store: Store,
// 	user: string,	
// }

export interface FoodHowStackProps extends StackProps {
	accessControlAllowOrigin: string,
	customDomainCertificateARN: string,
	customDomainName: string,
	resourcePostFix: string,
	userPool: UserPool
}
