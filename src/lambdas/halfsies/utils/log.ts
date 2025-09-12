import {
	DeleteItemCommand,
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
import { getErrorMessage } from '../../../utils/error'

export const getLog = async (): Promise<DatabaseResponse> => {
	const dynamoDbClient = new DynamoDBClient()
	const dynamoDocumentClient = DynamoDBDocumentClient.from(dynamoDbClient)
	const { halfsiesLogTableName } = process.env

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
			errorMessage: getErrorMessage(error),
		}
	}
}

export const saveLog = async (log: NewLog, userName: string): Promise<DatabaseResponse> => {
	const dynamoDbClient = new DynamoDBClient()
	const dynamoDocumentClient = DynamoDBDocumentClient.from(dynamoDbClient)
	const { halfsiesLogTableName } = process.env
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
			errorMessage: getErrorMessage(error),
		}
	}
}

export const deleteLog = async (id: number): Promise<DatabaseResponse> => {
	const dynamoDbClient = new DynamoDBClient()
	const dynamoDocumentClient = DynamoDBDocumentClient.from(dynamoDbClient)
	const { halfsiesLogTableName } = process.env

	try {
		await dynamoDocumentClient.send(
			new DeleteItemCommand({
				TableName: halfsiesLogTableName,
				Key: marshall({ id }),
			}),
		)

		return {
			isError: false,
		}
	} catch (error: any) {
		return {
			errorMessage: getErrorMessage(error),
			isError: true,
		}
	}
}
