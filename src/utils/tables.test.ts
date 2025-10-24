import { Chance } from 'chance'
import { BatchWriteCommand } from "@aws-sdk/lib-dynamodb"
import { Stack } from 'aws-cdk-lib'
import { AttributeType } from 'aws-cdk-lib/aws-dynamodb'
import { CreateTableType } from '../types'
import * as tables from './tables'

jest.mock('@aws-sdk/client-dynamodb', () => ({
	DynamoDBClient: jest.fn(() => ({})),
}))

jest.mock("@aws-sdk/lib-dynamodb", () => {
	return {
		DynamoDBDocumentClient: {
			from: jest.fn(() => ({
				send: jest.fn().mockResolvedValue({}),
			})),
		},
		BatchWriteCommand: jest.fn(),
	}
})
describe('Table Utils', () => {
	const chance = new Chance()
	const SomeStack = new Stack()

	beforeEach(() => {
		jest.mocked(BatchWriteCommand)
	})

	it('should be able to create a table', async () => {
		jest.spyOn(tables, 'createTable')

		const createTableProps: CreateTableType = {
			name: chance.string(),
			primaryKey: chance.string(),
			stack: SomeStack,
			type: AttributeType.STRING,
		}

		tables.createTable(createTableProps)

		expect(tables.createTable).toHaveBeenCalledWith(createTableProps)
	})

	it('should be able to delete all items', async () => {
		jest.spyOn(tables, 'deleteItems')

		const tableName = chance.word()
		const keys = chance.unique(chance.integer, chance.integer({ min: 1, max: 100 }))

		await tables.deleteItems({ tableName, keys })

		expect(tables.deleteItems).toHaveBeenCalledWith({ tableName, keys })
	})
})