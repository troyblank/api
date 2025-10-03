/* istanbul ignore file */
import { join } from 'path'
import { Construct } from 'constructs'
import { CustomResource, Stack } from 'aws-cdk-lib'
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
import { HalfsiesStackProps } from '../types/stacks/halfsies'
import { requiresAuthorization } from '../utils/auth'
import { createTable } from '../utils/tables'
import { addCorsOptions } from '../utils/apiGateway'

const NODE_VERSION = Runtime.NODEJS_22_X

// ----------------------------------------------------------------------------------------
// WHEN DELETING THIS IN CLOUD FORMATION
// ----------------------------------------------------------------------------------------
// Be sure to remove all DB tables from DynamoDB associated with this stack.

export class HalfsiesStack extends Stack {
	constructor(scope: Construct, id: string, props: HalfsiesStackProps) {
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
			bundling: {
				minify: true,
				sourceMap: false,
			},
			handler: 'handler',
			runtime: NODE_VERSION,
			environment: {
				accessControlAllowOrigin,
				balanceTableName: balanceDb.tableName,
				halfsiesLogTableName: logDb.tableName,
			},
		})

		const getBalance: NodejsFunction = new NodejsFunction(this, 'getBalance', {
			functionName: `halfsiesGetBalance${resourcePostFix}`,
			entry: join(__dirname, '../lambdas', 'halfsies', 'getBalance.ts'),
			bundling: {
				minify: true,
				sourceMap: false,
			},
			handler: 'handler',
			runtime: NODE_VERSION,
			environment: {
				accessControlAllowOrigin,
				balanceTableName: balanceDb.tableName,
			},
		})

		const getLog: NodejsFunction = new NodejsFunction(this, 'getLog', {
			functionName: `halfsiesGetLog${resourcePostFix}`,
			entry: join(__dirname, '../lambdas', 'halfsies', 'getLog.ts'),
			bundling: {
				minify: true,
				sourceMap: false,
			},
			handler: 'handler',
			runtime: NODE_VERSION,
			environment: {
				accessControlAllowOrigin,
				halfsiesLogTableName: logDb.tableName,
			},
		})

		const initializeHalfsiesDatabase: NodejsFunction = new NodejsFunction(this, 'initializeHalfsiesDatabase', {
			functionName: `halfsiesInitializeHalfsiesDatabase${resourcePostFix}`,
			entry: join(__dirname, '../lambdas', 'halfsies', 'initializeHalfsiesDatabase.ts'),
			handler: 'handler',
			runtime: NODE_VERSION,
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
		new BasePathMapping(this, `HalfsiesBasePathMapping${resourcePostFix}`, {
			domainName: apiDomainName,
			restApi: api,
			basePath: 'halfsies',
		})

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
