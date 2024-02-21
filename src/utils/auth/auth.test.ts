import { Chance } from 'chance'
import { AuthorizationType, MethodOptions } from 'aws-cdk-lib/aws-apigateway'
import { requiresAuthorization } from './auth'

describe('Auth Util', () => {
	const chance = new Chance()

	it('should return requires authorization method options', async () => {
		const authorizer: any = { authorizerId: chance.guid() }
		const methodOptions: MethodOptions = requiresAuthorization(authorizer as any)

		expect(methodOptions).toStrictEqual({
			authorizationType: AuthorizationType.COGNITO,
			authorizer,
		})
	})
})
