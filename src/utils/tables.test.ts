import { Chance } from 'chance'
import { Stack } from 'aws-cdk-lib'
import * as AwsDynamodb from 'aws-cdk-lib/aws-dynamodb'
import { CreateTableType } from '../types'
import * as Tables from './'

describe('Create Table', () => {
    const chance = new Chance()
    const SomeStack = new Stack()

    it('should be able to create a table', async () => {
        jest.spyOn(Tables, 'createTable')

        const createTableProps: CreateTableType = {
            name: chance.string(),
            primaryKey: chance.string(),
            stack: SomeStack,
            type: AwsDynamodb.AttributeType.STRING
        }

        Tables.createTable(createTableProps)

        expect(Tables.createTable).toBeCalledWith(createTableProps)
    })
})