// THIS NEEDS UNIT TESTING
import { CloudFormationCustomResourceEvent } from 'aws-lambda'
import { request } from 'https'

// When using lambdas as custom resources in CloudFormation, you must return a response to the custom resource request.
// This is done by sending a response to the URL provided in the event object.
// The following util function handles allows for this.
export const sendCustomResourceLambdaResponse = async (
	event: CloudFormationCustomResourceEvent,
	isSuccess: boolean,
	errorMessage?: string,
) => {
	const physicalResourceId = 'PhysicalResourceId' in event
		? event.PhysicalResourceId
		: event.LogicalResourceId

	const data: { error?: string } = errorMessage ? { error: errorMessage } : {}

	const responseBody = JSON.stringify({
		Status: isSuccess ? 'SUCCESS' : 'FAILED',
		Reason: !isSuccess ? JSON.stringify(data) : 'See CloudWatch Logs',
		PhysicalResourceId: physicalResourceId,
		StackId: event.StackId,
		RequestId: event.RequestId,
		LogicalResourceId: event.LogicalResourceId,
		Data: data,
	})

	await new Promise<void>((resolve, reject) => {
		const { hostname, pathname, search } = new URL(event.ResponseURL)

		const req = request(
			{
				hostname: hostname,
				path: `${pathname}${search}`,
				method: 'PUT',
				headers: {
					'Content-Type': '', // CloudFormation expects this to be an empty string
					'Content-Length': Buffer.byteLength(responseBody).toString(),
				},
			}, ({ on }: any) => {
				on('end', resolve)
			},
		)

		req.on('error', reject)
		req.write(responseBody)
		req.end()
	})
}
