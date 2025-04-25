import {
	DeleteItemCommand,
	DeleteItemCommandInput,
	DynamoDBClient,
} from '@aws-sdk/client-dynamodb'
import {
	DynamoDBDocumentClient,
	PutCommand,
	ScanCommand,
	type ScanCommandOutput,
} from "@aws-sdk/lib-dynamodb"
import { marshall } from '@aws-sdk/util-dynamodb'
import { type DatabaseResponse, type NewLog } from '../../../types'

const dynamoDbClient = new DynamoDBClient()

export const getLog = async (): Promise<DatabaseResponse> => {
	const dynamoDocumentClient = DynamoDBDocumentClient.from(dynamoDbClient)
	const { halfsiesLogTableName = '' } = process.env

	try {
		const data: ScanCommandOutput = await dynamoDocumentClient.send(new ScanCommand({
			TableName: halfsiesLogTableName,
		}))

		return {
			isError: false,
			data: data.Items,
		}
	} catch (error: unknown) {
		return {
			isError: true,
			errorMessage: error instanceof Error ? error.message : "Unknown error occurred",
		}
	}
}

export const saveLog = async (log: NewLog, userName: string): Promise<DatabaseResponse> => {
	const dynamoDocumentClient = DynamoDBDocumentClient.from(dynamoDbClient)
	const { halfsiesLogTableName = '' } = process.env
	const { amount, description } = log
	const now: Date = new Date()

	try {
		await dynamoDocumentClient.send(new PutCommand({
			TableName: halfsiesLogTableName,
			Item: {
				amount,
				date: now.toISOString(),
				description,
				id: now.getTime(),
				user: userName,
			},
		}))

		return {
			isError: false,
		}
	} catch (error: unknown) {
		return {
			isError: true,
			errorMessage: error instanceof Error ? error.message : "Unknown error occurred",
		}
	}
}

export const deleteLog = async (id: number): Promise<DatabaseResponse> => {
	const { halfsiesLogTableName = '' } = process.env

	const dbQueryParams: DeleteItemCommandInput = {
		TableName: halfsiesLogTableName,
		Key: marshall({ id }),
	}

	try {
		await dynamoDbClient.send(new DeleteItemCommand(dbQueryParams))
		return {
			isError: false,
		}
	} catch (error: any) {
		return {
			errorMessage: error?.message,
			isError: true,
		}
	}
}
