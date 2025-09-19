/* istanbul ignore file */
import { join } from 'path'
import { Construct } from 'constructs'
import { Stack } from 'aws-cdk-lib'
import {
	BasePathMapping,
	CognitoUserPoolsAuthorizer,
	LambdaIntegration,
	Resource,
	RestApi,
	type Authorizer,
} from 'aws-cdk-lib/aws-apigateway'
import { AttributeType, Table } from 'aws-cdk-lib/aws-dynamodb'
import { Runtime } from 'aws-cdk-lib/aws-lambda'
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs'
import { FoodHowStackProps } from '../types'
import { requiresAuthorization } from '../utils/auth'
import { createTable } from '../utils/tables'
import { addCorsOptions } from '../utils/apiGateway'

const NODE_VERSION = Runtime.NODEJS_22_X

// ----------------------------------------------------------------------------------------
// WHEN DELETING THIS IN CLOUD FORMATION
// ----------------------------------------------------------------------------------------
// Be sure to remove all DB tables from DynamoDB associated with this stack.

export class FoodHowStack extends Stack {
	constructor(scope: Construct, id: string, props: FoodHowStackProps) {
		super(scope, id, props)

		const {
			accessControlAllowOrigin,
			apiDomainName,
			resourcePostFix = '',
			userPool,
		} = props
		// ----------------------------------------------------------------------------------------
		// DYNAMO DB
		// ----------------------------------------------------------------------------------------
		const shoppingListDb: Table = createTable({
			name: `foodHowShoppingList${resourcePostFix}`,
			primaryKey: 'id',
			stack: this,
			type: AttributeType.NUMBER,
		})
		// ----------------------------------------------------------------------------------------
		// LAMBDAS
		// ----------------------------------------------------------------------------------------		
		const createShoppingListItem: NodejsFunction = new NodejsFunction(this, 'createShoppingListItem', {
			functionName: `foodHowCreateShoppingListItem${resourcePostFix}`,
			entry: join(__dirname, '../lambdas', 'foodHow', 'createShoppingListItem.ts'),
			handler: 'handler',
			runtime: NODE_VERSION,
			environment: {
				accessControlAllowOrigin,
				shoppingListTableName: shoppingListDb.tableName,
			},
		})

		// ----------------------------------------------------------------------------------------
		// AUTHORIZATION
		// ----------------------------------------------------------------------------------------
		const authorizer: Authorizer = new CognitoUserPoolsAuthorizer(this, `foodHowApiAuthorizer${resourcePostFix}`, {
			cognitoUserPools: [ userPool ],
		})

		// ----------------------------------------------------------------------------------------
		// API GATEWAY
		// ----------------------------------------------------------------------------------------
		const api: RestApi = new RestApi(this, `foodHowApi${resourcePostFix}`)
		new BasePathMapping(this, `FoodHowBasePathMapping${resourcePostFix}`, {
			domainName: apiDomainName,
			restApi: api,
			basePath: 'foodhow',
		})

		// create shopping list item
		const createShoppingListItemLambdaIntegration: LambdaIntegration = new LambdaIntegration(createShoppingListItem)
		const createShoppingListItemLambdaResource: Resource = api.root.addResource('createShoppingListItem')

		createShoppingListItemLambdaResource.addMethod('POST', createShoppingListItemLambdaIntegration, requiresAuthorization(authorizer))
		shoppingListDb.grantReadWriteData(createShoppingListItem)
		addCorsOptions(createShoppingListItemLambdaResource, accessControlAllowOrigin)
	}
}
