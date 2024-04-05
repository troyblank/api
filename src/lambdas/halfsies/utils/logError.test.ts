import { Chance } from 'chance'
import { mockNewLog } from '../../../mocks'
import { deleteLog, getLog, saveLog } from './log'

jest.mock('aws-sdk', () => {
	return {
		DynamoDB: {
			DocumentClient: jest.fn(() => ({
				delete: (_: any, callback: Function) => callback({ message: 'Something bad happened.' }, { Item: {} }),
				put: (_: any, callback: Function) => callback({ message: 'Something bad happened.' }, { Item: {} }),
				scan: (_: any, callback: Function) => callback({ message: 'Something bad happened.' }, { Item: {} }),
			})),
		},
	}
})

describe('Log util - failure', () => {
	const chance = new Chance()

	it('should allow fail when getting logs', async () => {
		const result = await getLog()

		expect(result).toStrictEqual({
			data: undefined,
			errorMessage: 'Something bad happened.',
			isError: true,
		})
	})

	it('should allow fail when saving a log', async () => {
		const result = await saveLog(mockNewLog(), chance.name())

		expect(result).toStrictEqual({
			errorMessage: 'Something bad happened.',
			isError: true,
		})
	})

	it('should allow fail when deleting a log', async () => {
		const result = await deleteLog(chance.natural())

		expect(result).toStrictEqual({
			errorMessage: 'Something bad happened.',
			isError: true,
		})
	})
})
