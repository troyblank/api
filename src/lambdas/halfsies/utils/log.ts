import { AWSError, DynamoDB } from 'aws-sdk'
import { type DatabaseResponse, type NewLog } from '../../../types'

export const saveLog = async (log: NewLog, userName: string): Promise<DatabaseResponse> => new Promise((resolve) => {
	const { halfsiesLogTableName = '' } = process.env
	const { amount, description } = log
	const dynamoDbClient = new DynamoDB.DocumentClient()
	const now: Date = new Date()

	const dbQueryParams: DynamoDB.DocumentClient.PutItemInput = {
		TableName: halfsiesLogTableName,
		Item: {
			amount,
			date: now.toUTCString(),
			description,
			id: now.getTime(),
			user: userName,
		},
	}

	const handleDbReturn = (error: AWSError) => {
		resolve({
			errorMessage: error?.message,
			isError: Boolean(error),
		})
	}

	dynamoDbClient.put(dbQueryParams, handleDbReturn)
})
