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
		const shoppingListLegendDb: Table = createTable({
			name: `foodHowShoppingListLegend${resourcePostFix}`,
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

		const getShoppingList: NodejsFunction = new NodejsFunction(this, 'getShoppingList', {
			functionName: `foodHowGetShoppingList${resourcePostFix}`,
			entry: join(__dirname, '../lambdas', 'foodHow', 'getShoppingList.ts'),
			handler: 'handler',
			runtime: NODE_VERSION,
			environment: {
				accessControlAllowOrigin,
				shoppingListTableName: shoppingListDb.tableName,
			},
		})

		const deleteShoppingListItems: NodejsFunction = new NodejsFunction(this, 'deleteShoppingListItems', {
			functionName: `foodHowDeleteShoppingListItems${resourcePostFix}`,
			entry: join(__dirname, '../lambdas', 'foodHow', 'deleteShoppingListItems.ts'),
			handler: 'handler',
			runtime: NODE_VERSION,
			environment: {
				accessControlAllowOrigin,
				shoppingListTableName: shoppingListDb.tableName,
			},
		})

		const getShoppingListLegend: NodejsFunction = new NodejsFunction(this, 'getShoppingListLegend', {
			functionName: `foodHowGetShoppingListLegend${resourcePostFix}`,
			entry: join(__dirname, '../lambdas', 'foodHow', 'getShoppingListLegend.ts'),
			handler: 'handler',
			runtime: NODE_VERSION,
			environment: {
				accessControlAllowOrigin,
				shoppingListLegendTableName: shoppingListLegendDb.tableName,
			},
		})

		const saveShoppingListLegendItem: NodejsFunction = new NodejsFunction(this, 'saveShoppingListLegendItem', {
			functionName: `foodHowSaveShoppingListLegendItem${resourcePostFix}`,
			entry: join(__dirname, '../lambdas', 'foodHow', 'saveShoppingListLegendItem.ts'),
			handler: 'handler',
			runtime: NODE_VERSION,
			environment: {
				accessControlAllowOrigin,
				shoppingListLegendTableName: shoppingListLegendDb.tableName,
			},
		})

		const deleteShoppingListLegendItem: NodejsFunction = new NodejsFunction(this, 'deleteShoppingListLegendItem', {
			functionName: `foodHowDeleteShoppingListLegendItem${resourcePostFix}`,
			entry: join(__dirname, '../lambdas', 'foodHow', 'deleteShoppingListLegendItem.ts'),
			handler: 'handler',
			runtime: NODE_VERSION,
			environment: {
				accessControlAllowOrigin,
				shoppingListLegendTableName: shoppingListLegendDb.tableName,
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

		// get shopping list items
		const getShoppingListItemsLambdaIntegration: LambdaIntegration = new LambdaIntegration(getShoppingList)
		const getShoppingListItemsLambdaResource: Resource = api.root.addResource('getShoppingList')

		getShoppingListItemsLambdaResource.addMethod('GET', getShoppingListItemsLambdaIntegration, requiresAuthorization(authorizer))
		shoppingListDb.grantReadWriteData(getShoppingList)
		addCorsOptions(getShoppingListItemsLambdaResource, accessControlAllowOrigin)

		// create shopping list item
		const createShoppingListItemLambdaIntegration: LambdaIntegration = new LambdaIntegration(createShoppingListItem)
		const createShoppingListItemLambdaResource: Resource = api.root.addResource('createShoppingListItem')

		createShoppingListItemLambdaResource.addMethod('POST', createShoppingListItemLambdaIntegration, requiresAuthorization(authorizer))
		shoppingListDb.grantReadWriteData(createShoppingListItem)
		addCorsOptions(createShoppingListItemLambdaResource, accessControlAllowOrigin)

		// delete shopping list items
		const deleteShoppingListItemsLambdaIntegration: LambdaIntegration = new LambdaIntegration(deleteShoppingListItems)
		const deleteShoppingListItemsLambdaResource: Resource = api.root.addResource('deleteShoppingListItems')

		deleteShoppingListItemsLambdaResource.addMethod('DELETE', deleteShoppingListItemsLambdaIntegration, requiresAuthorization(authorizer))
		shoppingListDb.grantReadWriteData(deleteShoppingListItems)
		addCorsOptions(deleteShoppingListItemsLambdaResource, accessControlAllowOrigin)

		// get shopping list legend
		const getShoppingListLegendLambdaIntegration: LambdaIntegration = new LambdaIntegration(getShoppingListLegend)
		const getShoppingListLegendLambdaResource: Resource = api.root.addResource('getShoppingListLegend')

		getShoppingListLegendLambdaResource.addMethod('GET', getShoppingListLegendLambdaIntegration, requiresAuthorization(authorizer))
		shoppingListLegendDb.grantReadWriteData(getShoppingListLegend)
		addCorsOptions(getShoppingListLegendLambdaResource, accessControlAllowOrigin)

		// save shopping list legend item
		const saveShoppingListLegendItemLambdaIntegration: LambdaIntegration = new LambdaIntegration(saveShoppingListLegendItem)
		const saveShoppingListLegendItemLambdaResource: Resource = api.root.addResource('saveShoppingListLegendItem')

		saveShoppingListLegendItemLambdaResource.addMethod('POST', saveShoppingListLegendItemLambdaIntegration, requiresAuthorization(authorizer))
		shoppingListLegendDb.grantReadWriteData(saveShoppingListLegendItem)
		addCorsOptions(saveShoppingListLegendItemLambdaResource, accessControlAllowOrigin)

		// delete one shopping list legend item
		const deleteShoppingListLegendItemLambdaIntegration: LambdaIntegration = new LambdaIntegration(deleteShoppingListLegendItem)
		const deleteShoppingListLegendItemLambdaResource: Resource = api.root.addResource('deleteShoppingListLegendItem')

		deleteShoppingListLegendItemLambdaResource.addMethod('DELETE', deleteShoppingListLegendItemLambdaIntegration, requiresAuthorization(authorizer))
		shoppingListLegendDb.grantReadWriteData(deleteShoppingListLegendItem)
		addCorsOptions(deleteShoppingListLegendItemLambdaResource, accessControlAllowOrigin)
	}
}
