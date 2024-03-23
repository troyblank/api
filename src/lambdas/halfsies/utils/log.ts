import { AWSError, DynamoDB } from 'aws-sdk'
import { type ScanOutput } from 'aws-sdk/clients/dynamodb'
import { type DatabaseResponse, type NewLog } from '../../../types'

export const getLogs = async (): Promise<DatabaseResponse> => new Promise((resolve) => {
	const { halfsiesLogTableName = '' } = process.env
	const dynamoDbClient = new DynamoDB.DocumentClient()

	const handleDbReturn = (error: AWSError, data: ScanOutput) => {
		resolve({
			data: data.Items,
			errorMessage: error?.message,
			isError: Boolean(error), 
		})
	}

	dynamoDbClient.scan({ TableName: halfsiesLogTableName },  handleDbReturn)
})

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

export const deleteLog = async (id: number): Promise<DatabaseResponse> => new Promise((resolve) => {
	const { halfsiesLogTableName = '' } = process.env
	const dynamoDbClient = new DynamoDB.DocumentClient()

	const dbQueryParams: DynamoDB.DocumentClient.DeleteItemInput = {
		TableName: halfsiesLogTableName,
		Key: { id },
	}

	const handleDbReturn = (error: AWSError) => {
		resolve({
			errorMessage: error?.message,
			isError: Boolean(error),
		})
	}

	dynamoDbClient.delete(dbQueryParams, handleDbReturn)
})
