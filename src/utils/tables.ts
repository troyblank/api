import { Table } from 'aws-cdk-lib/aws-dynamodb'
import { CreateTableType } from '../types'

export const createTable = ({ name, primaryKey, stack, type }: CreateTableType): void => {
    new Table(stack, name, {
        partitionKey: {
            name: primaryKey,
            type: type
        }
    })
}