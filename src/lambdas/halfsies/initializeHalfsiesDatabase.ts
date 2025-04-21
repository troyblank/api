import { CloudFormationCustomResourceEvent } from 'aws-lambda'
import { DynamoDB } from 'aws-sdk'
import { generateNewBalanceDbItem } from '../../utils'

export const handler = async (event: CloudFormationCustomResourceEvent) => {
	const { balanceTableName = '' } = process.env

	if (event.RequestType === 'Create') {
		const dynamoDb = new DynamoDB()

		const params = {
			TableName: balanceTableName,
			Item: generateNewBalanceDbItem(0),
		}

		await dynamoDb.putItem(params).promise()
	}
}
