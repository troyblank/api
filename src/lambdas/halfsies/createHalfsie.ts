import { AWSError } from 'aws-sdk'
import { type APIGatewayProxyEvent, type APIGatewayProxyResult } from 'aws-lambda'
import { type DatabaseResponse, type NewLog } from '../../types'
import { RESPONSE_CODE_OK, RESPONSE_CODE_SERVER_ERROR } from '../../constants'
import { getUserName, saveLog } from './utils'

export const handler = ({ body, headers }: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => new Promise((resolve) => {
	const newLog: NewLog = JSON.parse(body || '{}')
	const user: string = getUserName(headers)
	let message: string | undefined = 'Successfully created a halfsie.'

	const result: APIGatewayProxyResult = {
		statusCode: RESPONSE_CODE_OK,
		body: JSON.stringify({ message }),
	}

	saveLog(newLog, user).then(({ isError, errorMessage }: DatabaseResponse) => {
		if (isError) {
			result.statusCode = RESPONSE_CODE_SERVER_ERROR
		}
	
		result.body = JSON.stringify({ message: errorMessage })
	}).catch((error: AWSError) => {
		result.statusCode = RESPONSE_CODE_SERVER_ERROR
		result.body = JSON.stringify({ message: error.toString() })
	}).finally(() => {
		resolve(result)
	})
})
