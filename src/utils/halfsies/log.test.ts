import { Chance } from 'chance'
import { type HalfsieLog } from '../../types'
import { mockHalfsieLogs } from '../../mocks'
import { getLogs } from '../../lambdas/halfsies/utils'
import { isALog, pruneLogs } from './log'

jest.mock('../../lambdas/halfsies/utils')

describe('Log util', () => {
	const chance = new Chance()

	it('should determine what is a log', async () => {
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

	it('should be able to prune logs', async () => {
		const logs: HalfsieLog[] = mockHalfsieLogs()

		jest.mocked(getLogs).mockResolvedValue({ data: logs, isError: false, errorMessage: '' })

		const result = await pruneLogs()

		expect(result).toStrictEqual({
			data: logs,
			isError: false,
			errorMessage: '',
		})
	})

	it('should not be able to prune logs if there is an error getting the logs', async () => {
		const errorMessage: string = chance.sentence()

		jest.mocked(getLogs).mockRejectedValue({ message: errorMessage })

		const result = await pruneLogs()

		expect(result).toStrictEqual({
			isError: true,
			errorMessage,
		})
	})

	it('should not be able to prune logs if there is an error using the get logs util', async () => {
		const errorMessage: string = chance.sentence()

		jest.mocked(getLogs).mockResolvedValue({ data: undefined, isError: true, errorMessage })

		const result = await pruneLogs()

		expect(result).toStrictEqual({
			isError: true,
			errorMessage,
		})
	})
})
