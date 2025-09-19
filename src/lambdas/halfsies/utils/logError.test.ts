import { Chance } from 'chance'
import { mockNewLog } from '../../../mocks'
import { deleteLog, getLog, saveLog } from './log'

jest.mock('@aws-sdk/client-dynamodb', () => {
	return {
		...jest.requireActual('@aws-sdk/client-dynamodb'),
		DynamoDBClient: jest.fn(() => ({
			send: jest.fn().mockRejectedValue(new Error('Something bad happened.')),
		})),
	}
})

jest.mock('@aws-sdk/lib-dynamodb', () => {
	return {
		...jest.requireActual('@aws-sdk/lib-dynamodb'),
		DynamoDBDocumentClient: {
			from: jest.fn(() => ({
				send: jest.fn().mockRejectedValue(new Error('Something bad happened.')),
			})),
		},
	}
})

describe('Log util - failure', () => {
	const chance = new Chance()

	beforeEach(() => {
		process.env.halfsiesLogTableName = chance.word({ syllables: 4 })
	})

	it('should allow fail when getting logs', async () => {
		const result = await getLog()

		expect(result).toStrictEqual({
			errorMessage: 'Something bad happened.',
			isError: true,
		})
	})

	it('Should allow fail when saving a log.', async () => {
		const result = await saveLog(mockNewLog(), chance.name())

		expect(result).toStrictEqual({
			errorMessage: 'Something bad happened.',
			isError: true,
		})
	})

	it('Should allow fail when deleting a log.', async () => {
		const result = await deleteLog(chance.natural())

		expect(result).toStrictEqual({
			errorMessage: 'Something bad happened.',
			isError: true,
		})
	})
})
