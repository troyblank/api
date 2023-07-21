import { Chance } from 'chance'
import { AuthorizationType, MethodOptions } from 'aws-cdk-lib/aws-apigateway'
import { requiresAuthorization } from './auth'

describe('Auth Util', () => {
	const chance = new Chance()

	it('should return requires authorization method options', async () => {
		const authorizerId: number = chance.natural()
		const methodOptions: MethodOptions = requiresAuthorization({ authorizerId } as any)

		expect(methodOptions).toStrictEqual({
			authorizationType: AuthorizationType.COGNITO,
			authorizer: { authorizerId },
		})
	})
})
