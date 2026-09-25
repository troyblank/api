import { type APIGatewayProxyEvent, type APIGatewayProxyResult } from 'aws-lambda'
import { type DatabaseResponse, type ShoppingListLegendItem } from '../../types'
import { RESPONSE_CODE_OK, RESPONSE_CODE_SERVER_ERROR } from '../../constants/responseCodes'
import { isAShoppingListLegendItem } from '../../utils/foodHow/shoppingListLegendItem'
import { getUserName } from '../utils/user'
import { saveShoppingListLegendItem } from './utils/shoppingListLegend'

const shoppingListLegendItemFromBody = (body: string | null): ShoppingListLegendItem => {
	const parsedLegendItem = JSON.parse(body || '{}')

	return {
		emoji: typeof parsedLegendItem.emoji === 'string' ? parsedLegendItem.emoji.trim() : parsedLegendItem.emoji,
		name: typeof parsedLegendItem.name === 'string' ? parsedLegendItem.name.trim() : parsedLegendItem.name,
	}
}

export const handler = ({ body, headers }: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => new Promise((resolve) => {
	const { accessControlAllowOrigin = '' } = process.env
	const legendItem: ShoppingListLegendItem = shoppingListLegendItemFromBody(body)
	const user: string = getUserName(headers)

	const result: APIGatewayProxyResult = {
		body: JSON.stringify({ message: 'Successfully saved a legend item.' }),
		headers: {
			'Access-Control-Allow-Origin': accessControlAllowOrigin,
			'Content-Type': 'application/json',
		},
		statusCode: RESPONSE_CODE_OK,
	}

	if (!isAShoppingListLegendItem(legendItem)) {
		result.statusCode = RESPONSE_CODE_SERVER_ERROR
		result.body = JSON.stringify({ message: 'No valid legend item given to save.' })

		return resolve(result)
	}

	saveShoppingListLegendItem(legendItem, user).then(({ isError, errorMessage, data }: DatabaseResponse) => {
		if (isError) {
			result.statusCode = RESPONSE_CODE_SERVER_ERROR
			result.body = JSON.stringify({ errorMessage })
		} else {
			result.body = JSON.stringify({ legendItem: data })
		}

		resolve(result)
	}).catch((error) => {
		result.statusCode = RESPONSE_CODE_SERVER_ERROR
		result.body = JSON.stringify({ errorMessage: error })

		resolve(result)
	})
})
