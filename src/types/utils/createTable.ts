import { AttributeType } from 'aws-cdk-lib/aws-dynamodb'
import { Stack } from 'aws-cdk-lib'

export type CreateTableType = {
	name: string,
	primaryKey: string,
	stack: Stack,
	type: AttributeType.STRING | AttributeType.NUMBER
}