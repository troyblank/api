import { MockIntegration } from 'aws-cdk-lib/aws-apigateway'
import { Chance } from 'chance'
import { addCorsOptions } from './apiGateway'

jest.mock('aws-cdk-lib/aws-apigateway', () => {
	const actual = jest.requireActual('aws-cdk-lib/aws-apigateway')
	return {
		...actual,
		MockIntegration: jest.fn().mockImplementation((props) => ({ __props: props })),
	}
})

describe('API Gateway Utils', () => {
	const chance = new Chance()

	it('Should add an OPTIONS method with proper CORS headers.', () => {
		const addMethod = jest.fn()
		const mockResource = { addMethod: addMethod } as any
		const origin = chance.url()

		addCorsOptions(mockResource, origin)

		expect(addMethod).toHaveBeenCalledTimes(1)

		const [method, integration, methodOptions] = addMethod.mock.calls[0]

		expect(method).toBe('OPTIONS')

		const integrationProps = (integration as any).__props

		expect(MockIntegration).toHaveBeenCalledTimes(1)
		expect(integrationProps.integrationResponses[0].statusCode).toBe('200')
		expect(integrationProps.integrationResponses[0].responseParameters).toMatchObject({
			'method.response.header.Access-Control-Allow-Headers': `'Content-Type,X-Amz-Date,Authorization,X-Api-Key'`,
			'method.response.header.Access-Control-Allow-Origin': `'${origin}'`,
			'method.response.header.Access-Control-Allow-Methods': `'GET,POST,OPTIONS'`,
		})
		expect(integrationProps.requestTemplates).toMatchObject({
			'application/json': '{"statusCode": 200}',
		})
		expect(methodOptions.methodResponses[0]).toMatchObject({
			statusCode: '200',
			responseParameters: {
				'method.response.header.Access-Control-Allow-Headers': true,
				'method.response.header.Access-Control-Allow-Origin': true,
				'method.response.header.Access-Control-Allow-Methods': true,
			},
		})
	})
})
