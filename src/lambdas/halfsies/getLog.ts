import { AWSError } from 'aws-sdk'
import { APIGatewayProxyResult } from 'aws-lambda'
import { type DatabaseResponse } from '../../types'
import { RESPONSE_CODE_OK, RESPONSE_CODE_SERVER_ERROR } from '../../constants'
import { sortLogs } from '../../utils'
import { getLog } from './utils'

export const handler = (): Promise<APIGatewayProxyResult> => new Promise((resolve) => {
	const { accessControlAllowOrigin = '' } = process.env

	const result: APIGatewayProxyResult = {
		body: JSON.stringify({ message: 'Invalid state.', log: [] }),
		headers: {
			'Access-Control-Allow-Origin': accessControlAllowOrigin,
			'Content-Type': 'application/json',
		},
		statusCode: RESPONSE_CODE_OK,
	}

	getLog().then(({ data: log, isError, errorMessage }: DatabaseResponse) => {
		if (isError) {
			result.statusCode = RESPONSE_CODE_SERVER_ERROR
		}
	
		result.body = JSON.stringify({ message: errorMessage, log: log && sortLogs(log) })
	}).catch((error: AWSError) => {
		result.statusCode = RESPONSE_CODE_SERVER_ERROR
		result.body = JSON.stringify({ message: error.toString() })
	}).finally(() => {
		resolve(result)
	})
})
