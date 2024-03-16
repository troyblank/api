import { AWSError } from 'aws-sdk'
import { type DatabaseResponse } from '../../types'
import { getLogs } from '../../lambdas/halfsies/utils'

export const isALog = (log: any): boolean => {
	return typeof log.amount === 'number' && typeof log.description === 'string'
}

export const pruneLogs = async (): Promise<DatabaseResponse> => new Promise((resolve) => {
	getLogs().then(({ data: logs, isError: isGetLogsError, errorMessage: getLogsErrorMessage }: DatabaseResponse) => {
		if (isGetLogsError) {
			resolve({
				errorMessage: getLogsErrorMessage,
				isError: true,
			})
		}

		// delete logs here that are above x amount

		resolve({
			data: logs,
			isError: false,
			errorMessage: '',
		})
	}).catch((error: AWSError) => {
		resolve({
			errorMessage: error?.message,
			isError: true,
		})
	})
})
