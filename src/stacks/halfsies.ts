/* istanbul ignore file */
import { join } from 'path'
import { Construct } from 'constructs'
import { CustomResource, Stack } from 'aws-cdk-lib'
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
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs'
import { HALFSIES_NODE_VERSION } from '../../config'
import { HalfsiesStackProps } from '../types'
import { addCorsOptions, createTable, requiresAuthorization } from '../utils'

// ----------------------------------------------------------------------------------------
// WHEN DELETING THIS IN CLOUD FORMATION
// ----------------------------------------------------------------------------------------
// 1. Be sure to remove the api DNS records made under your custom domain name on your your domain provider's. (You will have to re-add this if re-deploy - your cert is on us-east-1).
// 2. Be sure to remove all DB tables from DynamoDB associated with this stack.

export class HalfsiesStack extends Stack {
	constructor(scope: Construct, id: string, props: HalfsiesStackProps) {
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
			basePath: 'halfsies',
			certificate: customDomainCertificate,
			endpointType: EndpointType.EDGE,
		}

		// ----------------------------------------------------------------------------------------
		// DYNAMO DB
		// ----------------------------------------------------------------------------------------
		const balanceDb: Table = createTable({
			name: `halfsiesBalance${resourcePostFix}`,
			primaryKey: 'id',
			stack: this,
			type: AttributeType.NUMBER,
		})

		const logDb = createTable({
			name: `halfsiesLog${resourcePostFix}`,
			primaryKey: 'id',
			stack: this,
			type: AttributeType.NUMBER,
		})
		// ----------------------------------------------------------------------------------------
		// LAMBDAS
		// ----------------------------------------------------------------------------------------		
		const createHalfsie: NodejsFunction = new NodejsFunction(this, 'createHalfsie', {
			functionName: `halfsiesCreateHalfsie${resourcePostFix}`,
			entry: join(__dirname, '../lambdas', 'halfsies', 'createHalfsie.ts'),
			handler: 'handler',
			runtime: HALFSIES_NODE_VERSION,
			environment: {
				accessControlAllowOrigin,
				balanceTableName: balanceDb.tableName,
				halfsiesLogTableName: logDb.tableName,
			},
		})

		const getBalance: NodejsFunction = new NodejsFunction(this, 'getBalance', {
			functionName: `halfsiesGetBalance${resourcePostFix}`,
			entry: join(__dirname, '../lambdas', 'halfsies', 'getBalance.ts'),
			handler: 'handler',
			runtime: HALFSIES_NODE_VERSION,
			environment: {
				accessControlAllowOrigin,
				balanceTableName: balanceDb.tableName,
			},
		})

		const getLog: NodejsFunction = new NodejsFunction(this, 'getLog', {
			functionName: `halfsiesGetLog${resourcePostFix}`,
			entry: join(__dirname, '../lambdas', 'halfsies', 'getLog.ts'),
			handler: 'handler',
			runtime: HALFSIES_NODE_VERSION,
			environment: {
				accessControlAllowOrigin,
				halfsiesLogTableName: logDb.tableName,
			},
		})

		const initializeHalfsiesDatabase: NodejsFunction = new NodejsFunction(this, 'initializeHalfsiesDatabase', {
			functionName: `halfsiesInitializeHalfsiesDatabase${resourcePostFix}`,
			entry: join(__dirname, '../lambdas', 'halfsies', 'initializeHalfsiesDatabase.ts'),
			handler: 'handler',
			runtime: HALFSIES_NODE_VERSION,
			environment: {
				balanceTableName: balanceDb.tableName,
			},
		})
		// ----------------------------------------------------------------------------------------
		// AUTHORIZATION
		// ----------------------------------------------------------------------------------------
		const authorizer: Authorizer = new CognitoUserPoolsAuthorizer(this, `halfsiesApiAuthorizer${resourcePostFix}`, {
			cognitoUserPools: [ userPool ],
		})

		// ----------------------------------------------------------------------------------------
		// API GATEWAY
		// ----------------------------------------------------------------------------------------
		const api: RestApi = new RestApi(this, `halfsiesApi${resourcePostFix}`)

		api.addDomainName('ApiGatewayDomain', customApiDomain)

		// create halfsie
		const createHalfsieLambdaIntegration: LambdaIntegration = new LambdaIntegration(createHalfsie)
		const createHalfsieLambdaResource: Resource = api.root.addResource('createHalfsie')

		createHalfsieLambdaResource.addMethod('POST', createHalfsieLambdaIntegration, requiresAuthorization(authorizer))
		balanceDb.grantReadWriteData(createHalfsie)
		logDb.grantReadWriteData(createHalfsie)
		addCorsOptions(createHalfsieLambdaResource, accessControlAllowOrigin)

		// getBalance
		const getBalanceLambdaIntegration: LambdaIntegration = new LambdaIntegration(getBalance)
		const getBalanceLambdaResource: Resource = api.root.addResource('getBalance')

		getBalanceLambdaResource.addMethod('GET', getBalanceLambdaIntegration, requiresAuthorization(authorizer))
		balanceDb.grantReadData(getBalance)
		addCorsOptions(getBalanceLambdaResource, accessControlAllowOrigin)

		// getLog
		const getLogLambdaIntegration: LambdaIntegration = new LambdaIntegration(getLog)
		const getLogLambdaResource: Resource = api.root.addResource('getLog')

		getLogLambdaResource.addMethod('GET', getLogLambdaIntegration, requiresAuthorization(authorizer))
		logDb.grantReadData(getLog)
		addCorsOptions(getLogLambdaResource, accessControlAllowOrigin)

		// initialize halfsies database
		balanceDb.grantWriteData(initializeHalfsiesDatabase)

		// ----------------------------------------------------------------------------------------
		// CUSTOM RESOURCES
		// ---------------------------------------------------------------------------------------
		new CustomResource(this, `initializeHalfsiesDatabase${resourcePostFix}`, {
			serviceToken: initializeHalfsiesDatabase.functionArn,
		})
	}
}
