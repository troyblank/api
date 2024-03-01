import { Chance } from 'chance'
import { mockNewLog } from '../../../mocks'
import { saveLog } from './log'

jest.mock('aws-sdk', () => {
	return {
		DynamoDB: {
			DocumentClient: jest.fn(() => ({
				put: (_: any, callback: Function) => callback(null),
			})),
		},
	}
})

describe('Log util - success', () => {
	const chance = new Chance()

	it('should save a log', async () => {
		expect(async () => await saveLog(mockNewLog(), chance.name())).not.toThrow()
	})
})
