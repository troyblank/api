import { Chance } from 'chance'
import { mockNewLog } from '../../../mocks'
import { saveLog } from './log'

jest.mock('aws-sdk', () => {
	return {
		DynamoDB: {
			DocumentClient: jest.fn(() => ({
				put: (_: any, callback: Function) => callback({ message: 'Something bad happened.' }, { Item: {} }),
			})),
		},
	}
})

describe('Log util - failure', () => {
	const chance = new Chance()

	it('should allow fail  when saving a log', async () => {
		const result = await saveLog(mockNewLog(), chance.name())

		expect(result).toStrictEqual({
			errorMessage: 'Something bad happened.',
			isError: true,
		})
	})
})
