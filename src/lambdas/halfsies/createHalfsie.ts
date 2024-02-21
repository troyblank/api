import { AWSError, DynamoDB } from 'aws-sdk'
import { APIGatewayProxyResult } from 'aws-lambda'
import { type NewLog } from '../../types'
import { RESPONSE_CODE_OK, RESPONSE_CODE_SERVER_ERROR } from '../../constants'

export const handler = (newLog: NewLog): Promise<APIGatewayProxyResult> => new Promise((resolve) => {
	const { amount, description } = newLog

	const result: APIGatewayProxyResult = {
		statusCode: RESPONSE_CODE_OK,
		body: JSON.stringify({ message: 'Successfully created a halfsie' }),
	}

	const dynamoDbClient = new DynamoDB.DocumentClient()
	const dbQueryParams: DynamoDB.DocumentClient.PutItemInput = {
		TableName: process.env.halfsiesLogTableName ?? '',
		Item: {
			user: 'troy',
			log: {
				amount,
				date: new Date().toUTCString(),
				description,
			},
		},
	}

	const handleDbReturn = (error: AWSError) => {
		let message: string | undefined

		if (error) {
			result.statusCode = RESPONSE_CODE_SERVER_ERROR
			message = error.message
		}

		result.body = JSON.stringify({ message })
		resolve(result)
	}

	dynamoDbClient.put(dbQueryParams, handleDbReturn)
})
