import { type APIGatewayProxyEvent, type APIGatewayProxyResult } from 'aws-lambda'
import { RESPONSE_CODE_OK, RESPONSE_CODE_SERVER_ERROR } from '../../constants/responseCodes'
import { deleteShoppingListLegendItem } from './utils/shoppingListLegend'

const headersFor = (accessControlAllowOrigin: string) => ({
	'Access-Control-Allow-Origin': accessControlAllowOrigin,
	'Content-Type': 'application/json',
})

export const handler = ({ body }: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => new Promise((resolve) => {
	const { accessControlAllowOrigin = '' } = process.env
	const headers = headersFor(accessControlAllowOrigin)

	let itemId: unknown
	try {
		itemId = JSON.parse(body || '')
	} catch (error) {
		resolve({
			body: JSON.stringify({ message: 'Invalid JSON in request body.' }),
			headers,
			statusCode: RESPONSE_CODE_SERVER_ERROR,
		})
		return
	}

	if (typeof itemId !== 'number' || !Number.isInteger(itemId)) {
		resolve({
			body: JSON.stringify({ message: 'No valid shopping list legend item id given to delete.' }),
			headers,
			statusCode: RESPONSE_CODE_SERVER_ERROR,
		})
		return
	}

	const result: APIGatewayProxyResult = {
		body: JSON.stringify({ message: 'Invalid state.' }),
		headers,
		statusCode: RESPONSE_CODE_OK,
	}

	deleteShoppingListLegendItem(itemId).then((response) => {
		if (response.isError) {
			result.statusCode = RESPONSE_CODE_SERVER_ERROR
			result.body = JSON.stringify({ message: response.errorMessage })
		} else {
			result.statusCode = RESPONSE_CODE_OK
			result.body = JSON.stringify({ message: 'Shopping list legend item was deleted successfully.' })
		}
	}).catch((error) => {
		result.statusCode = RESPONSE_CODE_SERVER_ERROR
		result.body = JSON.stringify({ message: error.toString() })
	}).finally(() => {
		resolve(result)
	})
})
