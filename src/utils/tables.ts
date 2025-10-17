import { DynamoDBClient } from "@aws-sdk/client-dynamodb"
import { BatchWriteCommand, DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb"
import { BillingMode, Table } from 'aws-cdk-lib/aws-dynamodb'
import { CreateTableType } from '../types'

// This is a chunk size restriction from DynamoDB for batch operations
const DYNAMO_CHUNK_SIZE_LIMIT = 25

export const createTable = ({ name, primaryKey, stack, type }: CreateTableType): Table =>
	new Table(stack, name, {
		partitionKey: {
			name: primaryKey,
			type: type,
		},
		billingMode: BillingMode.PAY_PER_REQUEST,
	})

export const deleteItems = async ({
	tableName,
	keys,
}: {
	tableName: string
	keys: number[]
}) => {
	const dynamoDbClient = new DynamoDBClient()
	const dynamoDocumentClient = DynamoDBDocumentClient.from(dynamoDbClient)
	const idKeys = keys.map((key) => ({ id: key }))

	const chunks = []
	for (let i = 0; i < idKeys.length; i += DYNAMO_CHUNK_SIZE_LIMIT) {
		chunks.push(idKeys.slice(i, i + DYNAMO_CHUNK_SIZE_LIMIT))
	}

	for (const chunk of chunks) {
		await dynamoDocumentClient.send(new BatchWriteCommand({
			RequestItems: {
				[tableName]: chunk.map((key) => ({
					DeleteRequest: { Key: key },
				})),
			},
		}))
	}
}