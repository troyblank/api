import { Chance } from 'chance'
import { MAX_HALFSIES_LOGS } from '../../../config'
import { type HalfsieLog } from '../../types'
import { mockHalfsieLog, mockHalfsieLogs } from '../../mocks'
import { deleteLog, getLog } from '../../lambdas/halfsies/utils'
import { isALog, pruneLogs, sortLogs } from './log'

jest.mock('../../../config')
jest.mock('../../lambdas/halfsies/utils')

describe('Log util', () => {
	const chance = new Chance()

	beforeEach(() => {
		jest.mocked(deleteLog).mockResolvedValue({ isError: false, errorMessage: '' })
	})

	it('Should determine what is a log.', async () => {
		expect(isALog({
			amount: chance.natural(),
			description: chance.sentence(),
		})).toBe(true)
	
		expect(isALog({
			amount: chance.word(),
			description: chance.sentence(),
		})).toBe(false)
	
		expect(isALog(chance.word())).toBe(false)
	})

	it('Should be able to sort logs based on date.', async () => {
		
		const logs: HalfsieLog[] = [
			mockHalfsieLog({
				date: new Date('1950-11-10').toISOString(),
				id: 3,
			}),
			mockHalfsieLog({
				date: new Date('2024-03-24').toISOString(),
				id: 1,
			}),
			mockHalfsieLog({
				date: new Date('2024-03-23').toISOString(),
				id: 2,
			}),
		]


		expect(sortLogs(logs)).toStrictEqual([logs[1], logs[2], logs[0]])
	})


	it('Should be able to sort logs that do not exist.', async () => {
		expect(sortLogs(undefined)).toStrictEqual([])
	})

	it('Should be able to prune logs.', async () => {
		const logs: HalfsieLog[] = mockHalfsieLogs()

		jest.mocked(getLog).mockResolvedValue({ data: logs, isError: false, errorMessage: '' })

		const result = await pruneLogs()

		expect(result).toStrictEqual({
			data: sortLogs(logs),
			isError: false,
			errorMessage: '',
		})
	})

	it('Should not be able to prune logs if there is an error getting the logs.', async () => {
		const errorMessage: string = chance.sentence()

		jest.mocked(getLog).mockRejectedValue({ message: errorMessage })

		const result = await pruneLogs()

		expect(result).toStrictEqual({
			isError: true,
			errorMessage,
		})
	})

	it('Should not be able to prune logs if there is an error using the get logs util.', async () => {
		const errorMessage: string = chance.sentence()

		jest.mocked(getLog).mockResolvedValue({ data: undefined, isError: true, errorMessage })

		const result = await pruneLogs()

		expect(result).toStrictEqual({
			isError: true,
			errorMessage,
		})
	})

	it('Should delete logs during prune if the amount of logs is over the max config value.', async () => {
		const logs: HalfsieLog[] = mockHalfsieLogs(MAX_HALFSIES_LOGS + 10)

		const amountExpectedToDelete: number = logs.length - MAX_HALFSIES_LOGS

		jest.mocked(getLog).mockResolvedValue({ data: logs, isError: false, errorMessage: '' })
		jest.mocked(deleteLog).mockResolvedValue({ data: undefined, isError: false, errorMessage: '' })

		await pruneLogs()

		expect(deleteLog).toHaveBeenCalledTimes(amountExpectedToDelete)
	})

	it('Should not be able to prune logs if there is an error deleting any logs.', async () => {
		const logs: HalfsieLog[] = mockHalfsieLogs(MAX_HALFSIES_LOGS + 10)
		const errorMessage: string = chance.sentence()

		jest.mocked(getLog).mockResolvedValue({ data: logs, isError: false, errorMessage: '' })
		jest.mocked(deleteLog).mockRejectedValue({ message: errorMessage })

		const result = await pruneLogs()

		expect(result).toStrictEqual({
			isError: true,
			errorMessage,
		})
	})

	it('Should not be able to prune logs if there is an error using the delete log util.', async () => {
		const logs: HalfsieLog[] = mockHalfsieLogs(MAX_HALFSIES_LOGS + 10)
		const errorMessage: string = chance.sentence()

		jest.mocked(getLog).mockResolvedValue({ data: logs, isError: false, errorMessage: '' })
		jest.mocked(deleteLog).mockResolvedValue({ data: undefined, isError: true, errorMessage })

		const result = await pruneLogs()

		expect(result).toStrictEqual({
			isError: true,
			errorMessage: 'Failed to delete some logs.',
		})
	})
})
