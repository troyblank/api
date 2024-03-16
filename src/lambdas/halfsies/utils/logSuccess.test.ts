import { Chance } from 'chance'
import { mockHalfsieLogs, mockNewLog } from '../../../mocks'
import { getLogs, saveLog } from './log'

jest.mock('aws-sdk', () => {
	return {
		DynamoDB: {
			DocumentClient: jest.fn(() => ({
				put: (_: any, callback: Function) => callback(null),
				scan: (_: any, callback: Function) => callback(null, { Items: mockHalfsieLogs() }),
			})),
		},
	}
})

jest.mock('./log')

describe('Log util - success', () => {
	const chance = new Chance()

	it('should get logs', async () => {
		expect(async () => await getLogs()).not.toThrow()
	})

	it('should save a log', async () => {
		expect(async () => await saveLog(mockNewLog(), chance.name())).not.toThrow()
	})
})
