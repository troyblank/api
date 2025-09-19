import { HALFSIES_MAX_LOGS } from '../../../config'
import { type DatabaseResponse, type HalfsieLog } from '../../types'
import { deleteLog, getLog } from '../../lambdas/halfsies/utils/log'
import { getErrorMessage } from '../../utils/error'

export const isALog = (log: any): boolean => {
	return typeof log.amount === 'number' && typeof log.description === 'string'
}

export const sortLogs = (logs: HalfsieLog[] = []): HalfsieLog[] => {
	return logs.slice().sort(({ date: dateA }: { date: string }, { date: dateB }: { date: string }) => {
		return new Date(dateB).getTime() - new Date(dateA).getTime()
	})
}

export const pruneLogs = async (): Promise<DatabaseResponse> => new Promise((resolve) => {
	getLog().then(({ data: logs = [], isError: isGetLogError, errorMessage: getLogErrorMessage }: DatabaseResponse) => {
		if (isGetLogError) {
			resolve({
				errorMessage: getLogErrorMessage,
				isError: true,
			})
		}

		const amountOver = logs.length - HALFSIES_MAX_LOGS
		const logsAwaitingDeletion: Promise<DatabaseResponse>[] = []
		let remainingLogs: HalfsieLog[] = sortLogs(logs)

		if (amountOver > 0) {
			const logsToDelete = remainingLogs.slice(-amountOver)
			remainingLogs = remainingLogs.slice(0, -amountOver)

			logsToDelete.forEach(({ id }: { id: number }) => {
				logsAwaitingDeletion.push(deleteLog(id))
			})
		}

		Promise.all(logsAwaitingDeletion).then((allDeletionResults: DatabaseResponse[]) => {
			const anyDeletionErrors: boolean = allDeletionResults.some(({ isError }: DatabaseResponse) => isError)

			if (anyDeletionErrors) {
				resolve({
					errorMessage: 'Failed to delete some logs.',
					isError: true,
				})
			}

			resolve({
				data: remainingLogs,
				isError: false,
				errorMessage: '',
			})
		}).catch((error) => {
			resolve({
				errorMessage: error?.message,
				isError: true,
			})
		})
	}).catch((error) => {
		resolve({
			errorMessage: getErrorMessage(error),
			isError: true,
		})
	})
})
