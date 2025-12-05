import { Resource, MockIntegration } from 'aws-cdk-lib/aws-apigateway'

export function addCorsOptions(resource: Resource, accessControlAllowOrigin: string): void {
	resource.addMethod(
		'OPTIONS',
		new MockIntegration({
			integrationResponses: [
				{
					statusCode: '200',
					responseParameters: {
						'method.response.header.Access-Control-Allow-Headers': `'Content-Type,X-Amz-Date,Authorization,X-Api-Key'`,
						'method.response.header.Access-Control-Allow-Origin': `'${accessControlAllowOrigin}'`,
						'method.response.header.Access-Control-Allow-Methods': `'GET,POST,DELETE,OPTIONS'`,
					},
				},
			],
			requestTemplates: {
				'application/json': '{"statusCode": 200}',
			},
		}),
		{
			methodResponses: [
				{
					statusCode: '200',
					responseParameters: {
						'method.response.header.Access-Control-Allow-Headers': true,
						'method.response.header.Access-Control-Allow-Origin': true,
						'method.response.header.Access-Control-Allow-Methods': true,
					},
				},
			],
		},
	)
}
