import { AWSError, DynamoDB } from 'aws-sdk'
import { APIGatewayProxyResult } from 'aws-lambda'
import { RESPONSE_CODE_OK, RESPONSE_CODE_SERVER_ERROR } from '../../constants'
import { GetItemOutput } from 'aws-sdk/clients/dynamodb'

export const handler = (): Promise<APIGatewayProxyResult> => new Promise((resolve) => {
	const result: APIGatewayProxyResult = {
		statusCode: RESPONSE_CODE_OK,
		body: JSON.stringify({ message: 'Invalid state.', balance: 0 }),
	}

	const dynamoDbClient = new DynamoDB.DocumentClient()
	const dbQueryParams: DynamoDB.DocumentClient.GetItemInput = {
		TableName: process.env.balanceTableName ?? '',
		Key: { id: 0 },
	}

	const handleDbReturn = (error: AWSError, data: GetItemOutput) => {
		let balance: DynamoDB.AttributeValue | undefined
		let message: string | undefined

		if (error) {
			result.statusCode = RESPONSE_CODE_SERVER_ERROR
			message = error.message
		} else {
			balance = data.Item?.balance
		}

		result.body = JSON.stringify({ message, balance })
		resolve(result)
	}

	dynamoDbClient.get(dbQueryParams, handleDbReturn)
})
