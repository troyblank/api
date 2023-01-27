import { Chance } from 'chance'
import { Stack } from 'aws-cdk-lib'
import { AttributeType } from 'aws-cdk-lib/aws-dynamodb'
import { CreateTableType } from '../types'
import * as tables from './tables'

describe('Create Table', () => {
    const chance = new Chance()
    const SomeStack = new Stack()

    it('should be able to create a table', async () => {
        jest.spyOn(tables, 'createTable')

        const createTableProps: CreateTableType = {
            name: chance.string(),
            primaryKey: chance.string(),
            stack: SomeStack,
            type: AttributeType.STRING
        }

        tables.createTable(createTableProps)

        expect(tables.createTable).toBeCalledWith(createTableProps)
    })
})