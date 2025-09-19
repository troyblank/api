import { Chance } from 'chance'
import { mockNewLog } from '../../../mocks'
import { deleteLog, getLog, saveLog } from './log'

jest.mock('@aws-sdk/client-dynamodb', () => ({
	...jest.requireActual('@aws-sdk/client-dynamodb'),
	DynamoDBClient: jest.fn(() => ({})),
}))

jest.mock('@aws-sdk/lib-dynamodb', () => {
	return {
		...jest.requireActual('@aws-sdk/lib-dynamodb'),
		DynamoDBDocumentClient: {
			from: jest.fn(() => ({
				send: jest.fn().mockResolvedValue({ Items: [] }),
			})),
		},
	}
})

describe('Log util - success', () => {
	const chance = new Chance()

	beforeEach(() => {
		process.env.halfsiesLogTableName = chance.word({ syllables: 4 })
	})

	it('Should get logs.', async () => {
		expect(async () => await getLog()).not.toThrow()
	})

	it('Should save a log.', async () => {
		expect(async () => await saveLog(mockNewLog(), chance.name())).not.toThrow()
	})

	it('Should delete a log.', async () => {
		expect(async () => await deleteLog(chance.natural())).not.toThrow()
	})
})
