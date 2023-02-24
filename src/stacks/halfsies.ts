/* istanbul ignore file */
import { join } from 'path'
import { Construct } from 'constructs'
import { Stack, StackProps } from 'aws-cdk-lib'
import { AttributeType, Table } from 'aws-cdk-lib/aws-dynamodb'
import { Runtime } from 'aws-cdk-lib/aws-lambda'
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs'
import { LambdaIntegration, Resource, RestApi } from 'aws-cdk-lib/aws-apigateway'
import { AwsCustomResource, AwsCustomResourcePolicy, PhysicalResourceId } from 'aws-cdk-lib/custom-resources'
import { createTable, generateNewBalanceDbItem } from '../utils'

export class HalfsiesStack extends Stack {
    constructor(scope: Construct, id: string, props?: StackProps) {
        super(scope, id, props)

        // Dynamo DB
        const balanceDb: Table = createTable({
            name: 'halfsiesBalance',
            primaryKey: 'id',
            stack: this,
            type: AttributeType.NUMBER
        })

        // INITIAL DB DATA
        new AwsCustomResource(this, 'halfsiesBalanceInitData', {
            onCreate: {
                service: 'DynamoDB',
                action: 'putItem',
                parameters: {
                    TableName: balanceDb.tableName,
                    Item: generateNewBalanceDbItem(0)
                },
                physicalResourceId: PhysicalResourceId.of('initDBData')
            },
            policy: AwsCustomResourcePolicy.fromSdkCalls({
                resources: AwsCustomResourcePolicy.ANY_RESOURCE
            })
        })

        // Lambdas
        const getBalance: NodejsFunction = new NodejsFunction(this, 'getBalance', {
            functionName: 'halfsiesGetBalance',
            entry: join(__dirname, '../lambdas', 'halfsies', 'getBalance.ts'),
            handler: 'handler',
            runtime: Runtime.NODEJS_18_X,
            environment: {
                balanceTableName: balanceDb.tableName
            }
        })

        // API Gateway
        const api = new RestApi(this, 'halfsiesApi')

        const getBalanceLambdaIntegration: LambdaIntegration = new LambdaIntegration(getBalance)
        const getBalanceLambdaResource: Resource = api.root.addResource('getBalance')

        getBalanceLambdaResource.addMethod('GET', getBalanceLambdaIntegration)

        // Permissions
        balanceDb.grantReadData(getBalance)
    }
}
