import { type APIGatewayProxyResult } from 'aws-lambda'
import { type DatabaseResponse } from '../../types'
import { RESPONSE_CODE_OK, RESPONSE_CODE_SERVER_ERROR } from '../../constants/responseCodes'
import { getShoppingListLegend } from './utils/shoppingListLegend'

export const handler = (): Promise<APIGatewayProxyResult> => new Promise((resolve) => {
	const { accessControlAllowOrigin = '' } = process.env

	const result: APIGatewayProxyResult = {
		body: JSON.stringify({ message: 'Invalid state.', legend: [] }),
		headers: {
			'Access-Control-Allow-Origin': accessControlAllowOrigin,
			'Content-Type': 'application/json',
		},
		statusCode: RESPONSE_CODE_OK,
	}

	getShoppingListLegend().then(({ data: legend, isError, errorMessage }: DatabaseResponse) => {
		if (isError) {
			result.statusCode = RESPONSE_CODE_SERVER_ERROR
		}

		result.body = JSON.stringify({ message: errorMessage, legend })
	}).catch((error) => {
		result.statusCode = RESPONSE_CODE_SERVER_ERROR
		result.body = JSON.stringify({ message: error.toString() })
	}).finally(() => {
		resolve(result)
	})
})
