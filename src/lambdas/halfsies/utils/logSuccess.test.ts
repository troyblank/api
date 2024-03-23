import { Chance } from 'chance'
import { mockHalfsieLogs, mockNewLog } from '../../../mocks'
import { deleteLog, getLogs, saveLog } from './log'

jest.mock('aws-sdk', () => {
	return {
		DynamoDB: {
			DocumentClient: jest.fn(() => ({
				delete: (_: any, callback: Function) => callback(null),
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

	it('should delete a log', async () => {
		expect(async () => await deleteLog(chance.natural())).not.toThrow()
	})
})
