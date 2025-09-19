import { type APIGatewayProxyEvent, type APIGatewayProxyResult } from 'aws-lambda'
import { type DatabaseResponse, type ShoppingListItem } from '../../types'
import { RESPONSE_CODE_OK, RESPONSE_CODE_SERVER_ERROR } from '../../constants/responseCodes'
import { isAShoppingListItem } from '../../utils/foodHow/shoppingListItem'
import { getUserName } from '../utils/user'
import { saveShoppingListItem } from './utils/shoppingList'

export const handler = ({ body, headers }: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => new Promise((resolve) => {
	const { accessControlAllowOrigin = '' } = process.env
	const newShoppingListItem: ShoppingListItem = JSON.parse(body || '{}')
	const user: string = getUserName(headers)
	let message: string | undefined = 'Successfully created a shopping list item.'

	const result: APIGatewayProxyResult = {
		body: JSON.stringify({ message }),
		headers: {
			'Access-Control-Allow-Origin': accessControlAllowOrigin,
			'Content-Type': 'application/json',
		},
		statusCode: RESPONSE_CODE_OK,
	}

	if (!isAShoppingListItem(newShoppingListItem)) {
		result.statusCode = RESPONSE_CODE_SERVER_ERROR
		result.body = JSON.stringify({ message: 'No valid shopping list item given to create.' })

		return resolve(result)
	}

	saveShoppingListItem(newShoppingListItem, user).then(({ isError, errorMessage }: DatabaseResponse) => {
		if (isError) {
			result.statusCode = RESPONSE_CODE_SERVER_ERROR
			result.body = JSON.stringify({ errorMessage: errorMessage })
		} else {
			result.body = JSON.stringify({ newShoppingListItem })
		}
	
		resolve(result)
	}).catch((error) => {
		result.statusCode = RESPONSE_CODE_SERVER_ERROR
		result.body = JSON.stringify({ errorMessage: error })

		resolve(result)
	})
})
