import { AWSError, DynamoDB } from 'aws-sdk'
import { APIGatewayProxyResult } from 'aws-lambda'
import { RESPONSE_CODE_OK, RESPONSE_CODE_SERVER_ERROR } from '../../constants'

export const handler = (): Promise<APIGatewayProxyResult> => new Promise((resolve) => {
	const result: APIGatewayProxyResult = {
		statusCode: RESPONSE_CODE_OK,
		body: JSON.stringify({ errorMessage: 'Invalid data.' }),
	}

	const dynamoDbClient = new DynamoDB.DocumentClient()
	const dbQueryParams: DynamoDB.DocumentClient.PutItemInput = {
		TableName: process.env.halfsiesLogTableName ?? '',
		Item: {
			user: 'troy',
			log: {
				amount: 0,
				date: new Date().toUTCString(),
				description: 'just a test',
			},
		},
	}

	const handleDbReturn = (error: AWSError) => {
		let errorMessage: string | undefined

		if (error) {
			result.statusCode = RESPONSE_CODE_SERVER_ERROR
			errorMessage = error.message
		}

		result.body = JSON.stringify({ errorMessage })
		resolve(result)
	}

	dynamoDbClient.put(dbQueryParams, handleDbReturn)
})
