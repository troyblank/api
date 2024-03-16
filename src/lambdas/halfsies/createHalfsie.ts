import { AWSError } from 'aws-sdk'
import { type APIGatewayProxyEvent, type APIGatewayProxyResult } from 'aws-lambda'
import { type DatabaseResponse, type NewLog } from '../../types'
import { RESPONSE_CODE_OK, RESPONSE_CODE_SERVER_ERROR } from '../../constants'
import { isALog, isUserNameTheMainUserName, pruneLogs } from '../../utils'
import {
	getBalance,
	getUserName,
	saveLog,
	updateBalance,
} from './utils'

export const handler = ({ body, headers }: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => new Promise((resolve) => {
	const newLog: NewLog = JSON.parse(body || '{}')
	const user: string = getUserName(headers)
	let message: string | undefined = 'Successfully created a halfsie.'

	const result: APIGatewayProxyResult = {
		statusCode: RESPONSE_CODE_OK,
		body: JSON.stringify({ message }),
	}

	if (!isALog(newLog)) {
		result.statusCode = RESPONSE_CODE_SERVER_ERROR
		result.body = JSON.stringify({ message: 'No log given to create.' })
		resolve(result)
	}

	getBalance().then(({ data: currentBalance, isError: isGetBalanceError, errorMessage: getBalanceErrorMessage }: DatabaseResponse) => {
		const { amount } = newLog
		const directionalAmount = isUserNameTheMainUserName(user) ? amount : amount * -1
		const newBalance = currentBalance + directionalAmount

		Promise.all([saveLog(newLog, user), updateBalance(newBalance)]).then(([
			{ isError: isSaveLogError, errorMessage: saveLogErrorMessage },
			{ data: newBalance, isError: isUpdateBalanceError, errorMessage: updateErrorMessage },
		]: DatabaseResponse[]) => {
			if (isGetBalanceError || isSaveLogError || isUpdateBalanceError) {
				result.statusCode = RESPONSE_CODE_SERVER_ERROR
				result.body = JSON.stringify({ message: getBalanceErrorMessage || saveLogErrorMessage || updateErrorMessage})
			
				resolve(result)
			} else {
				pruneLogs().then(({ data: newLogs, isError: isPruneLogsError, errorMessage: pruneLogsErrorMessage }: DatabaseResponse) => {
					if (isPruneLogsError) {
						result.statusCode = RESPONSE_CODE_SERVER_ERROR
						result.body = JSON.stringify({ message:  pruneLogsErrorMessage })
					} else {
						result.body = JSON.stringify({ newBalance, newLog, newLogs })
					}
				}).catch((error: AWSError) => {
					result.statusCode = RESPONSE_CODE_SERVER_ERROR
					result.body = JSON.stringify({ message: error.toString() })
				}).finally(() => {
					resolve(result)
				})
			}
		}).catch((error: AWSError) => {
			result.statusCode = RESPONSE_CODE_SERVER_ERROR
			result.body = JSON.stringify({ message: error.toString() })

			resolve(result)
		})
	}).catch((error: AWSError) => {
		result.statusCode = RESPONSE_CODE_SERVER_ERROR
		result.body = JSON.stringify({ message: error.toString() })

		resolve(result)
	})
})
