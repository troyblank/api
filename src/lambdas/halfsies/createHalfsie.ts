import { AWSError, DynamoDB } from 'aws-sdk'
import { type APIGatewayProxyEvent, type APIGatewayProxyResult } from 'aws-lambda'
import { type NewLog } from '../../types'
import { parseJwt } from '../../utils'
import { RESPONSE_CODE_OK, RESPONSE_CODE_SERVER_ERROR } from '../../constants'

export const handler = ({ body, headers }: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => new Promise((resolve) => {
	const { amount, description }: NewLog = JSON.parse(body || '')
	const user: string = parseJwt(headers?.Authorization?.split(' ')[1])['cognito:username']
	const { halfsiesLogTableName = '' } = process.env
	let message: string | undefined = 'Successfully created a halfsie.'

	const result: APIGatewayProxyResult = {
		statusCode: RESPONSE_CODE_OK,
		body: JSON.stringify({ message }),
	}

	const dynamoDbClient = new DynamoDB.DocumentClient()
	const now: Date = new Date()
	const dbQueryParams: DynamoDB.DocumentClient.PutItemInput = {
		TableName: halfsiesLogTableName,
		Item: {
			amount,
			date: now.toUTCString(),
			description,
			id: now.getTime(),
			user,
		},
	}

	const handleDbReturn = (error: AWSError) => {
		if (error) {
			result.statusCode = RESPONSE_CODE_SERVER_ERROR
			message = `${error.message}`
		}

		result.body = JSON.stringify({ message })
		resolve(result)
	}

	dynamoDbClient.put(dbQueryParams, handleDbReturn)
})
