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
import { AwsCustomResource, AwsCustomResourcePolicy, PhysicalResourceId } from 'aws-cdk-lib/custom-resources'
import { HalfsiesStackProps } from '../types'
import { createTable, generateNewBalanceDbItem, requiresAuthorization } from '../utils'

// ----------------------------------------------------------------------------------------
// WHEN DELETING THIS IN CLOUD FORMATION
// ----------------------------------------------------------------------------------------
// 1. Be sure to remove any DNS records made under your custom domain name on your your domain provider's. (You will have to re-add this if re-deploy - your cert is on us-east-1).
// 2. Be sure to remove all DB tables from DynamoDB associated with this stack.

export class HalfsiesStack extends Stack {
	constructor(scope: Construct, id: string, props: HalfsiesStackProps) {
		super(scope, id, props)

		const { blankFamilyUserPool } = props

		// ----------------------------------------------------------------------------------------
		// CUSTOM DOMAIN NAME
		// ----------------------------------------------------------------------------------------
		// To get a custom domain working you must
		// 1. Get a Certificate using AWS Certificate Manager (on us-east-1 ONLY) and add a DNS CNAME record from your domain provider.
		// 2. Setup your domain provider's DNS Records CNAME record to add the "API Gateway domain name" with a period at the end (found in API Gateway > Custom domain names) 
		const customDomainCertificateARN: string = 'arn:aws:acm:us-east-1:382713793519:certificate/700ed0de-e320-4c84-b377-9984263f610d'
		const customDomainCertificate: ICertificate = Certificate.fromCertificateArn(this, 'domainCert', customDomainCertificateARN)
		const customApiDomain: DomainNameOptions = {
			domainName: 'api.troyblank.com',
			basePath: 'halfsies',
			certificate: customDomainCertificate,
			endpointType: EndpointType.EDGE,
		}

		// ----------------------------------------------------------------------------------------
		// DYNAMO DB
		// ----------------------------------------------------------------------------------------
		const balanceDb: Table = createTable({
			name: 'halfsiesBalance',
			primaryKey: 'id',
			stack: this,
			type: AttributeType.NUMBER,
		})

		const logDb = createTable({
			name: 'halfsiesLog',
			primaryKey: 'id',
			stack: this,
			type: AttributeType.NUMBER,
		})

		// Initial DB data
		new AwsCustomResource(this, 'halfsiesBalanceInitData', {
			onCreate: {
				service: 'DynamoDB',
				action: 'putItem',
				parameters: {
					TableName: balanceDb.tableName,
					Item: generateNewBalanceDbItem(0),
				},
				physicalResourceId: PhysicalResourceId.of('initDBData'),
			},
			policy: AwsCustomResourcePolicy.fromSdkCalls({
				resources: AwsCustomResourcePolicy.ANY_RESOURCE,
			}),
		})

		// ----------------------------------------------------------------------------------------
		// LAMBDAS
		// ----------------------------------------------------------------------------------------
		const getBalance: NodejsFunction = new NodejsFunction(this, 'getBalance', {
			functionName: 'halfsiesGetBalance',
			entry: join(__dirname, '../lambdas', 'halfsies', 'getBalance.ts'),
			handler: 'handler',
			runtime: Runtime.NODEJS_18_X,
			environment: {
				balanceTableName: balanceDb.tableName,
			},
		})

		const createHalfsie: NodejsFunction = new NodejsFunction(this, 'createHalfsie', {
			functionName: 'halfsiesCreateHalfsie',
			entry: join(__dirname, '../lambdas', 'halfsies', 'createHalfsie.ts'),
			handler: 'handler',
			runtime: Runtime.NODEJS_18_X,
			environment: {
				balanceTableName: balanceDb.tableName,
				halfsiesLogTableName: logDb.tableName,
			},
		})

		// ----------------------------------------------------------------------------------------
		// AUTHORIZATION
		// ----------------------------------------------------------------------------------------
		const authorizer: Authorizer = new CognitoUserPoolsAuthorizer(this, 'apiAuthorizer', {
			cognitoUserPools: [ blankFamilyUserPool ],
		})

		// ----------------------------------------------------------------------------------------
		// API GATEWAY
		// ----------------------------------------------------------------------------------------
		const api: RestApi = new RestApi(this, 'halfsiesApi')

		api.addDomainName('ApiGatewayDomain', customApiDomain)

		// getBalance
		const getBalanceLambdaIntegration: LambdaIntegration = new LambdaIntegration(getBalance)
		const getBalanceLambdaResource: Resource = api.root.addResource('getBalance')

		getBalanceLambdaResource.addMethod('GET', getBalanceLambdaIntegration, requiresAuthorization(authorizer))
		balanceDb.grantReadData(getBalance)

		// create halfsie
		const createHalfsieLambdaIntegration: LambdaIntegration = new LambdaIntegration(createHalfsie)
		const createHalfsieLambdaResource: Resource = api.root.addResource('createHalfsie')

		createHalfsieLambdaResource.addMethod('POST', createHalfsieLambdaIntegration, requiresAuthorization(authorizer))
		balanceDb.grantReadWriteData(createHalfsie)
		logDb.grantReadWriteData(createHalfsie)
	}
}
