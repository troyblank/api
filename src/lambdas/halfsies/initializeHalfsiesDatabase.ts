import { type CloudFormationCustomResourceEvent } from 'aws-lambda'
import {
	DynamoDBClient,
	PutItemCommand,
	PutItemCommandInput,
	ConditionalCheckFailedException,
} from '@aws-sdk/client-dynamodb'
import { sendCustomResourceLambdaResponse } from '../../utils/lambdas'
import { generateNewBalanceDbItem} from '../../utils/halfsies'

export const handler = async (event: CloudFormationCustomResourceEvent) => {
	const dynamoDbClient = new DynamoDBClient()
	const { balanceTableName = '' } = process.env

	if (event.RequestType === 'Create') {
		const params: PutItemCommandInput = {
			TableName: balanceTableName,
			Item: generateNewBalanceDbItem(0),
			ConditionExpression: 'attribute_not_exists(id)',
		}

		try {
			await dynamoDbClient.send(new PutItemCommand(params))
		} catch (error) {
			if (error instanceof ConditionalCheckFailedException) {
				// eslint-disable-next-line no-console
				console.warn('Halfsies balance amount already exists, skipping initialization.')
			} else {
				throw new Error((error as Error).message)
			}
		}

		await sendCustomResourceLambdaResponse(event, true)
	}
}
