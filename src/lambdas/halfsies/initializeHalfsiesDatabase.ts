import { CloudFormationCustomResourceEvent } from 'aws-lambda'
import { DynamoDB } from 'aws-sdk'
import { generateNewBalanceDbItem, sendCustomResourceLambdaResponse } from '../../utils'

export const handler = async (event: CloudFormationCustomResourceEvent) => {
	const { balanceTableName = '' } = process.env

	if (event.RequestType === 'Create') {
		const dynamoDb = new DynamoDB()

		const params = {
			TableName: balanceTableName,
			Item: generateNewBalanceDbItem(0),
			// Ensures the value is only inserted if it doesn't already exist.
			ConditionExpression: 'attribute_not_exists(id)',
		}

		try {
			await dynamoDb.putItem(params).promise()
		} catch (error: any) {
			if (error.code === 'ConditionalCheckFailedException') {
				// This error is expected on any stack update where the balance db has data already.
				// eslint-disable-next-line no-console
				console.warn('Halfsies balance amount already exists, skipping initialization.')
			} else {
				throw new Error(error)
			}
		}

		await sendCustomResourceLambdaResponse(event, true)
	}
}
