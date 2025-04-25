import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import {
	DynamoDBDocumentClient,
	GetCommand,
	UpdateCommand,
	type GetCommandInput,
	type UpdateCommandInput,
} from "@aws-sdk/lib-dynamodb"
import { type DatabaseResponse } from '../../../types'

const dynamoDbClient = new DynamoDBClient()

export const getBalance = async (): Promise<DatabaseResponse> => {
	const dynamoDocumentClient = DynamoDBDocumentClient.from(dynamoDbClient)
	const { balanceTableName = '' } = process.env

	const params: GetCommandInput = {
		TableName: balanceTableName,
		Key: { id: 0 },
	}

	try {
		const result = await dynamoDocumentClient.send(new GetCommand(params))

		return {
			isError: false,
			data: result.Item?.balance,
		}
	} catch (error) {
		return {
			isError: true,
			errorMessage: (error as Error).message,
		}
	}
}

export const updateBalance = async (newBalance: number): Promise<DatabaseResponse> => {
	const dynamoDocumentClient = DynamoDBDocumentClient.from(dynamoDbClient)
	const { balanceTableName = '' } = process.env

	const params: UpdateCommandInput = {
		TableName: balanceTableName,
		Key: { id: 0 },
		UpdateExpression: 'set balance = :num',
		ExpressionAttributeValues: {
			':num': newBalance,
		},
		ReturnValues: 'UPDATED_NEW',
	}

	try {
		const result = await dynamoDocumentClient.send(new UpdateCommand(params))

		return {
			isError: false,
			data: result.Attributes?.balance,
			errorMessage: undefined,
		}
	} catch (error) {
		return {
			isError: true,
			errorMessage: (error as Error).message,
		}
	}
}
