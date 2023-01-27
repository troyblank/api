import { AWSError, DynamoDB } from 'aws-sdk'
import { APIGatewayProxyResult } from 'aws-lambda'
import {
    HALFSIES_DB_BALANCE_NAME,
    RESPONSE_CODE_OK,
    RESPONSE_CODE_SERVER_ERROR
} from '../../constants'
import { GetItemOutput } from 'aws-sdk/clients/dynamodb'

export const handler = (): Promise<APIGatewayProxyResult> => new Promise((resolve) => {
    const result: APIGatewayProxyResult = {
        statusCode: RESPONSE_CODE_OK,
        body: ''
    }

    const dynamoDbClient = new DynamoDB.DocumentClient()
    const dbQueryParams: DynamoDB.DocumentClient.GetItemInput = {
        TableName: HALFSIES_DB_BALANCE_NAME,
        Key: { id: 0 }
    }

    const handleDbReturn = (error: AWSError, data: GetItemOutput) => {
        let balance: DynamoDB.AttributeValue | undefined
        let errorMessage: string = ''

        if (error) {
            result.statusCode = RESPONSE_CODE_SERVER_ERROR
            errorMessage = error.message
        } else {
            balance = data.Item?.balance
        }

        result.body = JSON.stringify({ errorMessage, balance })
        resolve(result)
    }

    dynamoDbClient.get(dbQueryParams, handleDbReturn)
})
