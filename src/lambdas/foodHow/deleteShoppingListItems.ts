import { type APIGatewayProxyEvent, type APIGatewayProxyResult } from 'aws-lambda'
import { RESPONSE_CODE_OK, RESPONSE_CODE_SERVER_ERROR } from '../../constants/responseCodes'
import { deleteShoppingListItems } from './utils/shoppingList'

export const handler = ({ body }: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => new Promise((resolve) => {
	const { accessControlAllowOrigin = '' } = process.env
	const itemIdsToDelete: number[] = JSON.parse(body || '[]')

	const result: APIGatewayProxyResult = {
		body: JSON.stringify({ message: 'Invalid state.' }),
		headers: {
			'Access-Control-Allow-Origin': accessControlAllowOrigin,
			'Content-Type': 'application/json',
		},
		statusCode: RESPONSE_CODE_OK,
	}

	deleteShoppingListItems(itemIdsToDelete).then(() => {
		result.statusCode = RESPONSE_CODE_OK
		result.body = JSON.stringify({ message: 'Items were deleted successfully.' })
	}).catch((error) => {
		result.statusCode = RESPONSE_CODE_SERVER_ERROR
		result.body = JSON.stringify({ message: error.toString() })
	}).finally(() => {
		resolve(result)
	})
})
