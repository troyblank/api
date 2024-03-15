import { AWSError, DynamoDB } from 'aws-sdk'
import { GetItemOutput, type DocumentClient } from 'aws-sdk/clients/dynamodb'
import { type DatabaseResponse } from '../../../types'

export const getBalance = async (): Promise<DatabaseResponse> => new Promise((resolve) => {
	const { balanceTableName = '' } = process.env
	const dynamoDbClient = new DynamoDB.DocumentClient()
	const dbQueryParams: DynamoDB.DocumentClient.GetItemInput = {
		TableName: balanceTableName,
		Key: { id: 0 },
	}

	const handleDbReturn = (error: AWSError, data: GetItemOutput) => {
		resolve({
			data: data.Item?.balance,
			errorMessage: error?.message,
			isError: Boolean(error), 
		})
	}

	dynamoDbClient.get(dbQueryParams, handleDbReturn)
})

export const updateBalance = async (newBalance: number): Promise<DatabaseResponse> => new Promise((resolve) => {
	const { balanceTableName = '' } = process.env
	const dynamoDbClient = new DynamoDB.DocumentClient()

	const dbQueryParams = {
		TableName: balanceTableName,
		Key: { id: 0 },
		UpdateExpression: 'set balance = :num',
		ExpressionAttributeValues: {
			':num': newBalance,
		},
		ReturnValues: 'UPDATED_NEW',
	}

	const handleDbReturn = (error: AWSError, data: DocumentClient.UpdateItemOutput) => {
		resolve({
			data: data.Attributes?.balance,
			errorMessage: error?.message,
			isError: Boolean(error), 
		})
	}

	dynamoDbClient.update(dbQueryParams, handleDbReturn)
})
