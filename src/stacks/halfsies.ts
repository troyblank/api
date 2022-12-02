/* istanbul ignore file */
import { join } from 'path'
import { Construct } from 'constructs'
import { Stack, StackProps } from 'aws-cdk-lib'
import { AttributeType } from 'aws-cdk-lib/aws-dynamodb'
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs'
import { LambdaIntegration, Resource, RestApi } from 'aws-cdk-lib/aws-apigateway'
import { createTable } from '../utils'

export class HalfsiesStack extends Stack {
    constructor(scope: Construct, id: string, props?: StackProps) {
        super(scope, id, props)

        // Dynamo DB
        createTable({
            name: 'halfsies_cdk',
            primaryKey: 'id',
            stack: this,
            type: AttributeType.NUMBER
        })

        // Lambdas
        const getBalance = new NodejsFunction(this, 'getBalance', {
            entry: join(__dirname, '../lambdas', 'halfsies', 'getBalance', 'getBalance.ts'),
            handler: 'handler'
        })

        // API Gateway
        const api = new RestApi(this, 'halfsiesApi')

        const getBalanceLambdaIntegration: LambdaIntegration = new LambdaIntegration(getBalance)
        const getBalanceLambdaResource: Resource = api.root.addResource('getBalance')

        getBalanceLambdaResource.addMethod('GET', getBalanceLambdaIntegration)
    }
}
