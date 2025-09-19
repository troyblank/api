import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb'
import { getErrorMessage } from '../../../utils/error'
import { type DatabaseResponse } from '../../../types'
import { type ShoppingListItem } from '../../../types/lambdas/foodHow'

export const saveShoppingListItem = async (item: ShoppingListItem, userName: string): Promise<DatabaseResponse> => {
	const dynamoDbClient = new DynamoDBClient()
	const dynamoDocumentClient = DynamoDBDocumentClient.from(dynamoDbClient)
	const { shoppingListTableName } = process.env
	const now: Date = new Date()

	try {
		await dynamoDocumentClient.send(new PutCommand({
			TableName: shoppingListTableName,
			Item: {
				...item,
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
