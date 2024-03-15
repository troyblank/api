import { Chance } from 'chance'
import { AuthorizationType, MethodOptions } from 'aws-cdk-lib/aws-apigateway'
import { MAIN_USER_NAME } from '../../../config'
import { isUserNameTheMainUserName, requiresAuthorization } from './auth'

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

	it('should be able to determine if the userName is the main userName', async () => {
		expect(isUserNameTheMainUserName(MAIN_USER_NAME)).toBe(true)
		expect(isUserNameTheMainUserName(chance.word({ syllables: 4 }))).toBe(false)
	})
})
