/* istanbul ignore file */
import { join } from 'path'
import { Construct } from 'constructs'
import { Stack } from 'aws-cdk-lib'
import {
	CognitoUserPoolsAuthorizer,
	LambdaIntegration,
	Resource,
	RestApi,
	EndpointType,
	DomainNameOptions,
	type Authorizer,
} from 'aws-cdk-lib/aws-apigateway'
import { Certificate, ICertificate } from 'aws-cdk-lib/aws-certificatemanager'
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
// 1. Be sure to remove the api DNS records made under your custom domain name on your your domain provider's. (You will have to re-add this if re-deploy - your cert is on us-east-1).
// 2. Be sure to remove all DB tables from DynamoDB associated with this stack.

export class FoodHowStack extends Stack {
	constructor(scope: Construct, id: string, props: FoodHowStackProps) {
		super(scope, id, props)

		const {
			accessControlAllowOrigin,
			customDomainCertificateARN,
			customDomainName,
			resourcePostFix = '',
			userPool,
		} = props

		// ----------------------------------------------------------------------------------------
		// CUSTOM DOMAIN NAME
		// ----------------------------------------------------------------------------------------
		// To get a custom domain working you must
		// 1. Get a Certificate using AWS Certificate Manager (on us-east-1 ONLY) and add a DNS CNAME record from your domain provider.
		// 2. Setup your domain provider's DNS Records CNAME record to add the "API Gateway domain name" with a period at the end (found in API Gateway > Custom domain names) 
		const customDomainCertificate: ICertificate = Certificate.fromCertificateArn(this, 'domainCert', customDomainCertificateARN)
		const customApiDomain: DomainNameOptions = {
			domainName: customDomainName,
			basePath: 'foodhow',
			certificate: customDomainCertificate,
			endpointType: EndpointType.EDGE,
		}

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
			bundling: {
				minify: true,
				sourceMap: false,
			},
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

		api.addDomainName('ApiGatewayDomain', customApiDomain)

		// create shopping list item
		const createShoppingListItemLambdaIntegration: LambdaIntegration = new LambdaIntegration(createShoppingListItem)
		const createShoppingListItemLambdaResource: Resource = api.root.addResource('createShoppingListItem')

		createShoppingListItemLambdaResource.addMethod('POST', createShoppingListItemLambdaIntegration, requiresAuthorization(authorizer))
		shoppingListDb.grantReadWriteData(createShoppingListItem)
		addCorsOptions(createShoppingListItemLambdaResource, accessControlAllowOrigin)
	}
}
