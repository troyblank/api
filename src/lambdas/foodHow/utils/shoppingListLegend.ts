import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import {
	DynamoDBDocumentClient,
	PutCommand,
	ScanCommand,
	type ScanCommandOutput,
} from '@aws-sdk/lib-dynamodb'
import { getErrorMessage } from '../../../utils/error'
import { deleteItems } from '../../../utils/tables'
import { type DatabaseResponse, type SavedShoppingListLegendItem, type ShoppingListLegendItem } from '../../../types'

export const getShoppingListLegend = async (): Promise<DatabaseResponse> => {
	const dynamoDbClient = new DynamoDBClient()
	const dynamoDocumentClient = DynamoDBDocumentClient.from(dynamoDbClient)
	const { shoppingListLegendTableName } = process.env

	try {
		const data: ScanCommandOutput = await dynamoDocumentClient.send(new ScanCommand({
			TableName: shoppingListLegendTableName,
		}))

		return {
			isError: false,
			data: data.Items ?? [],
		}
	} catch (error: unknown) {
		return {
			isError: true,
			errorMessage: getErrorMessage(error),
		}
	}
}

export const saveShoppingListLegendItem = async (item: ShoppingListLegendItem, userName: string): Promise<DatabaseResponse> => {
	const dynamoDbClient = new DynamoDBClient()
	const dynamoDocumentClient = DynamoDBDocumentClient.from(dynamoDbClient)
	const { shoppingListLegendTableName } = process.env
	const now: Date = new Date()
	const savedLegendItem: SavedShoppingListLegendItem = {
		...item,
		id: now.getTime(),
		user: userName,
	}

	try {
		await dynamoDocumentClient.send(new PutCommand({
			TableName: shoppingListLegendTableName,
			Item: savedLegendItem,
		}))

		return {
			isError: false,
			data: savedLegendItem,
		}
	} catch (error: unknown) {
		return {
			isError: true,
			errorMessage: getErrorMessage(error),
		}
	}
}

export const deleteShoppingListLegendItem = async (itemId: number): Promise<DatabaseResponse> => {
	const { shoppingListLegendTableName } = process.env

	try {
		await deleteItems({
			tableName: shoppingListLegendTableName!,
			keys: [ itemId ],
		})

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
