import { Chance } from 'chance'
import { mockNewLog } from '../../../mocks'
import { deleteLog, getLog, saveLog } from './log'

jest.mock('@aws-sdk/client-dynamodb', () => ({
	DynamoDBClient: jest.fn(() => ({
		send: jest.fn().mockRejectedValue(new Error('Something bad happened.')),
	})),
}))

jest.mock('@aws-sdk/lib-dynamodb', () => {
	const originalModule = jest.requireActual('@aws-sdk/lib-dynamodb')
	return {
		...originalModule,
		DynamoDBDocumentClient: {
			from: jest.fn(() => ({
				send: jest.fn().mockRejectedValue(new Error('Something bad happened.')),
			})),
		},
	}
})

describe('Log util - success', () => {
	const chance = new Chance()

	beforeEach(() => {
		process.env.halfsiesLogTableName = chance.word({ syllables: 4 })
	})

	it('should get logs', async () => {
		expect(async () => await getLog()).not.toThrow()
	})

	it('should save a log', async () => {
		expect(async () => await saveLog(mockNewLog(), chance.name())).not.toThrow()
	})

	it('should delete a log', async () => {
		expect(async () => await deleteLog(chance.natural())).not.toThrow()
	})
})
