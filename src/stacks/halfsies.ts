/* istanbul ignore file */
import { join } from 'path'
import { Construct } from 'constructs'
import { Stack, StackProps } from 'aws-cdk-lib'
import { Certificate, ICertificate } from 'aws-cdk-lib/aws-certificatemanager'
import { AttributeType, Table } from 'aws-cdk-lib/aws-dynamodb'
import { Runtime } from 'aws-cdk-lib/aws-lambda'
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs'
import { LambdaIntegration, Resource, RestApi, EndpointType, DomainNameOptions } from 'aws-cdk-lib/aws-apigateway'
import { AwsCustomResource, AwsCustomResourcePolicy, PhysicalResourceId } from 'aws-cdk-lib/custom-resources'
import { createTable, generateNewBalanceDbItem } from '../utils'

export class HalfsiesStack extends Stack {
    constructor(scope: Construct, id: string, props?: StackProps) {
        super(scope, id, props)

        // Custom Domain Name
        const API_DOMAIN: string = 'api.troyblank.com'
        const customDomainCertificateARN: string = 'arn:aws:acm:us-east-1:382713793519:certificate/700ed0de-e320-4c84-b377-9984263f610d'
        const customDomainCertificate: ICertificate = Certificate.fromCertificateArn(this, 'domainCert', customDomainCertificateARN)
        const customApiDomain: DomainNameOptions = {
            domainName: API_DOMAIN,
            certificate: customDomainCertificate,
            endpointType: EndpointType.EDGE
        }

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
        const api: RestApi = new RestApi(this, 'halfsiesApi')

        api.addDomainName('ApiGatewayDomain', customApiDomain)

        const getBalanceLambdaIntegration: LambdaIntegration = new LambdaIntegration(getBalance)
        const getBalanceLambdaResource: Resource = api.root.addResource('getBalance')

        getBalanceLambdaResource.addMethod('GET', getBalanceLambdaIntegration)

        // Permissions
        balanceDb.grantReadData(getBalance)
    }
}
