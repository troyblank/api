import { Chance } from 'chance'
import { mockNewLog } from '../../../mocks'
import { getLogs, saveLog } from './log'

jest.mock('aws-sdk', () => {
	return {
		DynamoDB: {
			DocumentClient: jest.fn(() => ({
				put: (_: any, callback: Function) => callback({ message: 'Something bad happened.' }, { Item: {} }),
				scan: (_: any, callback: Function) => callback({ message: 'Something bad happened.' }, { Item: {} }),
			})),
		},
	}
})

describe('Log util - failure', () => {
	const chance = new Chance()

	it('should allow fail when getting logs', async () => {
		const result = await getLogs()

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
})
